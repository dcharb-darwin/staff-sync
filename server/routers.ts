import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { z } from "zod";
import { db } from "./db/index";
import { eq, desc, count, and, sql, inArray } from "drizzle-orm";
import {
  users,
  employees,
  processes,
  tasks,
  eisBoisForms,
  validationChecks,
  adMockData,
  inforMockData,
} from "./db/schema";

const t = initTRPC.create({ transformer: superjson });
const publicProcedure = t.procedure;

// ── Dashboard ────────────────────────────────────────────────────────
const dashboardRouter = t.router({
  stats: publicProcedure.query(async () => {
    // Active processes by type
    const activeByType = await db
      .select({
        processType: processes.processType,
        count: count(),
      })
      .from(processes)
      .where(
        inArray(processes.status, [
          "initiated",
          "in_progress",
          "pending_review",
        ]),
      )
      .groupBy(processes.processType);

    const activeProcesses: Record<string, number> = {};
    for (const row of activeByType) {
      activeProcesses[row.processType] = row.count;
    }

    // Pending tasks by owner role
    const pendingByRole = await db
      .select({
        ownerRole: tasks.ownerRole,
        count: count(),
      })
      .from(tasks)
      .where(inArray(tasks.status, ["pending", "in_progress"]))
      .groupBy(tasks.ownerRole);

    const pendingTasks: Record<string, number> = {};
    for (const row of pendingByRole) {
      pendingTasks[row.ownerRole] = row.count;
    }

    // Readiness stats from validation checks
    const readinessRows = await db
      .select({
        status: validationChecks.status,
        count: count(),
      })
      .from(validationChecks)
      .groupBy(validationChecks.status);

    const readinessStats: Record<string, number> = {
      pass: 0,
      warning: 0,
      fail: 0,
    };
    for (const row of readinessRows) {
      readinessStats[row.status] = row.count;
    }

    // Employees starting within 10 days
    const upcomingStartDates = await db
      .select()
      .from(employees)
      .where(
        and(
          sql`${employees.startDate} IS NOT NULL`,
          sql`${employees.startDate} >= date('now')`,
          sql`${employees.startDate} <= date('now', '+10 days')`,
        ),
      );

    return { activeProcesses, pendingTasks, readinessStats, upcomingStartDates };
  }),
});

// ── Processes ────────────────────────────────────────────────────────
const processRouter = t.router({
  list: publicProcedure
    .input(
      z
        .object({
          processType: z
            .enum(["onboarding", "transfer", "offboarding"])
            .optional(),
          status: z
            .enum(["initiated", "in_progress", "pending_review", "completed"])
            .optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const conditions = [];
      if (input?.processType) {
        conditions.push(eq(processes.processType, input.processType));
      }
      if (input?.status) {
        conditions.push(eq(processes.status, input.status));
      }

      const processList = await db
        .select()
        .from(processes)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(processes.createdAt));

      // Join employee names
      const result = [];
      for (const proc of processList) {
        const [employee] = await db
          .select()
          .from(employees)
          .where(eq(employees.id, proc.employeeId));
        result.push({ ...proc, employee });
      }
      return result;
    }),

  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const [process] = await db
        .select()
        .from(processes)
        .where(eq(processes.id, input.id));
      if (!process) return null;

      const [employee] = await db
        .select()
        .from(employees)
        .where(eq(employees.id, process.employeeId));

      const processTasks = await db
        .select()
        .from(tasks)
        .where(eq(tasks.processId, input.id))
        .orderBy(tasks.sortOrder);

      const forms = await db
        .select()
        .from(eisBoisForms)
        .where(eq(eisBoisForms.processId, input.id));

      const validations = await db
        .select()
        .from(validationChecks)
        .where(eq(validationChecks.processId, input.id));

      return {
        ...process,
        employee,
        tasks: processTasks,
        forms,
        validations,
      };
    }),

  create: publicProcedure
    .input(
      z.object({
        employeeId: z.number(),
        processType: z.enum(["onboarding", "transfer", "offboarding"]),
        createdById: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const [created] = await db
        .insert(processes)
        .values({
          employeeId: input.employeeId,
          processType: input.processType,
          createdById: input.createdById,
          status: "initiated",
        })
        .returning();
      return created;
    }),

  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum([
          "initiated",
          "in_progress",
          "pending_review",
          "completed",
        ]),
      }),
    )
    .mutation(async ({ input }) => {
      const [updated] = await db
        .update(processes)
        .set({
          status: input.status,
          completedAt:
            input.status === "completed"
              ? new Date().toISOString()
              : undefined,
        })
        .where(eq(processes.id, input.id))
        .returning();
      return updated;
    }),
});

// ── Employees ────────────────────────────────────────────────────────
const employeeRouter = t.router({
  list: publicProcedure.query(async () => {
    return await db.select().from(employees).orderBy(employees.lastName);
  }),

  byId: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const [employee] = await db
        .select()
        .from(employees)
        .where(eq(employees.id, input.id));
      return employee ?? null;
    }),
});

// ── Tasks ────────────────────────────────────────────────────────────
const taskRouter = t.router({
  updateStatus: publicProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "in_progress", "completed", "skipped"]),
        completedById: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const [updated] = await db
        .update(tasks)
        .set({
          status: input.status,
          completedAt:
            input.status === "completed"
              ? new Date().toISOString()
              : null,
          completedById: input.completedById ?? null,
        })
        .where(eq(tasks.id, input.id))
        .returning();
      return updated;
    }),

  bulkUpdateStatus: publicProcedure
    .input(
      z.object({
        ids: z.array(z.number()),
        status: z.enum(["pending", "in_progress", "completed", "skipped"]),
        completedById: z.number().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const updated = await db
        .update(tasks)
        .set({
          status: input.status,
          completedAt:
            input.status === "completed"
              ? new Date().toISOString()
              : null,
          completedById: input.completedById ?? null,
        })
        .where(inArray(tasks.id, input.ids))
        .returning();
      return updated;
    }),
});

// ── Forms ────────────────────────────────────────────────────────────
const formRouter = t.router({
  getByProcessId: publicProcedure
    .input(z.object({ processId: z.number() }))
    .query(async ({ input }) => {
      const [form] = await db
        .select()
        .from(eisBoisForms)
        .where(eq(eisBoisForms.processId, input.processId));
      return form ?? null;
    }),

  updateSection1: publicProcedure
    .input(
      z.object({
        processId: z.number(),
        data: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const [updated] = await db
        .update(eisBoisForms)
        .set({
          section1Data: input.data,
          section1CompletedAt: new Date().toISOString(),
          section1CompletedById: 1, // Default to Kimberly for mockup
        })
        .where(eq(eisBoisForms.processId, input.processId))
        .returning();
      return updated;
    }),

  updateSection2: publicProcedure
    .input(
      z.object({
        processId: z.number(),
        data: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const [updated] = await db
        .update(eisBoisForms)
        .set({
          section2Data: input.data,
          section2CompletedAt: new Date().toISOString(),
        })
        .where(eq(eisBoisForms.processId, input.processId))
        .returning();
      return updated;
    }),

  submitToServiceDesk: publicProcedure
    .input(z.object({ processId: z.number() }))
    .mutation(async ({ input }) => {
      const [updated] = await db
        .update(eisBoisForms)
        .set({
          submittedToServiceDeskAt: new Date().toISOString(),
        })
        .where(eq(eisBoisForms.processId, input.processId))
        .returning();
      return updated;
    }),
});

// ── Validation ───────────────────────────────────────────────────────
const validationRouter = t.router({
  runChecks: publicProcedure
    .input(z.object({ employeeId: z.number() }))
    .mutation(async ({ input }) => {
      const [employee] = await db
        .select()
        .from(employees)
        .where(eq(employees.id, input.employeeId));
      if (!employee) throw new Error("Employee not found");

      // Find active process for this employee
      const [process] = await db
        .select()
        .from(processes)
        .where(
          and(
            eq(processes.employeeId, input.employeeId),
            inArray(processes.status, [
              "initiated",
              "in_progress",
              "pending_review",
            ]),
          ),
        );

      const processId = process?.id ?? 0;

      // Derive expected email: first-initial + lastname @ cota.com
      const expectedEmail = `${employee.firstName[0].toLowerCase()}${employee.lastName.toLowerCase()}@cota.com`;

      // Look up AD record by derived email
      const [adRecord] = await db
        .select()
        .from(adMockData)
        .where(eq(adMockData.email, expectedEmail));

      // Look up Infor record by employeeId
      const inforRecords = employee.employeeId
        ? await db
            .select()
            .from(inforMockData)
            .where(eq(inforMockData.employeeId, employee.employeeId))
        : [];
      const inforRecord = inforRecords[0] ?? null;

      // Look up form
      const formRecords = process
        ? await db
            .select()
            .from(eisBoisForms)
            .where(eq(eisBoisForms.processId, process.id))
        : [];
      const form = formRecords[0] ?? null;

      const results: {
        processId: number;
        employeeId: number;
        checkType: string;
        status: string;
        details: string;
      }[] = [];

      // 1. AD account exists
      results.push({
        processId,
        employeeId: input.employeeId,
        checkType: "ad_account_exists",
        status: adRecord ? "pass" : "fail",
        details: JSON.stringify(
          adRecord
            ? { message: "AD account found", email: adRecord.email }
            : { message: `No AD account found for ${expectedEmail}` },
        ),
      });

      // 2. Name consistency
      if (adRecord) {
        const fullName = `${employee.firstName} ${employee.lastName}`;
        const nameMatch = adRecord.displayName === fullName;
        const lastNameMatch = adRecord.displayName.includes(
          employee.lastName,
        );
        results.push({
          processId,
          employeeId: input.employeeId,
          checkType: "name_consistency",
          status: nameMatch ? "pass" : lastNameMatch ? "warning" : "fail",
          details: JSON.stringify({
            expected: fullName,
            adDisplayName: adRecord.displayName,
            message: nameMatch
              ? "Names match"
              : `AD display name "${adRecord.displayName}" differs from employee name "${fullName}"`,
          }),
        });
      }

      // 3. Email match (AD vs Infor)
      if (adRecord && inforRecord) {
        const emailMatch = adRecord.email === inforRecord.email;
        results.push({
          processId,
          employeeId: input.employeeId,
          checkType: "email_match",
          status: emailMatch ? "pass" : "fail",
          details: JSON.stringify({
            adEmail: adRecord.email,
            inforEmail: inforRecord.email,
            message: emailMatch
              ? "Emails match"
              : `AD email "${adRecord.email}" does not match Infor email "${inforRecord.email}"`,
          }),
        });
      }

      // 4. Badge/ID reconciliation
      if (inforRecord) {
        const idMatch = employee.employeeId === inforRecord.employeeId;
        results.push({
          processId,
          employeeId: input.employeeId,
          checkType: "badge_id_reconciliation",
          status: idMatch ? "pass" : "fail",
          details: JSON.stringify({
            employeeId: employee.employeeId,
            inforEmployeeId: inforRecord.employeeId,
            message: idMatch ? "IDs match" : "Employee ID mismatch between systems",
          }),
        });
      }

      // 5. Form complete
      if (form) {
        const isComplete =
          form.section1Data !== null && form.section2Data !== null;
        results.push({
          processId,
          employeeId: input.employeeId,
          checkType: "form_complete",
          status: isComplete ? "pass" : "fail",
          details: JSON.stringify({
            section1Complete: form.section1Data !== null,
            section2Complete: form.section2Data !== null,
            message: isComplete
              ? "Form complete"
              : "Form sections incomplete",
          }),
        });
      }

      // 6. Service desk provisioning
      if (adRecord) {
        const provisioned = adRecord.accountEnabled === 1;
        results.push({
          processId,
          employeeId: input.employeeId,
          checkType: "service_desk_provisioning",
          status: provisioned ? "pass" : "fail",
          details: JSON.stringify({
            accountEnabled: adRecord.accountEnabled === 1,
            message: provisioned
              ? "Account provisioned and active"
              : "AD account is disabled",
          }),
        });
      }

      // 7. Non-AD systems
      results.push({
        processId,
        employeeId: input.employeeId,
        checkType: "non_ad_systems",
        status: inforRecord ? "pass" : "warning",
        details: JSON.stringify({
          inforRecord: !!inforRecord,
          message: inforRecord
            ? "Infor record found"
            : "No Infor record found",
        }),
      });

      // Clear previous checks for this process/employee, then insert new
      if (process) {
        await db
          .delete(validationChecks)
          .where(
            and(
              eq(validationChecks.processId, process.id),
              eq(validationChecks.employeeId, input.employeeId),
            ),
          );
      }

      const inserted = await db
        .insert(validationChecks)
        .values(results)
        .returning();
      return inserted;
    }),

  getResults: publicProcedure
    .input(z.object({ processId: z.number() }))
    .query(async ({ input }) => {
      return await db
        .select()
        .from(validationChecks)
        .where(eq(validationChecks.processId, input.processId));
    }),
});

// ── Merge all routers ────────────────────────────────────────────────
export const appRouter = t.router({
  dashboard: dashboardRouter,
  processes: processRouter,
  employees: employeeRouter,
  tasks: taskRouter,
  forms: formRouter,
  validation: validationRouter,
});

export type AppRouter = typeof appRouter;
