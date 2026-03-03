import { useState } from "react";
import { useViewMode } from "@/contexts/ViewModeContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  Plug,
  Bell,
  GitBranch,
  Users,
  Database,
  Monitor,
  Shield,
  Server,
  Mail,
  Wrench,
  CreditCard,
  ChevronDown,
  ChevronRight,
  Clock,
  Info,
} from "lucide-react";
import { ROLE_LABELS, PROCESS_TYPE_LABELS } from "@shared/types";
import type { UserRole } from "@shared/types";

const tabs = [
  { value: "overview", label: "System Overview", icon: Settings },
  { value: "integrations", label: "Integrations", icon: Plug },
  { value: "notifications", label: "Notifications", icon: Bell },
  { value: "process-config", label: "Process Config", icon: GitBranch },
  { value: "users-roles", label: "Users & Roles", icon: Users },
] as const;

// ── Mock data ───────────────────────────────────────────────────────

const DB_STATS = {
  employees: 14,
  processes: 14,
  validationChecks: 49,
  users: 6,
};

type IntegrationStatus = "connected" | "pending" | "unavailable";

interface Integration {
  name: string;
  icon: typeof Shield;
  status: IntegrationStatus;
  description: string;
  lastSync: string;
  note?: string;
  configFields: { label: string; value: string }[];
}

const INTEGRATIONS: Integration[] = [
  {
    name: "Active Directory",
    icon: Shield,
    status: "connected",
    description:
      "Reads account status, email, group memberships, and display name for validation checks.",
    lastSync: "2 hours ago",
    configFields: [
      { label: "Protocol", value: "Microsoft Graph API" },
      { label: "Tenant", value: "cota.onmicrosoft.com" },
      { label: "Scope", value: "Read-only (User.Read.All, Group.Read.All)" },
    ],
  },
  {
    name: "Infor HR",
    icon: Server,
    status: "pending",
    description:
      "Reads employee ID, email, name, title, and start date for cross-system validation.",
    lastSync: "Never",
    note: "Access not yet confirmed — sensitive system",
    configFields: [
      { label: "API Endpoint", value: "https://infor.cota.com/api/v1" },
      { label: "Auth Method", value: "OAuth 2.0 (Client Credentials)" },
      {
        label: "Scope",
        value: "name, employeeId, email, title, startDate only",
      },
    ],
  },
  {
    name: "FreshService",
    icon: Wrench,
    status: "unavailable",
    description: "Reads ticket status and assignee for task tracking.",
    lastSync: "Never",
    note: "Migrating from current ticketing system",
    configFields: [
      { label: "API Endpoint", value: "—" },
      { label: "API Key", value: "—" },
    ],
  },
  {
    name: "Email / SMTP",
    icon: Mail,
    status: "connected",
    description:
      "Sends outbound notifications for process milestones, task assignments, and validation alerts.",
    lastSync: "2 hours ago",
    configFields: [
      { label: "SMTP Host", value: "smtp.cota.com" },
      { label: "Port", value: "587 (TLS)" },
      { label: "From Address", value: "staffsync@cota.com" },
    ],
  },
  {
    name: "Badge Database",
    icon: CreditCard,
    status: "connected",
    description:
      "Reads badge numbers and assignment dates for reconciliation.",
    lastSync: "2 hours ago",
    note: "Staff Sync can replace this spreadsheet",
    configFields: [
      { label: "Source", value: "Internal (Staff Sync DB)" },
      { label: "Legacy File", value: "SharePoint: HR/BadgeTracker.xlsx" },
    ],
  },
];

const INTEGRATION_STATUS_STYLES: Record<IntegrationStatus, string> = {
  connected: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  unavailable: "bg-slate-100 text-slate-600 border-slate-200",
};

const INTEGRATION_STATUS_LABELS: Record<IntegrationStatus, string> = {
  connected: "Connected",
  pending: "Pending",
  unavailable: "Unavailable",
};

interface NotificationType {
  name: string;
  trigger: string;
  recipients: string;
  template: string;
}

const NOTIFICATION_TYPES: NotificationType[] = [
  {
    name: "Process Initiated",
    trigger: "When an HR Generalist creates a new onboarding, transfer, or offboarding process.",
    recipients: "Hiring Manager, Service Desk",
    template:
      'Subject: New hire [Name] — EIS/BOIS ready for your section\n\nHi [Hiring Manager],\n\nA new [process type] process has been initiated for [Employee Name] with a start date of [Start Date].\n\nPlease complete Section 2 of the EIS/BOIS form:\n[Link to form]\n\nThank you,\nStaff Sync',
  },
  {
    name: "Task Assigned",
    trigger: "When a task is assigned to a team member within a process.",
    recipients: "Task Owner",
    template:
      'Subject: [Name] — [Task description] assigned to you\n\nHi [Owner Name],\n\nYou have been assigned the following task:\n\nEmployee: [Employee Name]\nTask: [Task Description]\nDue: [Start Date]\n\nView details: [Link]\n\nThank you,\nStaff Sync',
  },
  {
    name: "Validation Failed",
    trigger: "When a day-one readiness check detects a failure or warning.",
    recipients: "HR Generalist, Process Owner",
    template:
      'Subject: Day-one readiness check for [Name]: [X] issues found\n\nHi [HR Name],\n\nThe readiness check for [Employee Name] (start date: [Start Date]) has detected the following issues:\n\n[List of failures/warnings]\n\nPlease resolve before the employee\'s start date.\n\nView details: [Link]\n\nThank you,\nStaff Sync',
  },
  {
    name: "Readiness Report Generated",
    trigger:
      "When all validation checks pass for an employee and they are confirmed ready.",
    recipients: "HR Generalist, Hiring Manager",
    template:
      'Subject: [Name] — all systems confirmed ready for [Start Date]\n\nHi [HR Name],\n\nAll day-one readiness checks have passed for [Employee Name]:\n\n✓ AD account active\n✓ Name consistent across systems\n✓ Email addresses match\n✓ Badge/ID reconciled\n✓ EIS/BOIS form complete\n✓ Service desk provisioning done\n\nThe employee is ready for orientation on [Start Date].\n\nThank you,\nStaff Sync',
  },
];

const MOCK_USERS = [
  {
    name: "Kimberly Minh",
    email: "kminh@cota.com",
    role: "hr_generalist" as UserRole,
    joined: "2024-01-15",
  },
  {
    name: "Alexandra Swogger",
    email: "aswogger@cota.com",
    role: "hr_manager" as UserRole,
    joined: "2023-06-01",
  },
  {
    name: "Anthony Perez",
    email: "aperez@cota.com",
    role: "service_desk_analyst" as UserRole,
    joined: "2024-03-10",
  },
  {
    name: "Jason Hernandez",
    email: "jhernandez@cota.com",
    role: "service_desk_analyst" as UserRole,
    joined: "2024-05-22",
  },
  {
    name: "Michael Boyce",
    email: "mboyce@cota.com",
    role: "service_desk_manager" as UserRole,
    joined: "2022-11-01",
  },
  {
    name: "Sarah Chen",
    email: "schen@cota.com",
    role: "hris_analyst" as UserRole,
    joined: "2024-08-15",
  },
];

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  hr_generalist:
    "Initiates and manages onboarding/transfer processes. Enters employee data. Generates EIS/BOIS forms.",
  hr_manager:
    "Supervisory view across all processes. Aggregate reporting and approval authority.",
  service_desk_analyst:
    "Executes IT provisioning tasks (AD accounts, system access). Updates task status.",
  service_desk_manager:
    "Supervisory view across all service desk workload and task assignments.",
  hiring_manager:
    "Completes Section 2 of EIS/BOIS forms. Views status of their own hires only.",
  hris_analyst:
    "Views limited data for Infor reconciliation. Enters employee information into Infor.",
};

const PROCESS_TASK_COUNTS = {
  onboarding: 10,
  transfer: 7,
  offboarding: 6,
} as const;

// ── Component ───────────────────────────────────────────────────────

export default function AdminSettings() {
  const { isMvp, viewMode } = useViewMode();
  const [expandedNotifications, setExpandedNotifications] = useState<
    Set<number>
  >(new Set());

  function toggleNotification(index: number) {
    setExpandedNotifications((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">
          Admin & Configuration
        </h1>
        <Badge
          className={
            isMvp
              ? "bg-blue-100 text-blue-700 border-blue-200"
              : "bg-green-100 text-green-700 border-green-200"
          }
        >
          {isMvp ? "MVP" : "Vision"}
        </Badge>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Tab 1: System Overview ─────────────────────────────── */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Application Info */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Application
                </CardTitle>
                <CardDescription>
                  System information and environment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      App Name
                    </span>
                    <span className="text-sm font-medium">Staff Sync</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Version
                    </span>
                    <Badge variant="outline">1.0.0-mvp</Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Environment
                    </span>
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                      Development
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      View Mode
                    </span>
                    <Badge
                      className={
                        isMvp
                          ? "bg-blue-100 text-blue-700 border-blue-200"
                          : "bg-green-100 text-green-700 border-green-200"
                      }
                    >
                      {viewMode.toUpperCase()}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Stack</span>
                    <span className="text-sm font-medium">
                      React 19 / Vite / tRPC / SQLite
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Database Stats */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Database
                </CardTitle>
                <CardDescription>
                  Record counts from the local SQLite database
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4">
                    <p className="text-2xl font-bold">{DB_STATS.employees}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Employees
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-2xl font-bold">{DB_STATS.processes}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Processes
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-2xl font-bold">
                      {DB_STATS.validationChecks}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Validation Checks
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-2xl font-bold">{DB_STATS.users}</p>
                    <p className="text-xs text-muted-foreground mt-1">Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 2: Integrations ────────────────────────────────── */}
        <TabsContent value="integrations">
          <div className="space-y-4">
            {INTEGRATIONS.map((integration) => (
              <Card key={integration.name} className="bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <integration.icon className="h-4 w-4" />
                      {integration.name}
                    </CardTitle>
                    <Badge
                      className={
                        INTEGRATION_STATUS_STYLES[integration.status]
                      }
                    >
                      {INTEGRATION_STATUS_LABELS[integration.status]}
                    </Badge>
                  </div>
                  <CardDescription>{integration.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      Last sync: {integration.lastSync}
                    </div>

                    {integration.note && (
                      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                        <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                        <p className="text-sm text-amber-800">
                          {integration.note}
                        </p>
                      </div>
                    )}

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          Configuration
                        </span>
                        {isMvp && <Badge variant="outline">MVP</Badge>}
                      </div>
                      {integration.configFields.map((field) => (
                        <div
                          key={field.label}
                          className="grid grid-cols-3 gap-4 items-center"
                        >
                          <Label className="text-sm text-muted-foreground">
                            {field.label}
                          </Label>
                          <div className="col-span-2">
                            {isMvp ? (
                              <span className="text-sm">{field.value}</span>
                            ) : (
                              <Input defaultValue={field.value} />
                            )}
                          </div>
                        </div>
                      ))}
                      {!isMvp && (
                        <div className="flex justify-end pt-2">
                          <Button size="sm">Save Configuration</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Tab 3: Notifications ───────────────────────────────── */}
        <TabsContent value="notifications">
          <div className="space-y-4">
            {isMvp && (
              <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <Info className="h-4 w-4 text-blue-600 shrink-0" />
                <p className="text-sm text-blue-800">
                  Notification settings are read-only in MVP mode. Switch to
                  Vision mode to edit templates and toggle notifications.
                </p>
              </div>
            )}

            {NOTIFICATION_TYPES.map((notification, index) => (
              <Card key={notification.name} className="bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Bell className="h-4 w-4" />
                      {notification.name}
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      {isMvp ? (
                        <Badge variant="outline">MVP</Badge>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Label
                            htmlFor={`notify-${index}`}
                            className="text-sm"
                          >
                            Enabled
                          </Label>
                          <Switch id={`notify-${index}`} defaultChecked />
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Trigger
                      </span>
                      <p className="text-sm mt-1">{notification.trigger}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Recipients
                      </span>
                      <p className="text-sm mt-1">{notification.recipients}</p>
                    </div>

                    <Separator />

                    <button
                      type="button"
                      onClick={() => toggleNotification(index)}
                      className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
                    >
                      {expandedNotifications.has(index) ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                      {expandedNotifications.has(index)
                        ? "Hide template"
                        : "Show template preview"}
                    </button>

                    {expandedNotifications.has(index) && (
                      <div className="mt-2">
                        {isMvp ? (
                          <pre className="rounded-lg border bg-slate-50 p-4 text-xs whitespace-pre-wrap font-mono">
                            {notification.template}
                          </pre>
                        ) : (
                          <div className="space-y-2">
                            <Textarea
                              defaultValue={notification.template}
                              rows={8}
                              className="font-mono text-xs"
                            />
                            <div className="flex justify-end">
                              <Button size="sm">Save Template</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Tab 4: Process Configuration ────────────────────────── */}
        <TabsContent value="process-config">
          <div className="space-y-6">
            {/* Process Types */}
            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Process Types</CardTitle>
                  {isMvp && <Badge variant="outline">MVP</Badge>}
                </div>
                <CardDescription>
                  Task templates for each process type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(
                    ["onboarding", "transfer", "offboarding"] as const
                  ).map((type) => (
                    <div key={type} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {PROCESS_TYPE_LABELS[type]}
                        </span>
                        <Badge variant="outline">
                          {PROCESS_TASK_COUNTS[type]} tasks
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {type === "onboarding" &&
                          "Full lifecycle from data entry through day-one readiness validation."}
                        {type === "transfer" &&
                          "Role change workflow including AD group membership updates."}
                        {type === "offboarding" &&
                          "Account deactivation, access revocation, and compliance audit."}
                      </p>
                      {!isMvp && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 w-full"
                        >
                          Edit Tasks
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Validation Schedule */}
            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Validation Schedule</CardTitle>
                  {isMvp && <Badge variant="outline">MVP</Badge>}
                </div>
                <CardDescription>
                  Day-one readiness check automation settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <Label className="text-sm text-muted-foreground">
                      Schedule
                    </Label>
                    <div className="col-span-2">
                      {isMvp ? (
                        <span className="text-sm">Nightly (2:00 AM EST)</span>
                      ) : (
                        <Input defaultValue="Nightly (2:00 AM EST)" />
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <Label className="text-sm text-muted-foreground">
                      Lookahead Window
                    </Label>
                    <div className="col-span-2">
                      {isMvp ? (
                        <span className="text-sm">5 business days</span>
                      ) : (
                        <Input defaultValue="5" type="number" />
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <Label className="text-sm text-muted-foreground">
                      On-Demand
                    </Label>
                    <div className="col-span-2">
                      <span className="text-sm">
                        Available to HR Generalist and HR Manager roles
                      </span>
                    </div>
                  </div>
                  {!isMvp && (
                    <div className="flex justify-end pt-2">
                      <Button size="sm">Save Schedule</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Form Configuration */}
            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CardTitle>Form Configuration</CardTitle>
                  {isMvp && <Badge variant="outline">MVP</Badge>}
                </div>
                <CardDescription>
                  EIS and BOIS form field selection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium mb-1">
                      EIS (Employee Information Sheet)
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Used for admin / non-operator new hires
                    </p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>Section 1: Employee data (HR Generalist)</p>
                      <p>Section 2: Access profile (Hiring Manager)</p>
                    </div>
                    {!isMvp && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full"
                      >
                        Edit Fields
                      </Button>
                    )}
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm font-medium mb-1">
                      BOIS (Bus Operator Information Sheet)
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Used for bus operator new hires
                    </p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>Section 1: Employee data (HR Generalist)</p>
                      <p>Section 2: Access profile (Hiring Manager)</p>
                    </div>
                    {!isMvp && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full"
                      >
                        Edit Fields
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 5: Users & Roles ───────────────────────────────── */}
        <TabsContent value="users-roles">
          <div className="space-y-6">
            {/* User Table */}
            <Card className="bg-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>
                      Staff Sync user accounts from seed data
                    </CardDescription>
                  </div>
                  {isMvp ? (
                    <Badge variant="outline">MVP</Badge>
                  ) : (
                    <Button size="sm">Add User</Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                          Name
                        </th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                          Email
                        </th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                          Role
                        </th>
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                          Joined
                        </th>
                        {!isMvp && (
                          <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                            Actions
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_USERS.map((user) => (
                        <tr
                          key={user.email}
                          className="border-b last:border-0 hover:bg-slate-50"
                        >
                          <td className="py-3 px-2 font-medium">
                            {user.name}
                          </td>
                          <td className="py-3 px-2 text-muted-foreground">
                            {user.email}
                          </td>
                          <td className="py-3 px-2">
                            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                              {ROLE_LABELS[user.role]}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 text-muted-foreground">
                            {user.joined}
                          </td>
                          {!isMvp && (
                            <td className="py-3 px-2 text-right">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Role Definitions */}
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Role Definitions</CardTitle>
                <CardDescription>
                  User roles and permissions from PRD §6.1
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(Object.keys(ROLE_LABELS) as UserRole[]).map((role) => (
                    <div key={role} className="rounded-lg border p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {ROLE_LABELS[role]}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {role}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {ROLE_DESCRIPTIONS[role]}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
