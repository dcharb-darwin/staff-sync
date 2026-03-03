import { type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { users } from "./schema";
import type * as schema from "./schema";

export async function seed(db: BetterSQLite3Database<typeof schema>) {
    // Idempotent: skip if data already exists (§8 convention)
    const existing = await db.select().from(users);
    if (existing.length > 0) {
        console.log("Database already seeded, skipping.");
        return;
    }

    console.log("Seeding database...");

    // TODO: Replace with domain-specific seed data
    // Rules (agents/darwin-standards.md §8):
    //   - Deterministic IDs and dates
    //   - Realistic but fake data
    //   - No PII (P5)
    //   - Include edge cases and failure scenarios

    await db.insert(users).values([
        { name: "Admin User", email: "admin@example.com", role: "admin" },
        { name: "Test User", email: "user@example.com", role: "viewer" },
    ]);

    console.log("Seeding complete.");
}
