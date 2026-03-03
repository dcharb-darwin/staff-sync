import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

interface Section1Data {
    employeeName?: string;
    badgeNumber?: string;
    employeeId?: string;
    jobTitle?: string;
    department?: string;
    startDate?: string;
    employeeType?: string;
    workLocation?: string;
    supervisorName?: string;
}

interface Section2Data {
    profileToCopyFrom?: string;
    needsLaptop?: boolean;
    peripherals?: string;
    mapDriveLetters?: string;
    specialInstructions?: string;
    equipmentNeeded?: string[];
    systemAccess?: string[];
    workStation?: string;
    trainingSchedule?: string;
    managerApproval?: boolean;
    approvalDate?: string | null;
}

export default function EISForm() {
    const params = useParams<{ id: string }>();
    const processId = Number(params.id);

    const { data: form, isLoading: formLoading } =
        trpc.forms.getByProcessId.useQuery(
            { processId },
            { enabled: !isNaN(processId) },
        );

    const { data: process, isLoading: processLoading } =
        trpc.processes.byId.useQuery(
            { id: processId },
            { enabled: !isNaN(processId) },
        );

    const utils = trpc.useUtils();
    const submitMutation = trpc.forms.submitToServiceDesk.useMutation({
        onSuccess: () => {
            utils.forms.getByProcessId.invalidate({ processId });
        },
    });

    const isLoading = formLoading || processLoading;

    // Section 1 state
    const [s1, setS1] = useState<Section1Data>({});
    // Section 2 state
    const [s2, setS2] = useState<Section2Data>({});

    useEffect(() => {
        if (form?.section1Data) {
            try {
                setS1(JSON.parse(form.section1Data));
            } catch {
                // ignore
            }
        }
        if (form?.section2Data) {
            try {
                setS2(JSON.parse(form.section2Data));
            } catch {
                // ignore
            }
        }
    }, [form]);

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <p className="text-muted-foreground">Loading form...</p>
            </div>
        );
    }

    if (!form) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <p className="text-muted-foreground">Form not found</p>
            </div>
        );
    }

    const section1Complete = !!form.section1CompletedAt;
    const section2Complete = !!form.section2CompletedAt;
    const bothComplete = section1Complete && section2Complete;
    const isSubmitted = !!form.submittedToServiceDeskAt;

    const employeeName = process?.employee
        ? `${process.employee.firstName} ${process.employee.lastName}`
        : s1.employeeName ?? "Unknown";

    const overallStatus = isSubmitted
        ? "Submitted"
        : bothComplete
          ? "Ready to Submit"
          : "In Progress";

    return (
        <div className="space-y-6">
            <Link
                href={`/processes/${processId}`}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Process
            </Link>

            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        {employeeName}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        {form.formType === "eis"
                            ? "Employee Information Sheet"
                            : "Bidder/Operator Information Sheet"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge
                        className={
                            form.formType === "eis"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-purple-100 text-purple-700"
                        }
                    >
                        {form.formType.toUpperCase()}
                    </Badge>
                    <Badge
                        className={
                            isSubmitted
                                ? "bg-green-100 text-green-700"
                                : bothComplete
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-amber-100 text-amber-700"
                        }
                    >
                        {overallStatus}
                    </Badge>
                </div>
            </div>

            <Separator />

            {/* Section 1: HR Entry */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            {section1Complete ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                                <Clock className="h-5 w-5 text-muted-foreground" />
                            )}
                            Section 1 — HR Information
                        </span>
                        <span className="text-sm font-normal text-muted-foreground">
                            {section1Complete
                                ? `Completed ${format(new Date(form.section1CompletedAt!), "MMM d, yyyy")}`
                                : "Pending"}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="s1-name">Employee Name</Label>
                            <Input
                                id="s1-name"
                                value={s1.employeeName ?? ""}
                                readOnly={section1Complete}
                                onChange={(e) =>
                                    setS1({
                                        ...s1,
                                        employeeName: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="s1-badge">Badge Number</Label>
                            <Input
                                id="s1-badge"
                                value={s1.badgeNumber ?? ""}
                                readOnly={section1Complete}
                                onChange={(e) =>
                                    setS1({
                                        ...s1,
                                        badgeNumber: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="s1-empid">Employee ID</Label>
                            <Input
                                id="s1-empid"
                                value={s1.employeeId ?? ""}
                                readOnly={section1Complete}
                                onChange={(e) =>
                                    setS1({
                                        ...s1,
                                        employeeId: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="s1-title">Job Title</Label>
                            <Input
                                id="s1-title"
                                value={s1.jobTitle ?? ""}
                                readOnly={section1Complete}
                                onChange={(e) =>
                                    setS1({
                                        ...s1,
                                        jobTitle: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="s1-dept">Department</Label>
                            <Input
                                id="s1-dept"
                                value={s1.department ?? ""}
                                readOnly={section1Complete}
                                onChange={(e) =>
                                    setS1({
                                        ...s1,
                                        department: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="s1-start">Start Date</Label>
                            <Input
                                id="s1-start"
                                value={s1.startDate ?? ""}
                                readOnly={section1Complete}
                                onChange={(e) =>
                                    setS1({
                                        ...s1,
                                        startDate: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="s1-type">Employee Type</Label>
                            <Input
                                id="s1-type"
                                value={s1.employeeType ?? ""}
                                readOnly={section1Complete}
                                onChange={(e) =>
                                    setS1({
                                        ...s1,
                                        employeeType: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="s1-location">Work Location</Label>
                            <Input
                                id="s1-location"
                                value={s1.workLocation ?? ""}
                                readOnly={section1Complete}
                                onChange={(e) =>
                                    setS1({
                                        ...s1,
                                        workLocation: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="s1-supervisor">
                                Supervisor Name
                            </Label>
                            <Input
                                id="s1-supervisor"
                                value={s1.supervisorName ?? ""}
                                readOnly={section1Complete}
                                onChange={(e) =>
                                    setS1({
                                        ...s1,
                                        supervisorName: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Section 2: Hiring Manager */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            {section2Complete ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                                <Clock className="h-5 w-5 text-muted-foreground" />
                            )}
                            Section 2 — Hiring Manager
                        </span>
                        <span className="text-sm font-normal text-muted-foreground">
                            {section2Complete
                                ? `Completed ${format(new Date(form.section2CompletedAt!), "MMM d, yyyy")}`
                                : "Pending"}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="s2-profile">
                                Profile to Copy From
                            </Label>
                            <Input
                                id="s2-profile"
                                placeholder="Enter existing employee username to copy profile"
                                value={s2.profileToCopyFrom ?? ""}
                                readOnly={section2Complete}
                                onChange={(e) =>
                                    setS2({
                                        ...s2,
                                        profileToCopyFrom: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <Switch
                                id="s2-laptop"
                                checked={s2.needsLaptop ?? false}
                                disabled={section2Complete}
                                onCheckedChange={(checked) =>
                                    setS2({ ...s2, needsLaptop: checked })
                                }
                            />
                            <Label htmlFor="s2-laptop">Needs Laptop</Label>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="s2-peripherals">Peripherals</Label>
                            <Textarea
                                id="s2-peripherals"
                                placeholder="List any peripherals needed (monitor, keyboard, mouse, etc.)"
                                value={s2.peripherals ?? ""}
                                readOnly={section2Complete}
                                onChange={(e) =>
                                    setS2({
                                        ...s2,
                                        peripherals: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="s2-drives">
                                Map Drive Letters / Paths
                            </Label>
                            <Textarea
                                id="s2-drives"
                                placeholder="List drive letters and paths to map (e.g., S: \\server\share)"
                                value={s2.mapDriveLetters ?? ""}
                                readOnly={section2Complete}
                                onChange={(e) =>
                                    setS2({
                                        ...s2,
                                        mapDriveLetters: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="s2-special">
                                Special Instructions
                            </Label>
                            <Textarea
                                id="s2-special"
                                placeholder="Any special instructions for IT setup"
                                value={
                                    s2.specialInstructions ?? ""
                                }
                                readOnly={section2Complete}
                                onChange={(e) =>
                                    setS2({
                                        ...s2,
                                        specialInstructions: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Footer */}
            <div className="flex items-center justify-between rounded-lg border bg-white p-4">
                {isSubmitted ? (
                    <div className="flex items-center gap-2 text-sm text-green-700">
                        <CheckCircle className="h-4 w-4" />
                        Submitted to Service Desk on{" "}
                        {format(
                            new Date(form.submittedToServiceDeskAt!),
                            "MMM d, yyyy 'at' h:mm a",
                        )}
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-muted-foreground">
                            {bothComplete
                                ? "Both sections complete. Ready to submit."
                                : "Complete both sections before submitting."}
                        </p>
                        <Button
                            disabled={!bothComplete || submitMutation.isPending}
                            onClick={() => submitMutation.mutate({ processId })}
                        >
                            {submitMutation.isPending ? "Submitting..." : "Submit to Service Desk"}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
