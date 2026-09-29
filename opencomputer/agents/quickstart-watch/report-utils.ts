export type Finding = { category: "bug" | "docs_mismatch" | "friction"; severity: "low" | "medium" | "high"; confidence: number; title: string; summary: string; evidence: string; surface: string };
export function redact(text: string) {
  return text.replace(/\b(Bearer\s+)[^\s"']+/gi, "$1[REDACTED]")
    .replace(/\b((?:api[_-]?key|token|secret|password|authorization|cookie)\s*[=:]\s*)[^\s,;]+/gi, "$1[REDACTED]")
    .replace(/\b(?:sk-|osb_|am_)[A-Za-z0-9_-]{12,}/g, "[REDACTED]");
}
