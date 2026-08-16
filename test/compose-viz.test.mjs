import test from 'node:test'
import assert from 'node:assert/strict'
import { composeVizFile } from '../lib/compose-viz.js'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

test('parses a preset with groups, isolate realms, and disabled rows', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-compose-viz-'))
  const file = join(dir, 'agent.cordis.yml')
  try {
    writeFileSync(file, [
      '- id: persona',
      "  name: '@deepseek-ai/dsh-persona'",
      '- id: filesystem',
      '  name: cordis:group',
      '  group: true',
      '  isolate:',
      '    fs: true',
      '  config:',
      '    - id: fs-local',
      "      name: '@deepseek-ai/dsh-fs-local'",
      '    - id: str-replace-editor',
      "      name: '@deepseek-ai/dsh-tool-str-replace-editor'",
      '- id: tool-web',
      "  name: '@deepseek-ai/dsh-tool-web'",
      '  disabled: true',
      '  config:',
      '    fetch: !!js process.env.DSH_WEB_FETCH === "true"',
      '',
    ].join('\n'))
    const { rows, html } = composeVizFile(file)
    assert.equal(rows.length, 3)
    assert.equal(rows[0].id, 'persona')
    assert.equal(rows[1].isGroup, true)
    assert.deepEqual(rows[1].isolate, ['fs'])
    assert.equal(rows[1].children.length, 2)
    assert.equal(rows[2].disabled, true)
    assert.ok(html.includes('str-replace-editor'))
    assert.ok(html.includes('isolate: fs'))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
