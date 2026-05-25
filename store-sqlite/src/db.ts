import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const DB_PATH = process.env.DB_PATH ?? "/data/store.db";

let db: Database.Database;

export function getDb(): Database.Database {
  if (db) return db;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS faq (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      source TEXT,
      created_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT,
      is_active INTEGER DEFAULT 1,
      data TEXT
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      target TEXT,
      diff TEXT,
      ts INTEGER DEFAULT (unixepoch())
    );
  `);

  return db;
}

// FAQ operations

export interface FaqRow {
  id: number;
  question: string;
  answer: string;
  source: string | null;
  created_at: number;
}

export function listFaq(): FaqRow[] {
  return getDb().prepare("SELECT * FROM faq ORDER BY created_at DESC").all() as FaqRow[];
}

export function insertFaq(question: string, answer: string, source?: string): FaqRow {
  const stmt = getDb().prepare(
    "INSERT INTO faq (question, answer, source) VALUES (?, ?, ?) RETURNING *"
  );
  return stmt.get(question, answer, source ?? null) as FaqRow;
}

// Product operations

export interface ProductRow {
  id: string;
  title: string;
  price: number;
  category: string | null;
  is_active: number;
  data: string | null;
}

export function listProducts(): ProductRow[] {
  return getDb().prepare("SELECT * FROM products ORDER BY title").all() as ProductRow[];
}

export function upsertProduct(
  id: string,
  title: string,
  price: number,
  category?: string,
  is_active?: number,
  data?: string
): ProductRow {
  const stmt = getDb().prepare(`
    INSERT INTO products (id, title, price, category, is_active, data)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      price = excluded.price,
      category = excluded.category,
      is_active = excluded.is_active,
      data = excluded.data
    RETURNING *
  `);
  return stmt.get(id, title, price, category ?? null, is_active ?? 1, data ?? null) as ProductRow;
}

// Audit log operations

export interface AuditRow {
  id: number;
  actor: string;
  action: string;
  target: string | null;
  diff: string | null;
  ts: number;
}

export function listAudit(limit: number = 50, offset: number = 0): AuditRow[] {
  return getDb()
    .prepare("SELECT * FROM audit_log ORDER BY ts DESC LIMIT ? OFFSET ?")
    .all(limit, offset) as AuditRow[];
}

export function insertAudit(
  actor: string,
  action: string,
  target?: string,
  diff?: string
): AuditRow {
  const stmt = getDb().prepare(
    "INSERT INTO audit_log (actor, action, target, diff) VALUES (?, ?, ?, ?) RETURNING *"
  );
  return stmt.get(actor, action, target ?? null, diff ?? null) as AuditRow;
}
