import type { ProcessType, ProcessStatus, TaskStatus } from "@shared/types";

/**
 * Shared badge style maps — single source of truth for type/status colors.
 * Uses bg-*-50 / text-*-900 / border-*-200 for readable contrast on light theme.
 */

export const typeBadgeClass: Record<ProcessType, string> = {
    onboarding: "bg-sky-50 text-sky-900 border border-sky-200 font-medium",
    transfer: "bg-amber-50 text-amber-900 border border-amber-200 font-medium",
    offboarding: "bg-rose-50 text-rose-900 border border-rose-200 font-medium",
};

export const statusBadgeClass: Record<ProcessStatus, string> = {
    initiated: "bg-slate-50 text-slate-900 border border-slate-200 font-medium",
    in_progress: "bg-sky-50 text-sky-900 border border-sky-200 font-medium",
    pending_review: "bg-amber-50 text-amber-900 border border-amber-200 font-medium",
    completed: "bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium",
};

export const taskStatusBadgeClass: Record<TaskStatus, string> = {
    pending: "bg-slate-50 text-slate-900 border border-slate-200 font-medium",
    in_progress: "bg-sky-50 text-sky-900 border border-sky-200 font-medium",
    completed: "bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium",
    skipped: "bg-gray-50 text-gray-500 border border-gray-200",
};

export const validationStatusBadgeClass: Record<string, string> = {
    pass: "bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium",
    warning: "bg-amber-50 text-amber-900 border border-amber-200 font-medium",
    fail: "bg-rose-50 text-rose-900 border border-rose-200 font-medium",
};

export const formTypeBadgeClass: Record<string, string> = {
    eis: "bg-sky-50 text-sky-900 border border-sky-200 font-medium",
    bois: "bg-teal-50 text-teal-900 border border-teal-200 font-medium",
};
