// Process types
export const PROCESS_TYPES = ["onboarding", "transfer", "offboarding"] as const;
export type ProcessType = (typeof PROCESS_TYPES)[number];

// Process statuses
export const PROCESS_STATUSES = ["initiated", "in_progress", "pending_review", "completed"] as const;
export type ProcessStatus = (typeof PROCESS_STATUSES)[number];

// Task statuses
export const TASK_STATUSES = ["pending", "in_progress", "completed", "skipped"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

// User roles (PRD §6.1)
export const USER_ROLES = [
    "hr_generalist",
    "hr_manager",
    "service_desk_analyst",
    "service_desk_manager",
    "hiring_manager",
    "hris_analyst",
] as const;
export type UserRole = (typeof USER_ROLES)[number];

// Employee types
export const EMPLOYEE_TYPES = ["bus_operator", "admin"] as const;
export type EmployeeType = (typeof EMPLOYEE_TYPES)[number];

// Form types
export const FORM_TYPES = ["eis", "bois"] as const;
export type FormType = (typeof FORM_TYPES)[number];

// Validation check types (PRD §2.8)
export const VALIDATION_CHECK_TYPES = [
    "ad_account_exists",
    "name_consistency",
    "email_match",
    "badge_id_reconciliation",
    "form_complete",
    "service_desk_provisioning",
    "non_ad_systems",
] as const;
export type ValidationCheckType = (typeof VALIDATION_CHECK_TYPES)[number];

// Validation statuses
export const VALIDATION_STATUSES = ["pass", "warning", "fail"] as const;
export type ValidationStatus = (typeof VALIDATION_STATUSES)[number];

// Role display labels
export const ROLE_LABELS: Record<UserRole, string> = {
    hr_generalist: "HR Generalist",
    hr_manager: "HR Manager",
    service_desk_analyst: "Service Desk Analyst",
    service_desk_manager: "Service Desk Manager",
    hiring_manager: "Hiring Manager",
    hris_analyst: "HRIS Analyst",
};

// Process type display labels
export const PROCESS_TYPE_LABELS: Record<ProcessType, string> = {
    onboarding: "Onboarding",
    transfer: "Transfer",
    offboarding: "Offboarding",
};

// Validation check labels
export const VALIDATION_CHECK_LABELS: Record<ValidationCheckType, string> = {
    ad_account_exists: "AD Account Exists",
    name_consistency: "Name Consistency",
    email_match: "Email Match (AD vs Infor)",
    badge_id_reconciliation: "Badge/Employee ID Reconciliation",
    form_complete: "EIS/BOIS Form Complete",
    service_desk_provisioning: "Service Desk Provisioning",
    non_ad_systems: "Non-AD Systems Provisioning",
};

// Process status display labels (audit fix #14 — was duplicated in 3 pages)
export const PROCESS_STATUS_LABELS: Record<ProcessStatus, string> = {
    initiated: "Initiated",
    in_progress: "In Progress",
    pending_review: "Pending Review",
    completed: "Completed",
};

// Validation source provenance (audit fix #4 — D1 compliance)
export const VALIDATION_SOURCE_LABELS: Record<ValidationCheckType, string> = {
    ad_account_exists: "Active Directory",
    name_consistency: "Active Directory + Infor HR",
    email_match: "Active Directory vs Infor HR",
    badge_id_reconciliation: "Badge System + Infor HR",
    form_complete: "EIS/BOIS Form",
    service_desk_provisioning: "Service Desk Ticketing",
    non_ad_systems: "Non-AD Provisioning Systems",
};
