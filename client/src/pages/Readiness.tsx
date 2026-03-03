import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
    CheckCircle,
    AlertTriangle,
    XCircle,
    RefreshCw,
    Calendar,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import {
    VALIDATION_CHECK_LABELS,
    VALIDATION_SOURCE_LABELS,
    type ValidationCheckType,
} from "@shared/types";
import { ViewToggle, useViewMode } from "@/components/ViewToggle";
import { validationStatusBadgeClass } from "@/lib/badge-styles";
import { format, addDays, isWithinInterval } from "date-fns";

function ReadinessIcon({
    status,
    className = "h-5 w-5",
}: {
    status: string;
    className?: string;
}) {
    if (status === "pass")
        return <CheckCircle className={`${className} text-green-600`} />;
    if (status === "warning")
        return <AlertTriangle className={`${className} text-amber-500`} />;
    return <XCircle className={`${className} text-red-600`} />;
}

function getOverallStatus(
    validations: { status: string }[],
): "pass" | "warning" | "fail" | "unknown" {
    if (validations.length === 0) return "unknown";
    if (validations.every((v) => v.status === "pass")) return "pass";
    if (validations.some((v) => v.status === "fail")) return "fail";
    return "warning";
}

export default function Readiness() {
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
    const [statusFilter, setStatusFilter] = useState<"pass" | "warning" | "fail" | null>(null);
    const [viewMode, setViewMode] = useViewMode("readiness");

    const { data: stats, isLoading: statsLoading } =
        trpc.dashboard.stats.useQuery();

    const { data: onboardingProcesses, isLoading: processesLoading } =
        trpc.processes.list.useQuery({ processType: "onboarding" });

    const utils = trpc.useUtils();
    const runChecks = trpc.validation.runChecks.useMutation({
        onSuccess: () => {
            utils.dashboard.stats.invalidate();
            utils.processes.list.invalidate();
        },
    });

    const isLoading = statsLoading || processesLoading;

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <p className="text-muted-foreground">
                    Loading readiness data...
                </p>
            </div>
        );
    }

    const readyCount = stats?.readinessStats.pass ?? 0;
    const warningCount = stats?.readinessStats.warning ?? 0;
    const failCount = stats?.readinessStats.fail ?? 0;

    // Filter to active (non-completed) onboarding processes with upcoming start dates
    const activeProcesses = (onboardingProcesses ?? []).filter(
        (p) => p.status !== "completed" && p.employee?.startDate,
    );

    // Sort by start date ascending
    const sortedProcesses = [...activeProcesses].sort((a, b) => {
        const dateA = a.employee?.startDate ?? "";
        const dateB = b.employee?.startDate ?? "";
        return dateA.localeCompare(dateB);
    });

    const toggleExpand = (processId: number) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(processId)) {
                next.delete(processId);
            } else {
                next.add(processId);
            }
            return next;
        });
    };

    const handleRunAllChecks = async () => {
        const employeeIds = activeProcesses
            .map((p) => p.employee?.id)
            .filter((id): id is number => id != null);
        for (const employeeId of employeeIds) {
            await runChecks.mutateAsync({ employeeId });
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Day-One Readiness
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Validate that all systems and accounts are provisioned
                        before each employee's start date.
                    </p>
                </div>
                <Button
                    onClick={handleRunAllChecks}
                    disabled={runChecks.isPending}
                    className="gap-2"
                >
                    <RefreshCw
                        className={`h-4 w-4 ${runChecks.isPending ? "animate-spin" : ""}`}
                    />
                    Run Readiness Checks
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card
                    className={`border-green-200 bg-green-50 cursor-pointer transition-shadow ${statusFilter === "pass" ? "ring-2 ring-green-500 shadow-md" : "hover:shadow-md"}`}
                    onClick={() => setStatusFilter(statusFilter === "pass" ? null : "pass")}
                >
                    <CardContent className="flex items-center gap-4 pt-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-800">
                                {readyCount}
                            </p>
                            <p className="text-sm text-green-600">
                                Checks Passing
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={`border-amber-200 bg-amber-50 cursor-pointer transition-shadow ${statusFilter === "warning" ? "ring-2 ring-amber-500 shadow-md" : "hover:shadow-md"}`}
                    onClick={() => setStatusFilter(statusFilter === "warning" ? null : "warning")}
                >
                    <CardContent className="flex items-center gap-4 pt-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                            <AlertTriangle className="h-6 w-6 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-800">
                                {warningCount}
                            </p>
                            <p className="text-sm text-amber-600">
                                Needs Attention
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card
                    className={`border-red-200 bg-red-50 cursor-pointer transition-shadow ${statusFilter === "fail" ? "ring-2 ring-red-500 shadow-md" : "hover:shadow-md"}`}
                    onClick={() => setStatusFilter(statusFilter === "fail" ? null : "fail")}
                >
                    <CardContent className="flex items-center gap-4 pt-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-red-800">
                                {failCount}
                            </p>
                            <p className="text-sm text-red-600">
                                Not Ready
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Employee List */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Upcoming Start Dates
                        {statusFilter && (
                            <Badge
                                className={
                                    validationStatusBadgeClass[statusFilter] ?? ""
                                }
                            >
                                {statusFilter === "pass" ? "Passing" : statusFilter === "warning" ? "Attention" : "Not Ready"}
                            </Badge>
                        )}
                    </CardTitle>
                    <ViewToggle mode={viewMode} onModeChange={setViewMode} />
                </CardHeader>
                <CardContent>
                    {sortedProcesses.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No upcoming employees with active onboarding
                            processes.
                        </p>
                    ) : viewMode === "card" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {sortedProcesses.map((proc) => {
                                const emp = proc.employee;
                                if (!emp) return null;

                                return (
                                    <EmployeeCard
                                        key={proc.id}
                                        processId={proc.id}
                                        employeeName={`${emp.firstName} ${emp.lastName}`}
                                        startDate={emp.startDate}
                                        department={emp.department}
                                        jobTitle={emp.jobTitle}
                                        statusFilter={statusFilter}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {sortedProcesses.map((proc) => {
                                const emp = proc.employee;
                                if (!emp) return null;

                                const isExpanded = expandedIds.has(proc.id);

                                return (
                                    <EmployeeRow
                                        key={proc.id}
                                        processId={proc.id}
                                        employeeName={`${emp.firstName} ${emp.lastName}`}
                                        startDate={emp.startDate}
                                        department={emp.department}
                                        jobTitle={emp.jobTitle}
                                        isExpanded={isExpanded}
                                        onToggle={() => toggleExpand(proc.id)}
                                        statusFilter={statusFilter}
                                    />
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function EmployeeCard({
    processId,
    employeeName,
    startDate,
    department,
    jobTitle,
    statusFilter,
}: {
    processId: number;
    employeeName: string;
    startDate: string | null;
    department: string | null;
    jobTitle: string | null;
    statusFilter: "pass" | "warning" | "fail" | null;
}) {
    const { data: process } = trpc.processes.byId.useQuery({ id: processId });
    const validations = process?.validations ?? [];
    const overallStatus = getOverallStatus(validations);

    if (statusFilter && overallStatus !== statusFilter) return null;

    const passCount = validations.filter((v) => v.status === "pass").length;
    const warnCount = validations.filter((v) => v.status === "warning").length;
    const failCountLocal = validations.filter((v) => v.status === "fail").length;

    return (
        <Link href={`/processes/${processId}`} className="block">
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="pt-4 pb-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm truncate">{employeeName}</span>
                        <div className="shrink-0">
                            {overallStatus === "unknown" ? (
                                <Badge className="bg-slate-100 text-slate-700">No Checks</Badge>
                            ) : (
                                <Badge className={validationStatusBadgeClass[overallStatus] ?? ""}>
                                    {overallStatus === "pass" ? "Ready" : overallStatus === "warning" ? "Attention" : "Not Ready"}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                        {jobTitle && <div>{jobTitle}</div>}
                        {department && <div>{department}</div>}
                        {startDate && (
                            <div>Starts {format(new Date(startDate), "MMM d, yyyy")}</div>
                        )}
                    </div>
                    {validations.length > 0 && (
                        <div className="flex items-center gap-3 text-xs">
                            {passCount > 0 && (
                                <span className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="h-3 w-3" /> {passCount}
                                </span>
                            )}
                            {warnCount > 0 && (
                                <span className="flex items-center gap-1 text-amber-500">
                                    <AlertTriangle className="h-3 w-3" /> {warnCount}
                                </span>
                            )}
                            {failCountLocal > 0 && (
                                <span className="flex items-center gap-1 text-red-600">
                                    <XCircle className="h-3 w-3" /> {failCountLocal}
                                </span>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}

function EmployeeRow({
    processId,
    employeeName,
    startDate,
    department,
    jobTitle,
    isExpanded,
    onToggle,
    statusFilter,
}: {
    processId: number;
    employeeName: string;
    startDate: string | null;
    department: string | null;
    jobTitle: string | null;
    isExpanded: boolean;
    onToggle: () => void;
    statusFilter: "pass" | "warning" | "fail" | null;
}) {
    const { data: process } = trpc.processes.byId.useQuery({ id: processId });
    const validations = process?.validations ?? [];
    const overallStatus = getOverallStatus(validations);

    if (statusFilter && overallStatus !== statusFilter) return null;

    return (
        <div className="rounded-md border">
            <button
                onClick={onToggle}
                className="flex w-full items-center gap-3 p-3 text-left hover:bg-slate-50 transition-colors"
            >
                {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Link
                            href={`/processes/${processId}`}
                            className="text-sm font-medium hover:text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {employeeName}
                        </Link>
                        {startDate && (
                            <span className="text-xs text-muted-foreground">
                                Starts{" "}
                                {format(new Date(startDate), "MMM d, yyyy")}
                            </span>
                        )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        {jobTitle && <span>{jobTitle}</span>}
                        {department && (
                            <>
                                <span>·</span>
                                <span>{department}</span>
                            </>
                        )}
                    </div>
                </div>
                <div className="shrink-0">
                    {overallStatus === "unknown" ? (
                        <Badge className="bg-slate-100 text-slate-700">
                            No Checks
                        </Badge>
                    ) : (
                        <Badge className={validationStatusBadgeClass[overallStatus] ?? ""}>
                            {overallStatus === "pass" ? "Ready" : overallStatus === "warning" ? "Attention" : "Not Ready"}
                        </Badge>
                    )}
                </div>
            </button>

            {isExpanded && validations.length > 0 && (
                <div className="border-t bg-slate-50 px-4 py-3">
                    <div className="space-y-2">
                        {validations.map((check) => {
                            let details: { message?: string } = {};
                            try {
                                details = check.details
                                    ? JSON.parse(check.details)
                                    : {};
                            } catch {
                                // ignore
                            }
                            return (
                                <div
                                    key={check.id}
                                    className="flex items-start gap-2"
                                >
                                    <ReadinessIcon
                                        status={check.status}
                                        className="h-4 w-4 mt-0.5"
                                    />
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium">
                                            {VALIDATION_CHECK_LABELS[
                                                check.checkType as ValidationCheckType
                                            ] ?? check.checkType}
                                        </p>
                                        {details.message && (
                                            <p className="text-xs text-muted-foreground">
                                                {details.message}
                                            </p>
                                        )}
                                        <p className="text-xs text-muted-foreground/70 mt-0.5">
                                            Source: {VALIDATION_SOURCE_LABELS[check.checkType as ValidationCheckType] ?? check.checkType}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {isExpanded && validations.length === 0 && (
                <div className="border-t bg-slate-50 px-4 py-3">
                    <p className="text-sm text-muted-foreground">
                        No readiness checks have been run for this employee.
                    </p>
                </div>
            )}
        </div>
    );
}
