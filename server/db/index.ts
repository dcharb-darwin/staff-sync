import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const dataDir = path.resolve(import.meta.dirname, "../../data");
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "staff-sync.db");
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

// Create tables if they don't exist (mockup — no migration infrastructure needed)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    middle_initial TEXT,
    last_name TEXT NOT NULL,
    badge_number TEXT,
    employee_id TEXT,
    job_title TEXT,
    department TEXT,
    start_date TEXT,
    employee_type TEXT NOT NULL DEFAULT 'bus_operator',
    rehire_flag INTEGER DEFAULT 0,
    rehire_notes TEXT,
    hiring_manager_id INTEGER REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS processes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    process_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'initiated',
    created_by_id INTEGER REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    process_id INTEGER NOT NULL REFERENCES processes(id),
    description TEXT NOT NULL,
    owner_role TEXT NOT NULL,
    owner_id INTEGER REFERENCES users(id),
    status TEXT NOT NULL DEFAULT 'pending',
    sort_order INTEGER NOT NULL,
    is_system_generated INTEGER DEFAULT 0,
    completed_at TEXT,
    completed_by_id INTEGER REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS eis_bois_forms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    process_id INTEGER NOT NULL REFERENCES processes(id),
    form_type TEXT NOT NULL,
    section1_data TEXT,
    section2_data TEXT,
    section1_completed_at TEXT,
    section1_completed_by_id INTEGER REFERENCES users(id),
    section2_completed_at TEXT,
    section2_completed_by_id INTEGER REFERENCES users(id),
    submitted_to_service_desk_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS validation_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    process_id INTEGER NOT NULL REFERENCES processes(id),
    employee_id INTEGER NOT NULL REFERENCES employees(id),
    check_type TEXT NOT NULL,
    status TEXT NOT NULL,
    details TEXT,
    checked_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ad_mock_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    display_name TEXT NOT NULL,
    given_name TEXT,
    surname TEXT,
    job_title TEXT,
    department TEXT,
    account_enabled INTEGER DEFAULT 1,
    member_of TEXT
  );

  CREATE TABLE IF NOT EXISTS infor_mock_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employee_id TEXT NOT NULL,
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    job_title TEXT,
    department TEXT,
    start_date TEXT
  );
`);

export const db = drizzle(sqlite, { schema });
