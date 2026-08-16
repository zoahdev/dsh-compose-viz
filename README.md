# dsh-compose-viz — make "everything is a plugin" visible

Render a DeepSeek Harness **agent-preset composition** as a readable HTML tree: groups, `isolate` realms, and every tool/service row, straight from `agent.cordis.yml`. Handles the `!!js` expression dialect (neutralized for structure-only parsing).

```sh
node bin/compose-viz.mjs <agent.cordis.yml> --out viz.html
```

Example against the official `standard` preset:

```sh
node bin/compose-viz.mjs apps/cli/config/agent-presets/standard/agent.cordis.yml
```

This is the visualization sibling to `dsh-sandbox-audit` (which flags policy inconsistencies): compose-viz shows *what is wired*, sandbox-audit shows *whether the wiring is safe*.

---

# dsh-compose-viz — 让"一切皆插件"看得见

把 DeepSeek Harness 的 agent-preset 组合渲染成可读的 HTML 树：group、`isolate` realm、每个工具/服务行，直接读 `agent.cordis.yml`。兼容 `!!js` 表达式（结构解析时安全中和）。

```sh
node bin/compose-viz.mjs <agent.cordis.yml> --out viz.html
```
