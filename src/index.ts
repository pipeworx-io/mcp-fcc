interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * FCC public geo/census APIs (geo.fcc.gov) MCP.
 *
 * Keyless. Converts US latitude/longitude (decimal degrees, WGS84) into
 * Census geography: state/county/block FIPS codes + names. These FIPS codes
 * are the join keys for the US Census Bureau API — use this pack to turn raw
 * coordinates into the geographic identifiers Census data is indexed by.
 * Coordinates outside the US return null FIPS fields with status "OK".
 */


const BASE = 'https://geo.fcc.gov/api/census';
const UA = 'pipeworx-mcp-fcc/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'census_block',
    description:
      'Resolve a US latitude/longitude (decimal degrees) to its Census block, county, and state FIPS codes and names. Returns the 15-digit block FIPS, 5-digit county FIPS, 2-digit state FIPS, state code/name, and a bounding box. Pairs with the US Census API (FIPS codes are its join keys). Coordinates outside the US yield null FIPS values.',
    inputSchema: {
      type: 'object',
      properties: {
        lat: { type: 'number', description: 'Latitude in decimal degrees (e.g. 38.8976).' },
        lon: { type: 'number', description: 'Longitude in decimal degrees (e.g. -77.0365).' },
        censusYear: {
          type: 'string',
          description: 'Census vintage for the block geography: "2020" (default) or "2010".',
          enum: ['2010', '2020'],
        },
      },
      required: ['lat', 'lon'],
    },
  },
  {
    name: 'census_area',
    description:
      'Resolve a US latitude/longitude (decimal degrees) to its full Census area record: block/county/state FIPS + names plus 2020 block population and FCC market-area codes (BEA, BTA, CMA, EAG, MEA, MTA, PEA, REA, RPC, VPC). Richer than census_block; use when you need population or FCC licensing market codes for a point.',
    inputSchema: {
      type: 'object',
      properties: {
        lat: { type: 'number', description: 'Latitude in decimal degrees (e.g. 38.8976).' },
        lon: { type: 'number', description: 'Longitude in decimal degrees (e.g. -77.0365).' },
        censusYear: {
          type: 'string',
          description: 'Census vintage: "2020" (default) or "2010".',
          enum: ['2010', '2020'],
        },
      },
      required: ['lat', 'lon'],
    },
  },
  {
    name: 'county_for_point',
    description:
      'Lightweight reverse geocode: return just the county and state for a US latitude/longitude (decimal degrees) — county FIPS + name, state FIPS + code + name. Convenience wrapper over the FCC block-find service for when you only need the containing county/state, not the full block record.',
    inputSchema: {
      type: 'object',
      properties: {
        lat: { type: 'number', description: 'Latitude in decimal degrees.' },
        lon: { type: 'number', description: 'Longitude in decimal degrees.' },
      },
      required: ['lat', 'lon'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'census_block': {
      const { lat, lon } = coords(args);
      const year = yearOf(args);
      return fccGet(`/block/find?latitude=${lat}&longitude=${lon}&censusYear=${year}&format=json`);
    }
    case 'census_area': {
      const { lat, lon } = coords(args);
      const year = yearOf(args);
      return fccGet(`/area?lat=${lat}&lon=${lon}&censusYear=${year}&format=json`);
    }
    case 'county_for_point': {
      const { lat, lon } = coords(args);
      const data = (await fccGet(
        `/block/find?latitude=${lat}&longitude=${lon}&format=json`,
      )) as { County?: unknown; State?: unknown; status?: unknown };
      return { County: data.County ?? null, State: data.State ?? null, status: data.status ?? null };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function fccGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json', 'User-Agent': UA },
  });
  if (!res.ok) throw new Error(`FCC: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  return res.json();
}

function coords(args: Record<string, unknown>): { lat: number; lon: number } {
  const lat = num(args, 'lat');
  const lon = num(args, 'lon');
  return { lat, lon };
}

function num(args: Record<string, unknown>, key: string): number {
  const v = args[key];
  const n = typeof v === 'string' ? Number(v) : v;
  if (typeof n !== 'number' || !Number.isFinite(n)) {
    throw new Error(`Required argument "${key}" is missing or not a number. Pass decimal degrees, e.g. ${key === 'lat' ? '38.8976' : '-77.0365'}.`);
  }
  return n;
}

function yearOf(args: Record<string, unknown>): string {
  const y = args.censusYear;
  return y === '2010' ? '2010' : '2020';
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
