# mcp-fcc

FCC public geo/census APIs (geo.fcc.gov) MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

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

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Fcc data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
