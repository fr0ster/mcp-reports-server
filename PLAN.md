# Development Plan: `@mcp-abap-adt/reports-server`

**Domain-neutral** MCP server + reusable library of report-building
primitives. Not coupled to Cloud ALM, ADT, or any specific data source —
it operates on generic tabular JSON, so the LLM can combine it with any
data-fetching MCP server (`calm-server`, ADT tools, Jira, custom, …).

## Motivation

When an LLM plans a report ("open features grouped by priority for
project X"), the pipeline is always the same shape:

```
fetch data  →  transform  →  aggregate  →  render
  (CALM MCP)   (reports MCP) (reports MCP) (reports MCP)
```

Everything after `fetch` is domain-agnostic. Grouping, pivoting, joining,
rendering to Markdown/CSV/HTML — this should live in ONE place and serve
any data source. That is this package.

## Design principles

1. **Domain-neutral.** Primitives operate on `Record<string, unknown>[]`
   (arrays of flat objects) — the same shape every MCP tool returns.
   Zero imports from `calm-client`, ADT, or anything SAP-specific.
2. **Pure functions.** Every primitive is deterministic, side-effect-free,
   unit-testable with literals. No network, no disk, no mutation.
3. **LLM-composable.** Each tool does one thing well. The LLM chains
   them: `list` → `join` → `group_by` → `to_markdown_table`.
4. **Token-economical.** Renderers produce compact output (the LLM's
   response budget is precious). Primitives trim unused columns before
   rendering.
5. **Dual export.** Same pattern as `calm-server`: `bin: reports-mcp`
   runnable standalone, plus subpath exports (`./primitives`,
   `./renderers`, `./registry`) for embedding in larger composed MCP
   servers.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ LLM                                                             │
└─────────────────────────────────────────────────────────────────┘
          │ 1. tool call A (e.g., calm_features_list)
          │ 2. tool call B (reports_join)
          │ 3. tool call C (reports_group_by)
          │ 4. tool call D (reports_to_markdown_table)
          ▼
┌─────────────────────────────────────────────────────────────────┐
│ reports-mcp stdio/SSE server                                    │
│   HandlerContext: none domain-specific; logger only             │
│   ReportsToolRegistry binds primitives → tools                  │
└─────────────────────────────────────────────────────────────────┘
          │ primitive(data, opts)
          ▼
┌─────────────────────────────────────────────────────────────────┐
│ Primitives (src/primitives/*)                 Renderers (src/*) │
│   - group_by, pivot, join, sort, filter         - to_csv        │
│   - aggregate (count/sum/avg/min/max/p50/p95)   - to_markdown   │
│   - select_columns, rename_columns, coalesce    - to_html       │
│   - unique, count, top_n, distribution          - summary_stats │
└─────────────────────────────────────────────────────────────────┘
```

## Directory layout

```
src/
  primitives/
    groupBy.ts
    pivot.ts
    join.ts
    sort.ts
    filter.ts
    aggregate.ts              (count/sum/avg/min/max/p50/p95 under one tool)
    selectColumns.ts
    renameColumns.ts
    coalesce.ts
    unique.ts
    topN.ts
    distribution.ts
    index.ts                  ← PRIMITIVES = [...]
  renderers/
    toCsv.ts
    toMarkdownTable.ts
    toHtmlTable.ts
    summaryStats.ts
    index.ts                  ← RENDERERS = [...]
  registry/
    types.ts                  ← IReportsTool, IReportsToolContext
    ReportsToolRegistry.ts
    index.ts
  server/
    ReportsMcpServer.ts
    config.ts
    index.ts
  bin/
    stdio.ts
  __tests__/
    unit/
  index.ts                    ← public lib API (primitives + renderers + registry)
```

## Tool shape

```ts
// src/registry/types.ts
import type { ILogger } from '@mcp-abap-adt/interfaces';

export interface IReportsToolContext {
  logger?: ILogger;
}

export interface IReportsTool<TParams = unknown, TResult = unknown> {
  name: string;
  description: string;
  inputSchema: object;
  handler: (ctx: IReportsToolContext, params: TParams) => Promise<TResult>;
}
```

Handlers are `async` for uniformity with `calm-server`, but primitives
themselves are synchronous under the hood — wrapped with `async` only at
the tool boundary.

## Initial tool surface (planning target — ~14 tools)

### Primitives (data transformation)

| Tool | Input | Output | Purpose |
|---|---|---|---|
| `reports_group_by` | `{ data, key }` | `{ groups: { [k]: rows[] } }` | Group rows by a key |
| `reports_aggregate` | `{ data, groupBy?, valueKey?, op }` | scalar or map | count / sum / avg / min / max / p50 / p95 |
| `reports_pivot` | `{ data, rowKey, colKey, valueKey, op }` | 2D matrix | Pivot table |
| `reports_join` | `{ left, right, leftKey, rightKey, type }` | joined rows | Inner / left / right / full join |
| `reports_sort` | `{ data, key, order }` | sorted rows | |
| `reports_filter` | `{ data, predicateSpec }` | filtered rows | Simple DSL: `{field,op,value}[]` |
| `reports_select_columns` | `{ data, columns }` | trimmed rows | Project columns |
| `reports_rename_columns` | `{ data, mapping }` | renamed rows | |
| `reports_unique` | `{ data, key? }` | unique values | |
| `reports_top_n` | `{ data, key, n, order }` | top rows | Compact "top K" |
| `reports_distribution` | `{ data, key }` | `{ [v]: count }` | Categorical distribution |

### Renderers (output formatting)

| Tool | Output | Purpose |
|---|---|---|
| `reports_to_csv` | string | CSV with configurable delimiter / quoting |
| `reports_to_markdown_table` | string | GitHub-flavored Markdown table |
| `reports_to_html_table` | string | Simple `<table>` — for email / HTML reports |
| `reports_summary_stats` | object | min/max/avg/p50/p95 for numeric column |

## MCP SDK

Same as `calm-server`: `@modelcontextprotocol/sdk`. `BaseMcpServer`
subclass (ReportsMcpServer) with trivial context (no connection, just
logger).

## Runtime config (standalone mode)

Minimal — no auth, no external service. `.env`:

```
REPORTS_LOG_LEVEL=info
DEBUG_REPORTS_TOOLS=true
```

That's it.

## Open decisions

1. **Shared `IMcpTool` contract?** If we move to a unified tool
   interface in `@mcp-abap-adt/interfaces`, `IReportsTool` becomes
   `IMcpTool<IReportsToolContext, TParams, TResult>`. Decide together
   with the same question in `calm-server` PLAN.md.
2. **Filter DSL shape.** Keep predicates machine-readable for the LLM
   (`[{ field, op: 'eq'|'gt'|'in'|…, value }]`) rather than string
   expressions. Final syntax TBD on first real use-case.
3. **Pandas-ish or custom?** Do NOT depend on `dataframe-js` or
   similar — keep primitives ~50 LOC each, hand-rolled. Less magic,
   smaller bundle, no version conflicts in the MCP host.
4. **Size limits.** Pivots and joins can explode combinatorially.
   Per-tool `maxRows` param (default 10_000) with clear error if
   exceeded. Add in M3.

## Milestones

| # | Milestone | Criteria |
|---|---|---|
| M1 | Scaffold + contract | package.json, configs, `IReportsTool` in registry, empty modules. |
| M2 | Three primitives + renderer | `group_by`, `aggregate`, `select_columns` + `to_markdown_table`, unit-tested with literal JSON. |
| M3 | Full primitive set | All 11 primitives, size-limit guards, unit tests. |
| M4 | Full renderer set | CSV/MD/HTML + summary stats. |
| M5 | Standalone server | `bin/stdio.ts`, server + config, end-to-end demo (chain 3-4 tools). |
| M6 | 0.1.0 release | README with real-world example (calm-server + reports-server composition), CHANGELOG, npm publish. |

## Non-goals (explicit)

- **Not a data source.** Does not fetch from SAP, Jira, or anywhere.
  LLM brings its own data via other MCP tools; reports-mcp only
  transforms what's passed in.
- **Not a full query engine.** No SQL, no complex DSL, no temporal
  windows beyond what aggregate provides. For serious analytics, push
  data into a real engine (DuckDB, BigQuery) — this is for lightweight,
  interactive reports.
- **Not a layout engine.** Renderers produce text (CSV/MD/HTML tables).
  Complex PDF layouts, styled Excel, dashboards — out of scope; the LLM
  can hand Markdown/HTML to downstream tools (email, wiki, print).
- **No state.** Every call is stateless. No session, no caching. The
  LLM holds intermediate results across tool calls in its context.
