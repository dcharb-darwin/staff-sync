import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Example table — replace with your domain schema
export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    role: text("role").notNull(),
    created_at: text("created_at").default("CURRENT_TIMESTAMP"),
});

// TODO: Add your domain tables here
// See agents/darwin-standards.md §8 for seed data conventions
