import { useParams } from "wouter";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
    CheckCircle,
    Clock,
    AlertTriangle,
    XCircle,
    FileText,
    ArrowLeft,
} from "lucide-react";
import {
    PROCESS_TYPE_LABELS,
    PROCESS_STATUS_LABELS,
    ROLE_LABELS,
    VALIDATION_CHECK_LABELS,
    VALIDATION_SOURCE_LABELS,
    type ProcessType,
    type ProcessStatus,
    type TaskStatus,
    type UserRole,
    type ValidationCheckType,
} from "@shared/types";
import {
    typeBadgeClass,
    statusBadgeClass,
    taskStatusBadgeClass,
    validationStatusBadgeClass,
    formTypeBadgeClass,
} from "@/lib/badge-styles";
import { format } from "date-fns";

function ValidationIcon({ status }: { status: string }) {
    if (status === "pass")
        return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (status === "warning")
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
}

export default function ProcessDetail() {
    const params = useParams<{ id: string }>();
    const processId = Number(params.id);

    const { data: process, isLoading } = trpc.processes.byId.useQuery(
        { id: processId },
        { enabled: !isNaN(processId) },
    );

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <p className="text-muted-foreground">Loading process...</p>
            </div>
        );
    }

    if (!process) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">Process not found</p>
                <Link
                    href="/processes"
                    className="text-sm text-blue-600 hover:underline"
                >
                    Back to Processes
                </Link>
            </div>
        );
    }

    const completedTasks = process.tasks.filter(
        (t) => t.status === "completed",
    ).length;
    const totalTasks = process.tasks.length;
    const progressPercent =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const form = process.forms[0] ?? null;

    const overallReadiness =
        process.validations.length > 0
            ? process.validations.every((v) => v.status === "pass")
                ? "pass"
                : process.validations.some((v) => v.status === "fail")
                  ? "fail"
                  : "warning"
            : null;

    return (
        <div className="space-y-6">
            {/* Back link */}
            <Link
                href="/processes"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Processes
            </Link>

            {/* Header */}
            <div className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-semibold tracking-tight">
                            {process.employee.firstName}{" "}
                            {process.employee.lastName}
                        </h2>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {process.employee.jobTitle && (
                                <span>{process.employee.jobTitle}</span>
                            )}
                            {process.employee.department && (
                                <>
                                    <span>·</span>
                                    <span>{process.employee.department}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge
                            className={
                                typeBadgeClass[process.processType as ProcessType] ?? ""
                            }
                        >
                            {PROCESS_TYPE_LABELS[process.processType as ProcessType] ??
                                process.processType}
                        </Badge>
                        <Badge
                            className={statusBadgeClass[process.status as ProcessStatus] ?? ""}
                        >
                            {PROCESS_STATUS_LABELS[process.status as ProcessStatus] ??
                                process.status}
                        </Badge>
                    </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            Completion
                        </span>
                        <span className="font-medium">
                            {completedTasks}/{totalTasks} tasks (
                            {progressPercent}%)
                        </span>
                    </div>
                    <Progress value={progressPercent} />
                </div>

                {process.createdAt && (
                    <p className="text-sm text-muted-foreground">
                        Started{" "}
                        {format(
                            new Date(process.createdAt),
                            "MMM d, yyyy",
                        )}
                    </p>
                )}
            </div>

            <Separator />

            {/* Section 1: Task Checklist */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Tasks</span>
                        <span className="text-sm font-normal text-muted-foreground">
                            {completedTasks}/{totalTasks} completed
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                    {process.tasks.map((task) => (
                        <div
                            key={task.id}
                            className="flex items-start gap-3 rounded-md px-2 py-2.5 hover:bg-slate-50 transition-colors"
                        >
                            <Checkbox
                                checked={task.status === "completed"}
                                disabled
                                className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                                <p
                                    className={`text-sm ${
                                        task.status === "completed"
                                            ? "line-through text-muted-foreground"
                                            : task.status === "skipped"
                                              ? "text-muted-foreground"
                                              : ""
                                    }`}
                                >
                                    {task.description}
                                </p>
                                <div className="mt-1 flex items-center gap-2 flex-wrap">
                                    <Badge
                                        variant="outline"
                                        className="text-xs"
                                    >
                                        {ROLE_LABELS[task.ownerRole as UserRole] ??
                                            task.ownerRole}
                                    </Badge>
                                    <Badge
                                        className={`text-xs ${taskStatusBadgeClass[task.status as TaskStatus] ?? ""}`}
                                    >
                                        {task.status === "in_progress"
                                            ? "In Progress"
                                            : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                    </Badge>
                                    {task.completedAt && (
                                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {format(
                                                new Date(task.completedAt),
                                                "MMM d, yyyy",
                                            )}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Section 2: EIS/BOIS Form */}
            {form && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                EIS/BOIS Form
                            </span>
                            <Badge
                                className={
                                    formTypeBadgeClass[form.formType] ?? ""
                                }
                            >
                                {form.formType.toUpperCase()}
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-3">
                            {/* Section 1 status */}
                            <div className="flex items-center justify-between rounded-md border p-3">
                                <div className="flex items-center gap-2">
                                    {form.section1CompletedAt ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className="text-sm font-medium">
                                        Section 1 — HR Information
                                    </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {form.section1CompletedAt
                                        ? format(
                                              new Date(
                                                  form.section1CompletedAt,
                                              ),
                                              "MMM d, yyyy",
                                          )
                                        : "Pending"}
                                </span>
                            </div>

                            {/* Section 2 status */}
                            <div className="flex items-center justify-between rounded-md border p-3">
                                <div className="flex items-center gap-2">
                                    {form.section2CompletedAt ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className="text-sm font-medium">
                                        Section 2 — Hiring Manager
                                    </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {form.section2CompletedAt
                                        ? format(
                                              new Date(
                                                  form.section2CompletedAt,
                                              ),
                                              "MMM d, yyyy",
                                          )
                                        : "Pending"}
                                </span>
                            </div>

                            {/* Submitted to Service Desk */}
                            <div className="flex items-center justify-between rounded-md border p-3">
                                <div className="flex items-center gap-2">
                                    {form.submittedToServiceDeskAt ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span className="text-sm font-medium">
                                        Submitted to Service Desk
                                    </span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {form.submittedToServiceDeskAt
                                        ? format(
                                              new Date(
                                                  form.submittedToServiceDeskAt,
                                              ),
                                              "MMM d, yyyy",
                                          )
                                        : "Pending"}
                                </span>
                            </div>
                        </div>

                        <Link
                            href={`/forms/${form.processId}`}
                            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                        >
                            <FileText className="h-4 w-4" />
                            View Form
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Section 3: Validation Results */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Readiness Checks</span>
                        {overallReadiness && (
                            <Badge
                                className={
                                    validationStatusBadgeClass[overallReadiness] ?? ""
                                }
                            >
                                {overallReadiness === "pass"
                                    ? "Ready"
                                    : overallReadiness === "warning"
                                      ? "Needs Attention"
                                      : "Not Ready"}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {process.validations.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No readiness checks have been run yet.
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {process.validations.map((check) => {
                                let details: { message?: string } = {};
                                try {
                                    details = check.details
                                        ? JSON.parse(check.details)
                                        : {};
                                } catch {
                                    // ignore parse errors
                                }
                                return (
                                    <div
                                        key={check.id}
                                        className="flex items-start gap-3 rounded-md border p-3"
                                    >
                                        <ValidationIcon
                                            status={check.status}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium">
                                                {VALIDATION_CHECK_LABELS[
                                                    check.checkType as ValidationCheckType
                                                ] ?? check.checkType}
                                            </p>
                                            {details.message && (
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {details.message}
                                                </p>
                                            )}
                                            <span className="mt-0.5 text-xs text-muted-foreground">
                                                Source: {VALIDATION_SOURCE_LABELS[check.checkType as ValidationCheckType] ?? check.checkType}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
