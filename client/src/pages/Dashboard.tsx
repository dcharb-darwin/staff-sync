import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  ClipboardList,
  ShieldCheck,
  CalendarDays,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Link } from "wouter";
import { PROCESS_TYPE_LABELS } from "@shared/types";
import type { ProcessType } from "@shared/types";
import { format } from "date-fns";

const typeBadgeClass: Record<string, string> = {
  onboarding: "bg-blue-100 text-blue-700 border-blue-200",
  transfer: "bg-amber-100 text-amber-700 border-amber-200",
  offboarding: "bg-red-100 text-red-700 border-red-200",
};

const statusBadgeClass: Record<string, string> = {
  initiated: "border-slate-300 text-slate-600",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  pending_review: "bg-amber-100 text-amber-700 border-amber-200",
  completed: "bg-green-100 text-green-700 border-green-200",
};

const statusLabels: Record<string, string> = {
  initiated: "Initiated",
  in_progress: "In Progress",
  pending_review: "Pending Review",
  completed: "Completed",
};

function KpiSkeleton() {
  return (
    <Card className="bg-white">
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-9 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data, isLoading } = trpc.dashboard.stats.useQuery();
  const { data: processList, isLoading: processesLoading } =
    trpc.processes.list.useQuery({});

  const activeProcesses = processList?.filter(
    (p) => p.status !== "completed"
  );

  const totalActive = data
    ? Object.values(data.activeProcesses).reduce((a, b) => a + b, 0)
    : 0;

  const totalPending = data
    ? Object.values(data.pendingTasks).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground text-sm">
          Employee lifecycle overview
        </p>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Active Processes */}
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Processes
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalActive}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {(["onboarding", "transfer", "offboarding"] as const)
                  .filter((t) => (data.activeProcesses[t] ?? 0) > 0)
                  .map(
                    (t) =>
                      `${data.activeProcesses[t]} ${PROCESS_TYPE_LABELS[t].toLowerCase()}`
                  )
                  .join(", ") || "No active processes"}
              </p>
            </CardContent>
          </Card>

          {/* Pending Tasks */}
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Tasks
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <ClipboardList className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalPending}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all active processes
              </p>
            </CardContent>
          </Card>

          {/* Readiness Status */}
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Readiness Status
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
                <ShieldCheck className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <span className="text-sm font-semibold">
                    {data.readinessStats.pass}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <span className="text-sm font-semibold">
                    {data.readinessStats.warning}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span className="text-sm font-semibold">
                    {data.readinessStats.fail}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Pass / Warning / Fail
              </p>
            </CardContent>
          </Card>

          {/* Upcoming Start Dates */}
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming Start Dates
              </CardTitle>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                <CalendarDays className="h-5 w-5 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {data.upcomingStartDates.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Starting within 10 days
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Bottom Section: Active Processes + Readiness Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Active Processes Table */}
        <Card className="lg:col-span-4 bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Processes</CardTitle>
              <Link
                href="/processes"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {processesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : activeProcesses && activeProcesses.length > 0 ? (
              <div className="space-y-1">
                {activeProcesses.slice(0, 8).map((proc) => (
                  <Link
                    key={proc.id}
                    href={`/processes/${proc.id}`}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-medium text-sm truncate">
                        {proc.employee?.firstName} {proc.employee?.lastName}
                      </span>
                      <Badge
                        className={
                          typeBadgeClass[proc.processType] ?? ""
                        }
                      >
                        {PROCESS_TYPE_LABELS[proc.processType as ProcessType] ??
                          proc.processType}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          statusBadgeClass[proc.status] ?? ""
                        }
                      >
                        {statusLabels[proc.status] ?? proc.status}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No active processes
              </p>
            )}
          </CardContent>
        </Card>

        {/* Readiness Alerts */}
        <Card className="lg:col-span-3 bg-white">
          <CardHeader>
            <CardTitle>Readiness Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : data ? (
              <div className="space-y-3">
                {data.readinessStats.fail > 0 && (
                  <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
                    <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        {data.readinessStats.fail} Failed Check
                        {data.readinessStats.fail !== 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-red-600 mt-0.5">
                        Requires immediate attention before day-one
                      </p>
                    </div>
                  </div>
                )}
                {data.readinessStats.warning > 0 && (
                  <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">
                        {data.readinessStats.warning} Warning
                        {data.readinessStats.warning !== 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-amber-600 mt-0.5">
                        Data mismatches detected across systems
                      </p>
                    </div>
                  </div>
                )}
                {data.upcomingStartDates.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Upcoming Starts
                    </p>
                    <div className="space-y-2">
                      {data.upcomingStartDates.map((emp) => (
                        <div
                          key={emp.id}
                          className="flex items-center justify-between rounded-lg border px-3 py-2"
                        >
                          <span className="text-sm font-medium">
                            {emp.firstName} {emp.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {emp.startDate
                              ? format(new Date(emp.startDate), "MMM d, yyyy")
                              : "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {data.readinessStats.fail === 0 &&
                  data.readinessStats.warning === 0 &&
                  data.upcomingStartDates.length === 0 && (
                    <div className="flex flex-col items-center py-8 text-center">
                      <ShieldCheck className="h-8 w-8 text-green-500 mb-2" />
                      <p className="text-sm font-medium">All Clear</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        No readiness alerts at this time
                      </p>
                    </div>
                  )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
