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
import { PROCESS_TYPE_LABELS, PROCESS_STATUS_LABELS } from "@shared/types";
import type { ProcessType, ProcessStatus } from "@shared/types";
import { format } from "date-fns";
import { typeBadgeClass, statusBadgeClass } from "@/lib/badge-styles";
import { ViewToggle, useViewMode } from "@/components/ViewToggle";

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

  const [viewMode, setViewMode] = useViewMode("dashboard-processes", "list");

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
          <Link href="/processes">
            <Card className="bg-white cursor-pointer hover:shadow-md transition-shadow">
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
          </Link>

          {/* Pending Tasks */}
          <Link href="/processes">
            <Card className="bg-white cursor-pointer hover:shadow-md transition-shadow">
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
          </Link>

          {/* Readiness Status */}
          <Link href="/readiness">
            <Card className="bg-white cursor-pointer hover:shadow-md transition-shadow">
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
          </Link>

          {/* Upcoming Start Dates */}
          <Link href="/readiness">
            <Card className="bg-white cursor-pointer hover:shadow-md transition-shadow">
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
          </Link>
        </div>
      ) : null}

      {/* Bottom Section: Active Processes + Readiness Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Active Processes Table */}
        <Card className="lg:col-span-4 bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Processes</CardTitle>
              <div className="flex items-center gap-3">
                <ViewToggle mode={viewMode} onModeChange={setViewMode} />
                <Link
                  href="/processes"
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  View all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
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
              viewMode === "list" ? (
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
                            typeBadgeClass[proc.processType as ProcessType] ?? ""
                          }
                        >
                          {PROCESS_TYPE_LABELS[proc.processType as ProcessType] ??
                            proc.processType}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            statusBadgeClass[proc.status as ProcessStatus] ?? ""
                          }
                        >
                          {PROCESS_STATUS_LABELS[proc.status as ProcessStatus] ?? proc.status}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeProcesses.slice(0, 8).map((proc) => (
                    <Link key={proc.id} href={`/processes/${proc.id}`}>
                      <Card className="bg-white hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm truncate">
                              {proc.employee?.firstName} {proc.employee?.lastName}
                            </span>
                            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                typeBadgeClass[proc.processType as ProcessType] ?? ""
                              }
                            >
                              {PROCESS_TYPE_LABELS[proc.processType as ProcessType] ??
                                proc.processType}
                            </Badge>
                            <Badge
                              className={
                                statusBadgeClass[proc.status as ProcessStatus] ?? ""
                              }
                            >
                              {PROCESS_STATUS_LABELS[proc.status as ProcessStatus] ?? proc.status}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )
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
                  <Link href="/readiness">
                    <div className="flex items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 cursor-pointer hover:shadow-md transition-shadow">
                      <AlertTriangle className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-rose-900">
                          {data.readinessStats.fail} Failed Check
                          {data.readinessStats.fail !== 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-rose-600 mt-0.5">
                          Requires immediate attention before day-one
                        </p>
                      </div>
                    </div>
                  </Link>
                )}
                {data.readinessStats.warning > 0 && (
                  <Link href="/readiness">
                    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 cursor-pointer hover:shadow-md transition-shadow">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-900">
                          {data.readinessStats.warning} Warning
                          {data.readinessStats.warning !== 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-amber-600 mt-0.5">
                          Data mismatches detected across systems
                        </p>
                      </div>
                    </div>
                  </Link>
                )}
                {data.upcomingStartDates.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Upcoming Starts
                    </p>
                    <div className="space-y-2">
                      {data.upcomingStartDates.map((emp) => {
                        const empProcess = processList?.find(
                          (p) => p.employeeId === emp.id
                        );
                        return (
                          <Link
                            key={emp.id}
                            href={empProcess ? `/processes/${empProcess.id}` : "/readiness"}
                          >
                            <div className="flex items-center justify-between rounded-lg border px-3 py-2 cursor-pointer hover:bg-slate-50 transition-colors">
                              <span className="text-sm font-medium">
                                {emp.firstName} {emp.lastName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {emp.startDate
                                  ? format(new Date(emp.startDate), "MMM d, yyyy")
                                  : "—"}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
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
