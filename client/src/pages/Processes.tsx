import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PROCESS_TYPES,
  PROCESS_STATUSES,
  PROCESS_TYPE_LABELS,
  PROCESS_STATUS_LABELS,
} from "@shared/types";
import type { ProcessType, ProcessStatus } from "@shared/types";
import { typeBadgeClass, statusBadgeClass } from "@/lib/badge-styles";
import { ViewToggle, useViewMode } from "@/components/ViewToggle";
import { Link } from "wouter";
import { Search, Filter } from "lucide-react";
import { format } from "date-fns";

export default function Processes() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useViewMode("processes");

  const queryInput =
    typeFilter === "all" && statusFilter === "all"
      ? {}
      : {
        ...(typeFilter !== "all" && {
          processType: typeFilter as ProcessType,
        }),
        ...(statusFilter !== "all" && {
          status: statusFilter as ProcessStatus,
        }),
      };

  const { data, isLoading } = trpc.processes.list.useQuery(queryInput);

  const filtered = data?.filter((proc) => {
    if (!search) return true;
    const name =
      `${proc.employee?.firstName ?? ""} ${proc.employee?.lastName ?? ""}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Processes</h2>
        <p className="text-muted-foreground text-sm">
          Manage employee lifecycle processes
        </p>
      </div>

      {/* Filter Bar */}
      <Card className="bg-white">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {PROCESS_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {PROCESS_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {PROCESS_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {PROCESS_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Process List */}
      <Card className="bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">
            {isLoading
              ? "Loading..."
              : `${filtered?.length ?? 0} Process${(filtered?.length ?? 0) !== 1 ? "es" : ""}`}
          </CardTitle>
          <ViewToggle mode={viewMode} onModeChange={setViewMode} />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filtered && filtered.length > 0 ? (
            viewMode === "card" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((proc) => (
                  <Link
                    key={proc.id}
                    href={`/processes/${proc.id}`}
                    className="block"
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                      <CardContent className="pt-4 pb-4 space-y-3">
                        <div className="font-medium text-sm">
                          {proc.employee?.firstName} {proc.employee?.lastName}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            className={typeBadgeClass[proc.processType as ProcessType] ?? ""}
                          >
                            {PROCESS_TYPE_LABELS[
                              proc.processType as ProcessType
                            ] ?? proc.processType}
                          </Badge>
                          <Badge
                            className={statusBadgeClass[proc.status as ProcessStatus] ?? ""}
                          >
                            {PROCESS_STATUS_LABELS[proc.status as ProcessStatus] ?? proc.status}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          {proc.employee?.startDate && (
                            <div>
                              Start:{" "}
                              {format(
                                new Date(proc.employee.startDate),
                                "MMM d, yyyy"
                              )}
                            </div>
                          )}
                          <div>
                            Created:{" "}
                            {proc.createdAt
                              ? format(new Date(proc.createdAt), "MMM d, yyyy")
                              : "—"}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="divide-y">
                {filtered.map((proc) => (
                  <Link
                    key={proc.id}
                    href={`/processes/${proc.id}`}
                    className="flex items-center justify-between py-3 px-3 -mx-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
                      <span className="font-medium text-sm">
                        {proc.employee?.firstName} {proc.employee?.lastName}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={typeBadgeClass[proc.processType as ProcessType] ?? ""}
                        >
                          {PROCESS_TYPE_LABELS[
                            proc.processType as ProcessType
                          ] ?? proc.processType}
                        </Badge>
                        <Badge
                          className={statusBadgeClass[proc.status as ProcessStatus] ?? ""}
                        >
                          {PROCESS_STATUS_LABELS[proc.status as ProcessStatus] ?? proc.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                      {proc.employee?.startDate && (
                        <span className="hidden md:inline">
                          Start:{" "}
                          {format(
                            new Date(proc.employee.startDate),
                            "MMM d, yyyy"
                          )}
                        </span>
                      )}
                      <span className="hidden sm:inline">
                        Created:{" "}
                        {proc.createdAt
                          ? format(new Date(proc.createdAt), "MMM d, yyyy")
                          : "—"}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )
          ) : (
            <div className="flex flex-col items-center py-12 text-center">
              <Filter className="h-8 w-8 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">No processes found</p>
              <p className="text-xs text-muted-foreground mt-1">
                {search || typeFilter !== "all" || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No processes have been created yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
