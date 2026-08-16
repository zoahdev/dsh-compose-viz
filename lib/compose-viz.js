/**
 * dsh-compose-viz: parse a DeepSeek Harness agent-preset composition and render
 * its structure (groups, isolate realms, and every tool/service row) as HTML.
 *
 * @module dsh-compose-viz
 */

import { readFileSync } from 'node:fs'
import { parse } from 'yaml'

/** Neutralize `!!js` scalars so the YAML parser sees plain strings. */
function neutralizeJs(text) {
  return text.replace(/!!js\s*([^\n#]+)/g, (_m, expr) => JSON.stringify(expr.trim()))
}

function parseComposition(text) {
  const rows = parse(neutralizeJs(text)) ?? []
  if (!Array.isArray(rows)) throw new Error('agent.cordis.yml must be a top-level YAML array')
  return rows.map(normalizeRow)
}

function normalizeRow(row) {
  const id = typeof row.id === 'string' ? row.id : '(unnamed)'
  const name = typeof row.name === 'string' ? row.name : ''
  const isGroup = name === 'cordis:group' || row.group === true
  const isolate = row.isolate && typeof row.isolate === 'object' ? Object.keys(row.isolate) : []
  const disabled = row.disabled === true
  const children = isGroup && Array.isArray(row.config) ? row.config.map(normalizeRow) : []
  return { id, name, isGroup, isolate, disabled, children }
}

function esc(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function renderRow(row, depth) {
  const pad = depth * 20
  const cls = row.disabled ? 'row disabled' : 'row'
  const label = row.isGroup
    ? `<span class="gid">${esc(row.id)}</span>${row.isolate.length ? ` <span class="isolate">isolate: ${row.isolate.map(esc).join(', ')}</span>` : ''}`
    : `<span class="rid">${esc(row.id)}</span> → <code>${esc(row.name || '(no name)')}</code>`
  const kids = row.children.map(c => renderRow(c, depth + 1)).join('')
  return `<div class="${cls}" style="margin-left:${pad}px">${label}${row.disabled ? ' <span class="off">disabled</span>' : ''}</div>${kids}`
}

export function renderHtml(rows, source) {
  const body = rows.map(r => renderRow(r, 0)).join('')
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>composition · dsh-compose-viz</title>
<style>
  :root{color-scheme:dark} body{margin:0;font:14px/1.5 -apple-system,Segoe UI,Roboto,monospace;background:#0d1117;color:#e6edf3}
  header{padding:18px 24px;border-bottom:1px solid #30363d;background:#161b22}
  h1{margin:0 0 6px;font-size:18px} .src{font-size:12px;color:#8b949e}
  main{max-width:1000px;margin:0 auto;padding:24px}
  .row{padding:3px 0;border-left:2px solid #30363d;padding-left:10px;margin-bottom:2px}
  .gid{color:#58a6ff;font-weight:600}
  .rid{color:#d2a8ff}
  .isolate{color:#d29922;font-size:12px}
  code{font-family:ui-monospace,Menlo,Consolas,monospace}
  .disabled{opacity:.45} .off{color:#f85149;font-size:11px}
</style></head><body>
<header><h1>agent-preset composition</h1><div class="src">${esc(source)}</div></header>
<main>${body}</main></body></html>\n`
}

export function composeVizFile(file) {
  const text = readFileSync(file, 'utf8')
  const rows = parseComposition(text)
  return { rows, html: renderHtml(rows, file) }
}
