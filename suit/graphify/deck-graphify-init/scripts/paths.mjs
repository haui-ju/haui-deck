/**
 * Path containment helpers for haui-deck graphify (shared by memory.mjs and consumer runner).
 */
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
