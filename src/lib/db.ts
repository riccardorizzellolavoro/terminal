import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const globalForDb = globalThis as unknown as {
  __openforecasterDb?: Database.Database;
};

function getDbPath(): string {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, "cache.db");
}

function initSchema(db: Database.Database) {
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS cache_entries (
      cache_key TEXT PRIMARY KEY,
      payload TEXT NOT NULL,
      fetched_at INTEGER NOT NULL,
      ttl_seconds INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS watchlist (
      symbol TEXT PRIMARY KEY,
      added_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_trials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      plan TEXT NOT NULL DEFAULT 'annual',
      status TEXT NOT NULL DEFAULT 'trial_active',
      trial_ends_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS webinar_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      event_type TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS filing_chunks (
      id TEXT PRIMARY KEY,
      symbol TEXT NOT NULL,
      doc_title TEXT NOT NULL,
      section_label TEXT NOT NULL,
      citation_key TEXT NOT NULL,
      fiscal_period TEXT NOT NULL,
      published_date TEXT NOT NULL,
      text TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_filing_chunks_symbol ON filing_chunks(symbol);
  `);

  // Seed default watchlist if empty
  const countRow = db
    .prepare("SELECT COUNT(*) as cnt FROM watchlist")
    .get() as { cnt: number };
  if (countRow.cnt === 0) {
    const now = new Date().toISOString();
    const insert = db.prepare(
      "INSERT OR IGNORE INTO watchlist (symbol, added_at) VALUES (?, ?)"
    );
    for (const sym of ["AAPL", "NVDA", "MSFT", "TSLA", "BTCUSD"]) {
      insert.run(sym, now);
    }
  }
}

export function getDb(): Database.Database {
  if (!globalForDb.__openforecasterDb) {
    const db = new Database(getDbPath());
    initSchema(db);
    globalForDb.__openforecasterDb = db;
  }
  return globalForDb.__openforecasterDb;
}

export function getCached<T>(key: string): { data: T; fresh: boolean } | null {
  const db = getDb();
  const row = db
    .prepare(
      "SELECT payload, fetched_at, ttl_seconds FROM cache_entries WHERE cache_key = ?"
    )
    .get(key) as
    | { payload: string; fetched_at: number; ttl_seconds: number }
    | undefined;

  if (!row) return null;
  const ageSeconds = Math.floor(Date.now() / 1000) - row.fetched_at;
  try {
    return {
      data: JSON.parse(row.payload) as T,
      fresh: ageSeconds <= row.ttl_seconds,
    };
  } catch {
    return null;
  }
}

export function setCached<T>(key: string, data: T, ttlSeconds: number): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO cache_entries (cache_key, payload, fetched_at, ttl_seconds)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(cache_key) DO UPDATE SET
       payload = excluded.payload,
       fetched_at = excluded.fetched_at,
       ttl_seconds = excluded.ttl_seconds`
  ).run(key, JSON.stringify(data), Math.floor(Date.now() / 1000), ttlSeconds);
}

export async function getCachedOrFetch<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
  fallback?: () => T
): Promise<{ data: T; source: "live" | "cache" | "seed" }> {
  const cached = getCached<T>(key);
  if (cached && cached.fresh) {
    return { data: cached.data, source: "cache" };
  }

  try {
    const freshData = await fetcher();
    setCached(key, freshData, ttlSeconds);
    return { data: freshData, source: "live" };
  } catch {
    if (cached) {
      return { data: cached.data, source: "cache" };
    }
    if (fallback) {
      const seedData = fallback();
      setCached(key, seedData, Math.min(ttlSeconds, 60));
      return { data: seedData, source: "seed" };
    }
    throw new Error(`Failed to fetch ${key} and no fallback available`);
  }
}
