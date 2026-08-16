#!/usr/bin/env node
import { writeFileSync } from 'node:fs'
import { composeVizFile } from '../lib/compose-viz.js'

function usage() {
  process.stderr.write(`dsh-compose-viz — render a DSH agent-preset composition as HTML

Usage:
  dsh-compose-viz <agent.cordis.yml> [--out viz.html]
`)
  process.exit(2)
}

const args = process.argv.slice(2)
const file = args.find(a => !a.startsWith('--'))
if (!file || args.includes('--help') || args.includes('-h')) usage()

const outIdx = args.indexOf('--out')
const out = outIdx !== -1 ? args[outIdx + 1] : 'composition.html'
const { html } = composeVizFile(file)
writeFileSync(out, html)
process.stdout.write(`${out}\n`)
