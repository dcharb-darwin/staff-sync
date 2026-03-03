import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { count } from "drizzle-orm";
import * as schema from "./schema";

// Task templates per process type
const ONBOARDING_TASKS = [
  { description: "Initiate onboarding process", ownerRole: "hr_generalist" },
  {
    description: "Complete Section 1 of EIS/BOIS form",
    ownerRole: "hr_generalist",
  },
  {
    description: "Assign hiring manager for Section 2 review",
    ownerRole: "hr_generalist",
  },
  {
    description: "Complete Section 2 of EIS/BOIS form",
    ownerRole: "hiring_manager",
  },
  { description: "Submit form to Service Desk", ownerRole: "hr_generalist" },
  {
    description: "Create AD account and email",
    ownerRole: "service_desk_analyst",
  },
  {
    description: "Provision systems and access",
    ownerRole: "service_desk_analyst",
  },
  { description: "Validate day-one readiness", ownerRole: "hr_generalist" },
  {
    description: "Confirm badge and employee ID issuance",
    ownerRole: "hr_generalist",
  },
  { description: "Close onboarding process", ownerRole: "hr_manager" },
];

const TRANSFER_TASKS = [
  { description: "Initiate transfer process", ownerRole: "hr_generalist" },
  { description: "Update employee record", ownerRole: "hr_generalist" },
  {
    description: "Submit transfer notification to Service Desk",
    ownerRole: "hr_generalist",
  },
  {
    description: "Update AD group memberships",
    ownerRole: "service_desk_analyst",
  },
  {
    description: "Update system access permissions",
    ownerRole: "service_desk_analyst",
  },
  { description: "Validate transfer completion", ownerRole: "hr_generalist" },
  { description: "Close transfer process", ownerRole: "hr_manager" },
];

const OFFBOARDING_TASKS = [
  { description: "Initiate offboarding process", ownerRole: "hr_generalist" },
  {
    description: "Submit BOIS form to Service Desk",
    ownerRole: "hr_generalist",
  },
  { description: "Disable AD account", ownerRole: "service_desk_analyst" },
  {
    description: "Revoke system access and licenses",
    ownerRole: "service_desk_analyst",
  },
  { description: "Confirm equipment return", ownerRole: "hiring_manager" },
  { description: "Close offboarding process", ownerRole: "hr_manager" },
];

// Map owner roles to user IDs (based on insert order)
const OWNER_MAP: Record<string, number | null> = {
  hr_generalist: 1, // Kimberly Minh
  hr_manager: 2, // Alexandra Swogger
  service_desk_analyst: 3, // Anthony Perez
  service_desk_manager: 5, // Michael Boyce
  hris_analyst: 6, // Sarah Chen
  hiring_manager: null, // No hiring_manager user in seed
};

function buildTaskRows(
  processId: number,
  template: { description: string; ownerRole: string }[],
  completedCount: number,
  inProgressIndex: number | null,
) {
  return template.map((task, i) => {
    let status: string;
    let completedAt: string | null = null;
    let completedById: number | null = null;
    if (i < completedCount) {
      status = "completed";
      completedAt = "2026-02-28T12:00:00.000Z";
      completedById = OWNER_MAP[task.ownerRole] ?? null;
    } else if (inProgressIndex !== null && i === inProgressIndex) {
      status = "in_progress";
    } else {
      status = "pending";
    }
    return {
      processId,
      description: task.description,
      ownerRole: task.ownerRole,
      ownerId: OWNER_MAP[task.ownerRole] ?? null,
      status,
      sortOrder: i + 1,
      isSystemGenerated: i === 0 ? 1 : 0,
      completedAt,
      completedById,
    };
  });
}

function makeSection1(emp: {
  firstName: string;
  lastName: string;
  badgeNumber: string;
  employeeId: string;
  jobTitle: string;
  department: string;
  startDate: string;
  employeeType: string;
}) {
  return JSON.stringify({
    employeeName: `${emp.firstName} ${emp.lastName}`,
    badgeNumber: emp.badgeNumber,
    employeeId: emp.employeeId,
    jobTitle: emp.jobTitle,
    department: emp.department,
    startDate: emp.startDate,
    employeeType: emp.employeeType,
    workLocation: "COTA Main Campus",
    supervisorName: "Transit Operations Supervisor",
  });
}

function makeSection2(approved: boolean) {
  return JSON.stringify({
    equipmentNeeded: ["uniform", "badge_holder", "radio"],
    systemAccess: ["scheduling_system", "training_portal", "email"],
    workStation: "Bus Yard A",
    trainingSchedule: "Week 1: Classroom, Week 2: On-Route",
    specialInstructions: "",
    managerApproval: approved,
    approvalDate: approved ? "2026-03-01" : null,
  });
}

export async function seedDatabase(
  db: BetterSQLite3Database<typeof schema>,
) {
  // Check if already seeded
  const result = await db.select({ value: count() }).from(schema.users);
  if (result[0].value > 0) {
    console.log("Database already seeded, skipping.");
    return;
  }

  console.log("Seeding database...");

  // ── Users ──────────────────────────────────────────────────────────
  const insertedUsers = await db
    .insert(schema.users)
    .values([
      {
        name: "Kimberly Minh",
        email: "kminh@cota.com",
        role: "hr_generalist",
      },
      {
        name: "Alexandra Swogger",
        email: "aswogger@cota.com",
        role: "hr_manager",
      },
      {
        name: "Anthony Perez",
        email: "aperez@cota.com",
        role: "service_desk_analyst",
      },
      {
        name: "Jason Hernandez",
        email: "jhernandez@cota.com",
        role: "service_desk_analyst",
      },
      {
        name: "Michael Boyce",
        email: "mboyce@cota.com",
        role: "service_desk_manager",
      },
      {
        name: "Sarah Chen",
        email: "schen@cota.com",
        role: "hris_analyst",
      },
    ])
    .returning();

  // ── Employees ──────────────────────────────────────────────────────
  const employeeData = [
    // Bus operator class of 8, start 2026-03-17
    {
      firstName: "Marcus",
      lastName: "Johnson",
      badgeNumber: "B-2026-0441",
      employeeId: "EMP-20260317-001",
      jobTitle: "Bus Operator",
      department: "Transit Operations",
      startDate: "2026-03-17",
      employeeType: "bus_operator" as const,
    },
    {
      firstName: "Desiree",
      lastName: "Williams",
      badgeNumber: "B-2026-0442",
      employeeId: "EMP-20260317-002",
      jobTitle: "Bus Operator",
      department: "Transit Operations",
      startDate: "2026-03-17",
      employeeType: "bus_operator" as const,
    },
    {
      firstName: "Robert",
      lastName: "Chen",
      badgeNumber: "B-2026-0443",
      employeeId: "EMP-20260317-003",
      jobTitle: "Bus Operator",
      department: "Transit Operations",
      startDate: "2026-03-17",
      employeeType: "bus_operator" as const,
    },
    {
      firstName: "Tamika",
      lastName: "Davis",
      badgeNumber: "B-2026-0444",
      employeeId: "EMP-20260317-004",
      jobTitle: "Bus Operator",
      department: "Transit Operations",
      startDate: "2026-03-17",
      employeeType: "bus_operator" as const,
    },
    {
      firstName: "James",
      lastName: "Wilson",
      badgeNumber: "B-2026-0445",
      employeeId: "EMP-20260317-005",
      jobTitle: "Bus Operator",
      department: "Transit Operations",
      startDate: "2026-03-17",
      employeeType: "bus_operator" as const,
    },
    {
      firstName: "Maria",
      lastName: "Gonzalez",
      badgeNumber: "B-2026-0446",
      employeeId: "EMP-20260317-006",
      jobTitle: "Bus Operator",
      department: "Transit Operations",
      startDate: "2026-03-17",
      employeeType: "bus_operator" as const,
    },
    {
      firstName: "Devon",
      lastName: "Carter",
      badgeNumber: "B-2026-0447",
      employeeId: "EMP-20260317-007",
      jobTitle: "Bus Operator",
      department: "Transit Operations",
      startDate: "2026-03-17",
      employeeType: "bus_operator" as const,
      rehireFlag: 1,
      rehireNotes:
        "Previous employment 2023-2024. Old badge B-2023-0198, old EMP ID EMP-20230815-004.",
    },
    {
      firstName: "Aaliyah",
      lastName: "Robinson",
      badgeNumber: "B-2026-0448",
      employeeId: "EMP-20260317-008",
      jobTitle: "Bus Operator",
      department: "Transit Operations",
      startDate: "2026-03-17",
      employeeType: "bus_operator" as const,
    },
    // Admin hires
    {
      firstName: "Tyler",
      lastName: "Morrison",
      employeeId: "EMP-20260320-001",
      jobTitle: "IT Analyst",
      department: "Information Technology",
      startDate: "2026-03-20",
      employeeType: "admin" as const,
    },
    {
      firstName: "Rachel",
      lastName: "Foster",
      employeeId: "EMP-20260210-001",
      jobTitle: "Financial Analyst",
      department: "Finance",
      startDate: "2026-02-10",
      employeeType: "admin" as const,
    },
    {
      firstName: "Kevin",
      lastName: "Patel",
      employeeId: "EMP-20260401-001",
      jobTitle: "Communications Specialist",
      department: "Communications",
      startDate: "2026-04-01",
      employeeType: "admin" as const,
    },
    // Transfers
    {
      firstName: "Lisa",
      lastName: "Zhang",
      employeeId: "EMP-20250612-001",
      jobTitle: "Operations Coordinator",
      department: "Operations",
      startDate: "2025-06-12",
      employeeType: "admin" as const,
    },
    {
      firstName: "Marcus",
      middleInitial: "T",
      lastName: "Thompson",
      employeeId: "EMP-20240815-001",
      jobTitle: "Supervisor",
      department: "Transit Operations",
      startDate: "2024-08-15",
      employeeType: "bus_operator" as const,
    },
    // Offboarding
    {
      firstName: "Patricia",
      lastName: "Howard",
      employeeId: "EMP-20220301-001",
      jobTitle: "Administrative Assistant",
      department: "Administration",
      startDate: "2022-03-01",
      employeeType: "admin" as const,
    },
  ];

  const insertedEmployees = await db
    .insert(schema.employees)
    .values(employeeData)
    .returning();

  // ── Processes ──────────────────────────────────────────────────────
  // Map: [processType, status, completedAt]
  const processConfigs: [string, string, string | null][] = [
    ["onboarding", "completed", "2026-03-01T16:00:00.000Z"], // Marcus Johnson
    ["onboarding", "in_progress", null], // Desiree Williams
    ["onboarding", "in_progress", null], // Robert Chen
    ["onboarding", "in_progress", null], // Tamika Davis
    ["onboarding", "in_progress", null], // James Wilson
    ["onboarding", "in_progress", null], // Maria Gonzalez
    ["onboarding", "in_progress", null], // Devon Carter
    ["onboarding", "initiated", null], // Aaliyah Robinson
    ["onboarding", "in_progress", null], // Tyler Morrison
    ["onboarding", "completed", "2026-02-12T16:00:00.000Z"], // Rachel Foster
    ["onboarding", "initiated", null], // Kevin Patel
    ["transfer", "in_progress", null], // Lisa Zhang
    ["transfer", "completed", "2026-01-15T16:00:00.000Z"], // Marcus Thompson
    ["offboarding", "completed", "2026-02-20T16:00:00.000Z"], // Patricia Howard
  ];

  const insertedProcesses = await db
    .insert(schema.processes)
    .values(
      processConfigs.map(([processType, status, completedAt], i) => ({
        employeeId: insertedEmployees[i].id,
        processType,
        status,
        createdById: insertedUsers[0].id, // Kimberly Minh
        completedAt,
      })),
    )
    .returning();

  // ── Tasks ──────────────────────────────────────────────────────────
  // [completedCount, inProgressIndex] per process
  // Onboarding has 10 tasks, Transfer has 7, Offboarding has 6
  const taskConfigs: [number, number | null][] = [
    [10, null], // Marcus Johnson — completed (all 10 done)
    [6, 6], // Desiree Williams — tasks 1-6 done, 7 in_progress
    [5, 5], // Robert Chen — tasks 1-5 done, 6 in_progress
    [5, 5], // Tamika Davis — tasks 1-5 done, 6 in_progress (stuck)
    [3, 3], // James Wilson — tasks 1-3 done, 4 in_progress (form)
    [6, 6], // Maria Gonzalez — tasks 1-6 done, 7 in_progress
    [5, 5], // Devon Carter — tasks 1-5 done, 6 in_progress
    [0, 0], // Aaliyah Robinson — initiated, task 1 in_progress
    [4, 4], // Tyler Morrison — tasks 1-4 done, 5 in_progress
    [10, null], // Rachel Foster — completed
    [0, 0], // Kevin Patel — initiated, task 1 in_progress
    [3, 3], // Lisa Zhang — 3 done, 4 in_progress (transfer, 7 tasks)
    [7, null], // Marcus Thompson — completed (transfer)
    [6, null], // Patricia Howard — completed (offboarding)
  ];

  const allTasks: ReturnType<typeof buildTaskRows> = [];
  for (let i = 0; i < insertedProcesses.length; i++) {
    const proc = insertedProcesses[i];
    const [completedCount, inProgressIdx] = taskConfigs[i];
    let template;
    if (proc.processType === "onboarding") template = ONBOARDING_TASKS;
    else if (proc.processType === "transfer") template = TRANSFER_TASKS;
    else template = OFFBOARDING_TASKS;

    allTasks.push(
      ...buildTaskRows(proc.id, template, completedCount, inProgressIdx),
    );
  }

  await db.insert(schema.tasks).values(allTasks);

  // ── EIS/BOIS Forms (onboarding processes only) ─────────────────────
  // Indices 0-10 are onboarding processes
  const onboardingProcesses = insertedProcesses.slice(0, 11);
  const onboardingEmployees = insertedEmployees.slice(0, 11);

  const formRows = onboardingProcesses.map((proc, i) => {
    const emp = onboardingEmployees[i];
    const processStatus = processConfigs[i][1];
    const [completedTasks] = taskConfigs[i];

    // Determine form completeness based on process progress
    const hasSection1 = completedTasks >= 2; // Task 2 = "Complete Section 1"
    const hasSection2 = completedTasks >= 4; // Task 4 = "Complete Section 2"
    const isSubmitted = completedTasks >= 5; // Task 5 = "Submit to Service Desk"

    return {
      processId: proc.id,
      formType: emp.employeeType === "bus_operator" ? "eis" : "bois",
      section1Data: hasSection1
        ? makeSection1({
            firstName: emp.firstName,
            lastName: emp.lastName,
            badgeNumber: emp.badgeNumber ?? "",
            employeeId: emp.employeeId ?? "",
            jobTitle: emp.jobTitle ?? "",
            department: emp.department ?? "",
            startDate: emp.startDate ?? "",
            employeeType: emp.employeeType,
          })
        : null,
      section2Data: hasSection2 ? makeSection2(true) : null,
      section1CompletedAt: hasSection1 ? "2026-02-25T10:00:00.000Z" : null,
      section1CompletedById: hasSection1 ? insertedUsers[0].id : null,
      section2CompletedAt: hasSection2 ? "2026-02-27T14:00:00.000Z" : null,
      section2CompletedById: hasSection2 ? null : null, // hiring_manager not in users
      submittedToServiceDeskAt: isSubmitted
        ? "2026-02-28T09:00:00.000Z"
        : null,
    };
  });

  await db.insert(schema.eisBoisForms).values(formRows);

  // ── Validation Checks ──────────────────────────────────────────────
  // Pre-computed checks for bus operators who are far enough along
  const validationRows: {
    processId: number;
    employeeId: number;
    checkType: string;
    status: string;
    details: string;
  }[] = [];

  function addCheck(
    procIdx: number,
    empIdx: number,
    checkType: string,
    status: string,
    details: Record<string, unknown>,
  ) {
    validationRows.push({
      processId: insertedProcesses[procIdx].id,
      employeeId: insertedEmployees[empIdx].id,
      checkType,
      status,
      details: JSON.stringify(details),
    });
  }

  // Marcus Johnson (0) — fully ready, all pass
  addCheck(0, 0, "ad_account_exists", "pass", {
    message: "AD account found",
    email: "mjohnson@cota.com",
  });
  addCheck(0, 0, "name_consistency", "pass", {
    expected: "Marcus Johnson",
    adDisplayName: "Marcus Johnson",
    message: "Names match",
  });
  addCheck(0, 0, "email_match", "pass", {
    adEmail: "mjohnson@cota.com",
    inforEmail: "mjohnson@cota.com",
    message: "Emails match",
  });
  addCheck(0, 0, "badge_id_reconciliation", "pass", {
    employeeId: "EMP-20260317-001",
    inforEmployeeId: "EMP-20260317-001",
    message: "IDs match",
  });
  addCheck(0, 0, "form_complete", "pass", {
    section1Complete: true,
    section2Complete: true,
    message: "Form complete",
  });
  addCheck(0, 0, "service_desk_provisioning", "pass", {
    accountEnabled: true,
    message: "Account provisioned and active",
  });
  addCheck(0, 0, "non_ad_systems", "pass", {
    inforRecord: true,
    message: "Infor record found",
  });

  // Desiree Williams (1) — warning: nickname in AD
  addCheck(1, 1, "ad_account_exists", "pass", {
    message: "AD account found",
    email: "dwilliams@cota.com",
  });
  addCheck(1, 1, "name_consistency", "warning", {
    expected: "Desiree Williams",
    adDisplayName: "Desi Williams",
    message:
      'AD display name "Desi Williams" differs from legal name "Desiree Williams"',
  });
  addCheck(1, 1, "email_match", "pass", {
    adEmail: "dwilliams@cota.com",
    inforEmail: "dwilliams@cota.com",
    message: "Emails match",
  });
  addCheck(1, 1, "badge_id_reconciliation", "pass", {
    employeeId: "EMP-20260317-002",
    inforEmployeeId: "EMP-20260317-002",
    message: "IDs match",
  });
  addCheck(1, 1, "form_complete", "pass", {
    section1Complete: true,
    section2Complete: true,
    message: "Form complete",
  });
  addCheck(1, 1, "service_desk_provisioning", "pass", {
    accountEnabled: true,
    message: "Account provisioned and active",
  });
  addCheck(1, 1, "non_ad_systems", "pass", {
    inforRecord: true,
    message: "Infor record found",
  });

  // Robert Chen (2) — name mismatch (goes by "Bob")
  addCheck(2, 2, "ad_account_exists", "pass", {
    message: "AD account found",
    email: "rchen@cota.com",
  });
  addCheck(2, 2, "name_consistency", "fail", {
    expected: "Robert Chen",
    adDisplayName: "Robert Chen",
    message:
      'Employee goes by "Bob Chen" but AD and legal records show "Robert Chen" — verify preferred name policy',
  });
  addCheck(2, 2, "email_match", "pass", {
    adEmail: "rchen@cota.com",
    inforEmail: "rchen@cota.com",
    message: "Emails match",
  });
  addCheck(2, 2, "badge_id_reconciliation", "pass", {
    employeeId: "EMP-20260317-003",
    inforEmployeeId: "EMP-20260317-003",
    message: "IDs match",
  });
  addCheck(2, 2, "form_complete", "pass", {
    section1Complete: true,
    section2Complete: true,
    message: "Form complete",
  });
  addCheck(2, 2, "service_desk_provisioning", "pass", {
    accountEnabled: true,
    message: "Account provisioned and active",
  });
  addCheck(2, 2, "non_ad_systems", "pass", {
    inforRecord: true,
    message: "Infor record found",
  });

  // Tamika Davis (3) — no AD account
  addCheck(3, 3, "ad_account_exists", "fail", {
    message: "No AD account found for tdavis@cota.com",
  });
  addCheck(3, 3, "form_complete", "pass", {
    section1Complete: true,
    section2Complete: true,
    message: "Form complete",
  });
  addCheck(3, 3, "service_desk_provisioning", "fail", {
    accountEnabled: false,
    message: "AD account does not exist — cannot provision",
  });
  addCheck(3, 3, "non_ad_systems", "pass", {
    inforRecord: true,
    message: "Infor record found",
  });

  // James Wilson (4) — form incomplete
  addCheck(4, 4, "ad_account_exists", "pass", {
    message: "AD account found",
    email: "jwilson@cota.com",
  });
  addCheck(4, 4, "name_consistency", "pass", {
    expected: "James Wilson",
    adDisplayName: "James Wilson",
    message: "Names match",
  });
  addCheck(4, 4, "form_complete", "fail", {
    section1Complete: true,
    section2Complete: false,
    message: "Section 2 (hiring manager) not yet completed",
  });
  addCheck(4, 4, "non_ad_systems", "pass", {
    inforRecord: true,
    message: "Infor record found",
  });

  // Maria Gonzalez (5) — email mismatch between AD and Infor
  addCheck(5, 5, "ad_account_exists", "pass", {
    message: "AD account found",
    email: "mgonzalez@cota.com",
  });
  addCheck(5, 5, "name_consistency", "pass", {
    expected: "Maria Gonzalez",
    adDisplayName: "Maria Gonzalez",
    message: "Names match",
  });
  addCheck(5, 5, "email_match", "fail", {
    adEmail: "mgonzalez@cota.com",
    inforEmail: "maria.gonzalez@cota.com",
    message:
      'AD email "mgonzalez@cota.com" does not match Infor email "maria.gonzalez@cota.com"',
  });
  addCheck(5, 5, "badge_id_reconciliation", "pass", {
    employeeId: "EMP-20260317-006",
    inforEmployeeId: "EMP-20260317-006",
    message: "IDs match",
  });
  addCheck(5, 5, "form_complete", "pass", {
    section1Complete: true,
    section2Complete: true,
    message: "Form complete",
  });
  addCheck(5, 5, "service_desk_provisioning", "pass", {
    accountEnabled: true,
    message: "Account provisioned and active",
  });
  addCheck(5, 5, "non_ad_systems", "pass", {
    inforRecord: true,
    message: "Infor record found",
  });

  // Devon Carter (6) — rehire, AD account disabled, badge mismatch
  addCheck(6, 6, "ad_account_exists", "pass", {
    message: "AD account found (from previous employment)",
    email: "dcarter@cota.com",
  });
  addCheck(6, 6, "name_consistency", "pass", {
    expected: "Devon Carter",
    adDisplayName: "Devon Carter",
    message: "Names match",
  });
  addCheck(6, 6, "badge_id_reconciliation", "fail", {
    currentBadge: "B-2026-0447",
    previousBadge: "B-2023-0198",
    message:
      "Rehire badge B-2026-0447 does not match previous badge B-2023-0198 on file — update required",
  });
  addCheck(6, 6, "service_desk_provisioning", "fail", {
    accountEnabled: false,
    message:
      "AD account is disabled from previous offboarding — re-enable required",
  });
  addCheck(6, 6, "non_ad_systems", "pass", {
    inforRecord: true,
    message: "Infor record found",
  });

  // Tyler Morrison (8) — admin, in progress
  addCheck(8, 8, "ad_account_exists", "pass", {
    message: "AD account found",
    email: "tmorrison@cota.com",
  });
  addCheck(8, 8, "name_consistency", "pass", {
    expected: "Tyler Morrison",
    adDisplayName: "Tyler Morrison",
    message: "Names match",
  });
  addCheck(8, 8, "form_complete", "pass", {
    section1Complete: true,
    section2Complete: true,
    message: "Form complete",
  });

  // Rachel Foster (9) — completed, all pass
  addCheck(9, 9, "ad_account_exists", "pass", {
    message: "AD account found",
    email: "rfoster@cota.com",
  });
  addCheck(9, 9, "name_consistency", "pass", {
    expected: "Rachel Foster",
    adDisplayName: "Rachel Foster",
    message: "Names match",
  });
  addCheck(9, 9, "email_match", "pass", {
    adEmail: "rfoster@cota.com",
    inforEmail: "rfoster@cota.com",
    message: "Emails match",
  });
  addCheck(9, 9, "form_complete", "pass", {
    section1Complete: true,
    section2Complete: true,
    message: "Form complete",
  });
  addCheck(9, 9, "service_desk_provisioning", "pass", {
    accountEnabled: true,
    message: "Account provisioned and active",
  });

  await db.insert(schema.validationChecks).values(validationRows);

  // ── AD Mock Data ───────────────────────────────────────────────────
  await db.insert(schema.adMockData).values([
    {
      email: "mjohnson@cota.com",
      displayName: "Marcus Johnson",
      givenName: "Marcus",
      surname: "Johnson",
      jobTitle: "Bus Operator",
      department: "Transit Operations",
      accountEnabled: 1,
      memberOf: JSON.stringify(["Transit_Operators", "All_Employees"]),
    },
    {
      email: "dwilliams@cota.com",
      displayName: "Desi Williams", // Nickname — triggers name_consistency warning
      givenName: "Desiree",
      surname: "Williams",
      jobTitle: "Bus Operator",
      department: "Transit Operations",
      accountEnabled: 1,
      memberOf: JSON.stringify(["Transit_Operators", "All_Employees"]),
    },
    {
      email: "rchen@cota.com",
      displayName: "Robert Chen", // Legal name, not "Bob"
      givenName: "Robert",
      surname: "Chen",
      jobTitle: "Bus Operator",
      department: "Transit Operations",
      accountEnabled: 1,
      memberOf: JSON.stringify(["Transit_Operators", "All_Employees"]),
    },
    // No entry for Tamika Davis — triggers ad_account_exists fail
    {
      email: "jwilson@cota.com",
      displayName: "James Wilson",
      givenName: "James",
      surname: "Wilson",
      jobTitle: "Bus Operator",
      department: "Transit Operations",
      accountEnabled: 1,
      memberOf: JSON.stringify(["Transit_Operators", "All_Employees"]),
    },
    {
      email: "mgonzalez@cota.com", // Different from Infor: maria.gonzalez@cota.com
      displayName: "Maria Gonzalez",
      givenName: "Maria",
      surname: "Gonzalez",
      jobTitle: "Bus Operator",
      department: "Transit Operations",
      accountEnabled: 1,
      memberOf: JSON.stringify(["Transit_Operators", "All_Employees"]),
    },
    {
      email: "dcarter@cota.com",
      displayName: "Devon Carter",
      givenName: "Devon",
      surname: "Carter",
      jobTitle: "Bus Operator",
      department: "Transit Operations",
      accountEnabled: 0, // Disabled from previous offboarding
      memberOf: JSON.stringify(["Transit_Operators", "All_Employees"]),
    },
    {
      email: "arobinson@cota.com",
      displayName: "Aaliyah Robinson",
      givenName: "Aaliyah",
      surname: "Robinson",
      jobTitle: "Bus Operator",
      department: "Transit Operations",
      accountEnabled: 1,
      memberOf: JSON.stringify(["Transit_Operators", "All_Employees"]),
    },
    {
      email: "tmorrison@cota.com",
      displayName: "Tyler Morrison",
      givenName: "Tyler",
      surname: "Morrison",
      jobTitle: "IT Analyst",
      department: "Information Technology",
      accountEnabled: 1,
      memberOf: JSON.stringify(["IT_Staff", "All_Employees"]),
    },
    {
      email: "rfoster@cota.com",
      displayName: "Rachel Foster",
      givenName: "Rachel",
      surname: "Foster",
      jobTitle: "Financial Analyst",
      department: "Finance",
      accountEnabled: 1,
      memberOf: JSON.stringify(["Finance_Staff", "All_Employees"]),
    },
    {
      email: "lzhang@cota.com",
      displayName: "Lisa Zhang",
      givenName: "Lisa",
      surname: "Zhang",
      jobTitle: "Operations Coordinator",
      department: "Operations",
      accountEnabled: 1,
      memberOf: JSON.stringify(["Operations_Staff", "All_Employees"]),
    },
    {
      email: "mthompson@cota.com",
      displayName: "Marcus Thompson",
      givenName: "Marcus",
      surname: "Thompson",
      jobTitle: "Supervisor",
      department: "Transit Operations",
      accountEnabled: 1,
      memberOf: JSON.stringify([
        "Transit_Supervisors",
        "Transit_Operators",
        "All_Employees",
      ]),
    },
    {
      email: "phoward@cota.com",
      displayName: "Patricia Howard",
      givenName: "Patricia",
      surname: "Howard",
      jobTitle: "Administrative Assistant",
      department: "Administration",
      accountEnabled: 0, // Offboarded
      memberOf: JSON.stringify([]),
    },
  ]);

  // ── Infor Mock Data ────────────────────────────────────────────────
  await db.insert(schema.inforMockData).values([
    {
      employeeId: "EMP-20260317-001",
      email: "mjohnson@cota.com",
      firstName: "Marcus",
      lastName: "Johnson",
      jobTitle: "Bus Operator",
      department: "Transit Operations",
      startDate: "2026-03-17",
    },
    {
      employeeId: "EMP-20260317-002",
      email: "dwilliams@cota.com",
      firstName: "Desiree",
      lastName: "Williams",
      jobTitle: "Bus Operator",
      department: "Transit Operations",
      startDate: "2026-03-17",
    },
    {
      employeeId: "EMP-20260317-003",
      email: "rchen@cota.com",
      firstName: "Robert",
      lastName: "Chen",
      jobTitle: "Bus Operator",
      department: "Transit Operations",
      startDate: "2026-03-17",
    },
    {
      employeeId: "EMP-20260317-004",
      email: "tdavis@cota.com",
      firstName: "Tamika",
      lastName: "Davis",
      jobTitle: "Bus Operator",
      department: "Transit Operations",
      startDate: "2026-03-17",
    },
    {
      employeeId: "EMP-20260317-005",
      email: "jwilson@cota.com",
      firstName: "James",
      lastName: "Wilson",
      jobTitle: "Bus Operator",
      department: "Transit Operations",
      startDate: "2026-03-17",
    },
    {
      employeeId: "EMP-20260317-006",
      email: "maria.gonzalez@cota.com", // Different from AD: mgonzalez@cota.com
      firstName: "Maria",
      lastName: "Gonzalez",
      jobTitle: "Bus Operator",
      department: "Transit Operations",
      startDate: "2026-03-17",
    },
    {
      employeeId: "EMP-20260317-007",
      email: "dcarter@cota.com",
      firstName: "Devon",
      lastName: "Carter",
      jobTitle: "Bus Operator",
      department: "Transit Operations",
      startDate: "2026-03-17",
    },
    {
      employeeId: "EMP-20260317-008",
      email: "arobinson@cota.com",
      firstName: "Aaliyah",
      lastName: "Robinson",
      jobTitle: "Bus Operator",
      department: "Transit Operations",
      startDate: "2026-03-17",
    },
    {
      employeeId: "EMP-20260320-001",
      email: "tmorrison@cota.com",
      firstName: "Tyler",
      lastName: "Morrison",
      jobTitle: "IT Analyst",
      department: "Information Technology",
      startDate: "2026-03-20",
    },
    {
      employeeId: "EMP-20260210-001",
      email: "rfoster@cota.com",
      firstName: "Rachel",
      lastName: "Foster",
      jobTitle: "Financial Analyst",
      department: "Finance",
      startDate: "2026-02-10",
    },
    {
      employeeId: "EMP-20260401-001",
      email: "kpatel@cota.com",
      firstName: "Kevin",
      lastName: "Patel",
      jobTitle: "Communications Specialist",
      department: "Communications",
      startDate: "2026-04-01",
    },
  ]);

  console.log("Database seeded successfully.");
}
