import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const employees = sqliteTable("employees", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  firstName: text("first_name").notNull(),
  middleInitial: text("middle_initial"),
  lastName: text("last_name").notNull(),
  badgeNumber: text("badge_number"),
  employeeId: text("employee_id"),
  jobTitle: text("job_title"),
  department: text("department"),
  startDate: text("start_date"),
  employeeType: text("employee_type").notNull().default("bus_operator"),
  rehireFlag: integer("rehire_flag").default(0),
  rehireNotes: text("rehire_notes"),
  hiringManagerId: integer("hiring_manager_id").references(() => users.id),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const processes = sqliteTable("processes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id),
  processType: text("process_type").notNull(),
  status: text("status").notNull().default("initiated"),
  createdById: integer("created_by_id").references(() => users.id),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  completedAt: text("completed_at"),
});

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  processId: integer("process_id")
    .notNull()
    .references(() => processes.id),
  description: text("description").notNull(),
  ownerRole: text("owner_role").notNull(),
  ownerId: integer("owner_id").references(() => users.id),
  status: text("status").notNull().default("pending"),
  sortOrder: integer("sort_order").notNull(),
  isSystemGenerated: integer("is_system_generated").default(0),
  completedAt: text("completed_at"),
  completedById: integer("completed_by_id").references(() => users.id),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const eisBoisForms = sqliteTable("eis_bois_forms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  processId: integer("process_id")
    .notNull()
    .references(() => processes.id),
  formType: text("form_type").notNull(),
  section1Data: text("section1_data"),
  section2Data: text("section2_data"),
  section1CompletedAt: text("section1_completed_at"),
  section1CompletedById: integer("section1_completed_by_id").references(
    () => users.id,
  ),
  section2CompletedAt: text("section2_completed_at"),
  section2CompletedById: integer("section2_completed_by_id").references(
    () => users.id,
  ),
  submittedToServiceDeskAt: text("submitted_to_service_desk_at"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const validationChecks = sqliteTable("validation_checks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  processId: integer("process_id")
    .notNull()
    .references(() => processes.id),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => employees.id),
  checkType: text("check_type").notNull(),
  status: text("status").notNull(),
  details: text("details"),
  checkedAt: text("checked_at").default(sql`CURRENT_TIMESTAMP`),
});

export const adMockData = sqliteTable("ad_mock_data", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull(),
  displayName: text("display_name").notNull(),
  givenName: text("given_name"),
  surname: text("surname"),
  jobTitle: text("job_title"),
  department: text("department"),
  accountEnabled: integer("account_enabled").default(1),
  memberOf: text("member_of"),
});

export const inforMockData = sqliteTable("infor_mock_data", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  employeeId: text("employee_id").notNull(),
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  jobTitle: text("job_title"),
  department: text("department"),
  startDate: text("start_date"),
});
