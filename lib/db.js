import { createClient } from '@libsql/client';

if (!process.env.TURSO_DATABASE_URL) {
  throw new Error('Missing TURSO_DATABASE_URL environment variable');
}
if (!process.env.TURSO_AUTH_TOKEN) {
  throw new Error('Missing TURSO_AUTH_TOKEN environment variable');
}

let client;

function getClient() {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

// No schema creation here — tables must be created manually in Turso dashboard
// See README for the SQL to run
async function getDb() {
  return getClient();
}

function uid() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

export { getDb, uid };
