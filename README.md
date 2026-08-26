# mcp-fcc

FCC public geo/census APIs (geo.fcc.gov) MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `census_block` | Resolve a US latitude/longitude (decimal degrees) to its Census block, county, and state FIPS codes and names. Returns the 15-digit block FIPS, 5-digit county FIPS, 2-digit state FIPS, state code/name, and a bounding box. Pairs with the US Census API (FIPS codes are its join keys). Coordinates outside the US yield null FIPS values. |
| `census_area` | Resolve a US latitude/longitude (decimal degrees) to its full Census area record: block/county/state FIPS + names plus 2020 block population and FCC market-area codes (BEA, BTA, CMA, EAG, MEA, MTA, PEA, REA, RPC, VPC). Richer than census_block; use when you need population or FCC licensing market codes for a point. |
| `county_for_point` | Lightweight reverse geocode: return just the county and state for a US latitude/longitude (decimal degrees) — county FIPS + name, state FIPS + code + name. Convenience wrapper over the FCC block-find service for when you only need the containing county/state, not the full block record. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "fcc": {
      "url": "https://gateway.pipeworx.io/fcc/mcp"
    }
  }
}
```

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/fcc/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Fcc data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
