/**
 * Asserts the populated dashboard preview does not scroll horizontally.
 * Requires the dev server (npm run dev) and Google Chrome.
 *
 *   node scripts/check-dashboard-overflow.mjs
 *   DASHBOARD_PREVIEW_URL=http://localhost:3000/dev/dashboard-preview node scripts/check-dashboard-overflow.mjs
 */
import { spawn } from "node:child_process"
import { existsSync } from "node:fs"
import os from "node:os"
import path from "node:path"

const WIDTHS = [320, 360, 390, 414, 768, 1024, 1280, 1440]
const TABS = ["squads", "inbox", "availability", "achievements", "settings"]
const BASE = process.env.DASHBOARD_PREVIEW_URL ?? "http://localhost:3000/dev/dashboard-preview"

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function resolveChromeBinary() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH
  }
  const candidates =
    process.platform === "win32"
      ? [
          path.join(process.env.PROGRAMFILES ?? "C:\\Program Files", "Google", "Chrome", "Application", "chrome.exe"),
          path.join(process.env["PROGRAMFILES(X86)"] ?? "C:\\Program Files (x86)", "Google", "Chrome", "Application", "chrome.exe"),
          path.join(process.env.LOCALAPPDATA ?? "", "Google", "Chrome", "Application", "chrome.exe"),
        ]
      : process.platform === "darwin"
        ? ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"]
        : ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]

  for (const candidate of candidates) {
    if (!candidate) continue
    if (candidate.includes(path.sep) || candidate.includes("/")) {
      if (existsSync(candidate)) return candidate
    } else {
      return candidate
    }
  }
  return process.platform === "win32" ? "chrome" : "google-chrome"
}

async function waitForJson(url) {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(url)
      if (res.ok) return await res.json()
    } catch {
      // chrome still starting
    }
    await sleep(150)
  }
  throw new Error(`Chrome debugger not ready at ${url}`)
}

const MEASURE = `(() => {
  const width = window.innerWidth
  const scrollWidth = document.documentElement.scrollWidth
  const offenders = []
  for (const el of document.querySelectorAll("body *")) {
    const style = getComputedStyle(el)
    if (style.display === "none" || style.visibility === "hidden") continue
    const rect = el.getBoundingClientRect()
    if (rect.width < 1 || rect.height < 1) continue
    if (rect.right <= width + 1 && rect.left >= -1) continue
    let parent = el.parentElement
    let clippedLocally = false
    while (parent && parent !== document.body) {
      const ps = getComputedStyle(parent)
      const clips = ["hidden", "clip", "scroll", "auto"].includes(ps.overflowX)
      if (clips) {
        const pr = parent.getBoundingClientRect()
        if (pr.width < width - 8 && pr.left >= -1 && pr.right <= width + 1) {
          clippedLocally = true
          break
        }
      }
      parent = parent.parentElement
    }
    if (clippedLocally) continue
    offenders.push((el.innerText || el.tagName).replace(/\\s+/g, " ").trim().slice(0, 70))
    if (offenders.length >= 5) break
  }
  return { width, scrollWidth, overflow: scrollWidth > width + 1, offenders }
})()`

const chromeBin = resolveChromeBinary()
const userDataDir = path.join(os.tmpdir(), "chrome-dashboard-overflow")
const chrome = spawn(
  chromeBin,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--remote-debugging-port=9333",
    `--user-data-dir=${userDataDir}`,
    "about:blank",
  ],
  { stdio: "ignore" },
)

let failed = 0
try {
  const version = await waitForJson("http://127.0.0.1:9333/json/version")
  const browser = new WebSocket(version.webSocketDebuggerUrl)
  let id = 0
  const pending = new Map()
  browser.onmessage = (event) => {
    const msg = JSON.parse(event.data)
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg)
      pending.delete(msg.id)
    }
  }
  await new Promise((resolve, reject) => {
    browser.onopen = resolve
    browser.onerror = reject
  })
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const msgId = ++id
      pending.set(msgId, (msg) => (msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result)))
      const payload = { id: msgId, method, params }
      if (sessionId) payload.sessionId = sessionId
      browser.send(JSON.stringify(payload))
    })

  const { targetId } = await send("Target.createTarget", { url: "about:blank" })
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true })
  await send("Page.enable", {}, sessionId)

  for (const width of WIDTHS) {
    await send(
      "Emulation.setDeviceMetricsOverride",
      { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 },
      sessionId,
    )
    for (const tab of TABS) {
      const url = `${BASE}?tab=${tab}`
      await send("Page.navigate", { url }, sessionId)
      await sleep(1600)
      const evaled = await send("Runtime.evaluate", { expression: MEASURE, returnByValue: true }, sessionId)
      const value = evaled.result?.value
      const bad = !value || value.overflow || (value.offenders?.length ?? 0) > 0
      if (bad) failed += 1
      console.log(
        `${bad ? "OVERFLOW" : "ok"} ${width} ${tab} scroll=${value?.scrollWidth}/${value?.width}`,
      )
      if (bad && value?.offenders?.length) console.log(" ", value.offenders.join(" | "))
    }
  }
} finally {
  chrome.kill("SIGKILL")
}

if (failed > 0) {
  console.error(`Horizontal overflow on ${failed} viewport/tab pair(s).`)
  process.exit(1)
}
console.log("No horizontal overflow.")
