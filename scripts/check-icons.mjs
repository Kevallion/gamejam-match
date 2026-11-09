#!/usr/bin/env node
/**
 * Icon consistency lint.
 *
 * Walks components/** and app/** (.tsx) and reports:
 *  - emoji in JSX/TSX (landing excluded, it keeps its playful tone)
 *  - deprecated / off-system Lucide import names
 *  - off-scale icon sizes (size-2.5, 4.5, 7, 8, 10, 12) and h-N w-N pairs on Lucide usage
 *  - strokeWidth other than 2
 *  - raw Tailwind colour classes on icons (amber-500, violet-400, slate-400, emerald-*)
 *
 * Exit 1 when any issue is found.
 */
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, relative, sep } from "node:path"

const ROOT = process.cwd()
const SCAN_DIRS = ["components", "app"]
const SKIP_DIR_SEGMENTS = new Set(["node_modules", ".next"])
const EMOJI_EXEMPT_PREFIXES = [
  toPosix(join("components", "landing")) + "/",
  toPosix(join("app", "actions")) + "/",
]
/** Marketing pages and shadcn primitives keep their own scale. */
const SIZE_EXEMPT_PREFIXES = [
  toPosix(join("components", "landing")) + "/",
  toPosix(join("components", "ui")) + "/",
]

/** Lucide names that have a preferred replacement in lib/icons.ts. */
const DEPRECATED_LUCIDE = [
  "Loader2",
  "Loader2Icon",
  "AlertCircle",
  "AlertTriangle",
  "CheckCircle2",
  "XCircle",
  "Users2",
  "Users",
  "Code2",
  "MoreHorizontal",
  "Instagram",
  "Linkedin",
  "Facebook",
  "UserSearch",
  "BookUser",
  "UserPlus",
  "UserMinus",
  "UserCheck",
  "MailPlus",
  "SendHorizontal",
  "MessageSquareMore",
  "Settings2",
  "Clock3",
  "Pencil",
  "Languages",
  "RotateCw",
  "ShieldCheck",
  "ShieldAlert",
]
const DEPRECATED_SET = new Set(DEPRECATED_LUCIDE)

const FORBIDDEN_SIZES = ["2.5", "4.5", "7", "8", "10", "12"]
const FORBIDDEN_SIZE_RE = new RegExp(`(?<![\\w-])size-(${FORBIDDEN_SIZES.map(escapeRegex).join("|")})(?![\\w.])`)
const HW_PAIR_RE = /\b(?:h-\d+(?:\.\d+)?\s+w-\d+(?:\.\d+)?|w-\d+(?:\.\d+)?\s+h-\d+(?:\.\d+)?)\b/
const STROKE_RE = /strokeWidth=\{?\s*(["']?)([\d.]+)\1\s*\}?/g
const RAW_COLOR_RE = /\btext-(?:amber-500|violet-400|slate-400|emerald-\d{2,3})\b/

// Broad emoji coverage: pictographs, symbols, transport, flags, dingbats, keycap/variation selectors.
const EMOJI_RE =
  /(?:[\u{1F300}-\u{1FAFF}]|[\u{1F000}-\u{1F2FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{2600}-\u{27BF}]\u{FE0F}?|[\u{2B00}-\u{2BFF}]|[\u{2300}-\u{23FF}]\u{FE0F}?|\u{200D}|\u{FE0F})/u

/** Lucide component name heuristic: PascalCase JSX tag. */
const JSX_ICON_TAG_RE = /<([A-Z][A-Za-z0-9]*)\b/

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function toPosix(path) {
  return path.split(sep).join("/")
}

function walk(dir, out = []) {
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const entry of entries) {
    if (SKIP_DIR_SEGMENTS.has(entry)) continue
    const full = join(dir, entry)
    const stats = statSync(full)
    if (stats.isDirectory()) {
      walk(full, out)
      continue
    }
    if (entry.endsWith(".tsx")) out.push(full)
  }
  return out
}

/** Collect names imported from lucide-react (handles multi-line import blocks). */
function collectLucideImports(source) {
  const names = []
  const importRe = /import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*["']lucide-react["']/g
  let match
  while ((match = importRe.exec(source)) !== null) {
    const body = match[1]
    const startLine = source.slice(0, match.index).split("\n").length
    for (const rawSpec of body.split(",")) {
      const spec = rawSpec.trim().replace(/^type\s+/, "")
      if (!spec) continue
      const [imported] = spec.split(/\s+as\s+/)
      const name = imported.trim()
      const lineOffset = body.slice(0, body.indexOf(rawSpec)).split("\n").length - 1
      names.push({ name, line: startLine + lineOffset })
    }
  }
  return names
}

function isIconish(line, lucideNames) {
  const tag = line.match(JSX_ICON_TAG_RE)?.[1]
  if (tag && (lucideNames.has(tag) || tag.endsWith("Icon") || tag === "AppIcon")) return true
  // Attribute carried on an icon prop or an svg
  return /<svg\b|iconClass|icon=\{|Icon\b/.test(line)
}

function lintFile(file) {
  const rel = toPosix(relative(ROOT, file))
  const source = readFileSync(file, "utf8")
  const lines = source.split("\n")
  const issues = []
  const emojiExempt = EMOJI_EXEMPT_PREFIXES.some((prefix) => rel.startsWith(prefix))
  const sizeExempt = SIZE_EXEMPT_PREFIXES.some((prefix) => rel.startsWith(prefix))

  const lucideImports = collectLucideImports(source)
  const lucideNames = new Set(lucideImports.map((entry) => entry.name))

  for (const { name, line } of lucideImports) {
    if (DEPRECATED_SET.has(name)) {
      issues.push({ line, rule: "deprecated-lucide", detail: `"${name}" imported from lucide-react — use lib/icons.ts` })
    }
  }

  lines.forEach((text, index) => {
    const line = index + 1

    if (!emojiExempt && EMOJI_RE.test(text) && !/^\s*(\/\/|\*|\/\*)/.test(text)) {
      issues.push({ line, rule: "emoji", detail: text.trim().slice(0, 80) })
    }

    const iconish = isIconish(text, lucideNames)

    if (!sizeExempt && iconish && FORBIDDEN_SIZE_RE.test(text)) {
      issues.push({ line, rule: "icon-size", detail: `off-scale ${text.match(FORBIDDEN_SIZE_RE)[0]} (use size-3/3.5/4/5/6)` })
    }

    if (!sizeExempt && iconish && HW_PAIR_RE.test(text)) {
      issues.push({ line, rule: "icon-size", detail: `h-N w-N on icon → use size-N (${text.match(HW_PAIR_RE)[0]})` })
    }

    if (!sizeExempt) {
      let stroke
      STROKE_RE.lastIndex = 0
      while ((stroke = STROKE_RE.exec(text)) !== null) {
        if (Number(stroke[2]) !== 2) {
          issues.push({ line, rule: "stroke-width", detail: `strokeWidth=${stroke[2]} (only 2 allowed)` })
        }
      }
    }

    if (iconish && RAW_COLOR_RE.test(text)) {
      issues.push({ line, rule: "raw-color", detail: `${text.match(RAW_COLOR_RE)[0]} — use a token (teal/lavender/peach/pink/mint/muted)` })
    }
  })

  return issues.map((issue) => ({ ...issue, file: rel }))
}

function main() {
  const files = SCAN_DIRS.flatMap((dir) => walk(join(ROOT, dir)))
  const issues = files.flatMap(lintFile)

  if (issues.length === 0) {
    console.log(`✓ icons: ${files.length} files checked, no issues`)
    process.exit(0)
  }

  const byRule = new Map()
  for (const issue of issues) {
    byRule.set(issue.rule, (byRule.get(issue.rule) ?? 0) + 1)
  }

  issues.sort((a, b) => (a.file === b.file ? a.line - b.line : a.file.localeCompare(b.file)))
  for (const issue of issues) {
    console.log(`${issue.file}:${issue.line}  [${issue.rule}]  ${issue.detail}`)
  }

  console.log("")
  console.log(`✗ icons: ${issues.length} issue(s) in ${new Set(issues.map((i) => i.file)).size} file(s)`)
  for (const [rule, count] of [...byRule.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${rule}: ${count}`)
  }
  process.exit(1)
}

main()
