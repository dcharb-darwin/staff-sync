import type { ProcessType, ProcessStatus, TaskStatus } from "@shared/types";

/**
 * Shared badge style maps — single source of truth for type/status colors.
 * Fixes audit items #10, #13, #14: eliminates duplication across 3 pages
 * and standardizes transfer badge to amber (was purple in ProcessDetail).
 */

export const typeBadgeClass: Record<ProcessType, string> = {
    onboarding: "bg-blue-100 text-blue-700 border-blue-200",
    transfer: "bg-amber-100 text-amber-700 border-amber-200",
    offboarding: "bg-red-100 text-red-700 border-red-200",
};

export const statusBadgeClass: Record<ProcessStatus, string> = {
    initiated: "border-slate-300 text-slate-600",
    in_progress: "bg-blue-100 text-blue-700 border-blue-200",
    pending_review: "bg-amber-100 text-amber-700 border-amber-200",
    completed: "bg-green-100 text-green-700 border-green-200",
};

export const taskStatusBadgeClass: Record<TaskStatus, string> = {
    pending: "bg-slate-100 text-slate-700",
    in_progress: "bg-blue-100 text-blue-700",
    completed: "bg-green-100 text-green-700",
    skipped: "bg-slate-50 text-slate-400",
};

export const validationStatusBadgeClass: Record<string, string> = {
    pass: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    fail: "bg-red-100 text-red-700",
};
