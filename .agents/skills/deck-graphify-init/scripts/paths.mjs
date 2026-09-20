/**
 * Path containment helpers for haui-deck graphify (shared by memory.mjs and consumer runner).
 */
import fs from "node:fs";
import path from "node:path";

export const ID_RE = /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/;

/** True if absPath is inside root (or equal). */
export function isInsideRoot(root, absPath) {
  const rootAbs = path.resolve(root);
  const target = path.resolve(absPath);
  const rel = path.relative(rootAbs, target);
  return rel === "" || (!rel.startsWith("..") && !path.isAbsolute(rel));
}

export function assertInsideRoot(root, absPath, label = "path") {
  if (!isInsideRoot(root, absPath)) {
    throw new Error(`${label} fuera del proyecto: ${absPath}`);
  }
  return path.resolve(absPath);
}

export function normalizeScope(scope) {
  if (!scope || scope === "." || scope === "./") return ".";
  return String(scope).replace(/\\/g, "/").replace(/\/+$/, "") || ".";
}

/**
 * Normalize scope relative to project root. Rejects escapes and abs outside root.
 */
export function resolveScope(root, scopeArg) {
  const raw = scopeArg == null || scopeArg === "" ? "." : String(scopeArg);
  const trimmed = raw.replace(/\\/g, "/").replace(/\/+$/, "") || ".";

  if (trimmed === "." || trimmed === "./") {
    return { scope: ".", abs: path.resolve(root) };
  }

  const parts = trimmed.split("/").filter((p) => p && p !== ".");
  if (parts.some((p) => p === "..")) {
    throw new Error(`scope inválido (contiene ..): ${raw}`);
  }

  let abs;
  if (path.isAbsolute(raw)) {
    abs = path.resolve(raw);
    assertInsideRoot(root, abs, "scope");
  } else {
    abs = path.resolve(root, trimmed);
    assertInsideRoot(root, abs, "scope");
  }

  const rel = path.relative(path.resolve(root), abs);
  const scope = rel === "" ? "." : rel.split(path.sep).join("/");
  if (scope.startsWith("..")) {
    throw new Error(`scope fuera del proyecto: ${raw}`);
  }
  return { scope, abs };
}

export function resolveArtifactRel(root, relPath, label = "artifact") {
  const rel = String(relPath).replace(/\\/g, "/");
  if (!rel || rel.split("/").includes("..")) {
    throw new Error(`${label} inválido: ${relPath}`);
  }
  const abs = path.resolve(root, rel);
  assertInsideRoot(root, abs, label);
  const out = path.relative(path.resolve(root), abs).split(path.sep).join("/");
  if (!out || out.startsWith("..")) {
    throw new Error(`${label} fuera del proyecto: ${relPath}`);
  }
  return { rel: out, abs };
}

/**
 * Like resolveArtifactRel, but if the path exists, also require realpath inside root.
 * Rejects symlinks whose target escapes the project.
 */
export function resolveArtifactRelForDelete(root, relPath, label = "artifact") {
  const { rel, abs } = resolveArtifactRel(root, relPath, label);
  let st;
  try {
    st = fs.lstatSync(abs);
  } catch {
    return { rel, abs };
  }

  let real;
  try {
    real = fs.realpathSync(abs);
  } catch {
    if (st.isSymbolicLink()) {
      const target = fs.readlinkSync(abs);
      real = path.isAbsolute(target)
        ? path.resolve(target)
        : path.resolve(path.dirname(abs), target);
    } else {
      return { rel, abs };
    }
  }
  assertInsideRoot(root, real, `${label} (realpath)`);
  return { rel, abs };
}

/**
 * Inspect how an artifact dir would be deleted (no FS mutation).
 * @returns {{ mode: 'rm'|'unlink'|'skip'|'missing', rel?: string, abs?: string, warning?: string }}
 */
export function inspectArtifactDelete(root, relPath, label = "artifact") {
  let rel;
  let abs;
  try {
    ({ rel, abs } = resolveArtifactRel(root, relPath, label));
  } catch (err) {
    return {
      mode: "skip",
      warning: `no se tocará FS (${err.message}); se quitará del config`,
    };
  }

  let st;
  try {
    st = fs.lstatSync(abs);
  } catch {
    return { mode: "missing", rel, abs };
  }

  let real;
  try {
    real = fs.realpathSync(abs);
  } catch {
    if (st.isSymbolicLink()) {
      const target = fs.readlinkSync(abs);
      real = path.isAbsolute(target)
        ? path.resolve(target)
        : path.resolve(path.dirname(abs), target);
    } else {
      return { mode: "rm", rel, abs };
    }
  }

  if (isInsideRoot(root, real)) {
    return { mode: "rm", rel, abs };
  }

  if (st.isSymbolicLink()) {
    return {
      mode: "unlink",
      rel,
      abs,
      warning: `symlink escapado: solo se eliminará el link (${rel}); target fuera intacto`,
    };
  }

  return {
    mode: "skip",
    rel,
    abs,
    warning: `realpath fuera del proyecto (${real}); no se tocará FS; se quitará del config`,
  };
}

/**
 * Delete artifact dir for remove/clear. Never touches targets outside root.
 * @returns {{ deleted: boolean, mode: string, rel?: string, abs?: string, warning?: string }}
 */
export function safeDeleteArtifactDir(root, relPath, label = "artifact") {
  const plan = inspectArtifactDelete(root, relPath, label);
  if (plan.mode === "skip" || plan.mode === "missing") {
    return { deleted: false, ...plan };
  }
  if (plan.mode === "unlink") {
    fs.unlinkSync(plan.abs);
    return { deleted: true, ...plan };
  }
  // mode === 'rm'
  fs.rmSync(plan.abs, { recursive: true, force: true });
  return { deleted: true, ...plan };
}

export function idFromScope(scope) {
  const s = normalizeScope(scope);
  if (s === ".") return "root";
  const parts = s.split("/").filter(Boolean);
  let base = (parts[parts.length - 1] || "block").replace(/[^a-zA-Z0-9_-]+/g, "-");
  base = base.replace(/^-+|-+$/g, "");
  if (!base || base === "-" || !ID_RE.test(base)) return "block";
  return base;
}

export function artifactsForScope(scope) {
  const s = normalizeScope(scope);
  const dir = s === "." ? "graphify-out" : path.posix.join(s, "graphify-out");
  return {
    dir,
    graph: path.posix.join(dir, "graph.json"),
    html: path.posix.join(dir, "graph.html"),
  };
}
