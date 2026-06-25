import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const seedOnly = process.argv.includes('--seed-only');
const skipLogin = process.env.HPFC_SKIP_LOGIN === '1';

function loadEnvFile(path) {
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const [key, ...valueParts] = trimmed.split('=');
    if (process.env[key]) continue;
    process.env[key] = valueParts.join('=').replace(/^['"]|['"]$/g, '');
  }
}

loadEnvFile(resolve(process.cwd(), '.env.local'));

const baseUrl = (process.env.HPFC_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const adminCode = process.env.HPFC_ADMIN_CODE ?? process.env.ADMIN_ACCESS_CODE;

if (!skipLogin && !adminCode) {
  throw new Error('Set ADMIN_ACCESS_CODE or HPFC_ADMIN_CODE before running the smoke flow.');
}

function suffix() {
  return new Date().toISOString().replace(/\D/g, '').slice(4, 12);
}

async function readBody(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request(path, init, expectedStatus) {
  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, init);
  } catch (error) {
    throw new Error(`Could not reach ${baseUrl}. Start the app with npm run dev first. ${error instanceof Error ? error.message : ''}`);
  }

  const body = await readBody(response);
  if (response.status !== expectedStatus) {
    throw new Error(`${init.method ?? 'GET'} ${path} returned ${response.status}, expected ${expectedStatus}: ${JSON.stringify(body)}`);
  }
  return body;
}

function jsonHeaders(admin = false) {
  return {
    'content-type': 'application/json',
    ...(admin ? { 'x-hpfc-admin': '1' } : {}),
  };
}

const runId = suffix();
const teamNames = [`Smoke Reds ${runId}`, `Smoke Blues ${runId}`, `Smoke Golds ${runId}`, `Smoke Whites ${runId}`];

if (!skipLogin) {
  await request('/api/admin/login', {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ code: adminCode }),
  }, 200);
}

const created = await request('/api/admin/tournaments', {
  method: 'POST',
  headers: jsonHeaders(true),
  body: JSON.stringify({
    name: `Smoke Demo ${runId}`,
    teamCount: teamNames.length,
    teamNames,
  }),
}, 201);

const generated = await request(`/api/admin/tournament/${created.id}/fixtures/generate`, {
  method: 'POST',
  headers: { 'x-hpfc-admin': '1' },
}, 201);

if (!Array.isArray(generated.matches) || generated.matches.length === 0) {
  throw new Error('Fixture generation returned no matches.');
}

if (seedOnly) {
  console.log(`Created demo tournament ${created.id}`);
  console.log(`Admin: ${baseUrl}/admin/tournament/${created.id}`);
  console.log(`Public: ${baseUrl}/tournament/${created.id}`);
  process.exit(0);
}

const firstMatch = generated.matches[0];
await request(`/api/admin/tournament/${created.id}/matches/${firstMatch.id}`, {
  method: 'PATCH',
  headers: jsonHeaders(true),
  body: JSON.stringify({ home_score: 1, away_score: 0 }),
}, 200);

const publicDetail = await request(`/api/tournament/${created.id}`, {
  method: 'GET',
}, 200);

const completedFixture = publicDetail.fixtures?.find((fixture) => fixture.id === firstMatch.id);
if (!completedFixture || completedFixture.status !== 'completed' || completedFixture.homeScore !== 1 || completedFixture.awayScore !== 0) {
  throw new Error('Public fixture did not show the saved score.');
}

const homeRow = publicDetail.table?.find((row) => row.name === completedFixture.home);
if (!homeRow || homeRow.pts !== 3 || homeRow.p !== 1) {
  throw new Error('Public table did not update after the saved score.');
}

console.log(`Smoke flow passed for ${created.id}`);
console.log(`Public: ${baseUrl}/tournament/${created.id}`);
