import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Download, Mail, Phone } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  budgetOptions,
  cityOptions,
  dayOptions,
  focusTopicOptions,
  heardFromOptions,
  labelFor,
  scheduleOptions,
  type Inquiry,
  type InquiryStatus,
} from "@shared/inquiry";

const statuses: { value: InquiryStatus; label: string; className: string }[] = [
  { value: "new", label: "New", className: "bg-rose-100 text-rose-800" },
  { value: "contacted", label: "Contacted", className: "bg-amber-100 text-amber-800" },
  { value: "toured", label: "Toured", className: "bg-sky-100 text-sky-800" },
  { value: "enrolled", label: "Enrolled", className: "bg-emerald-100 text-emerald-800" },
  { value: "closed", label: "Closed", className: "bg-gray-100 text-gray-700" },
];

function ageFrom(birthdate: string) {
  const born = new Date(`${birthdate}T00:00:00`);
  const now = new Date();
  const months = (now.getFullYear() - born.getFullYear()) * 12 + (now.getMonth() - born.getMonth());
  if (months < 0) return `due ${born.toLocaleDateString()}`;
  if (months < 24) return `${months} months`;
  return `${Math.floor(months / 12)} years`;
}

const monthLabel = (ym: string) =>
  new Date(`${ym}-01T00:00:00`).toLocaleDateString(undefined, { month: "long", year: "numeric" });

const describeSchedule = (i: Inquiry) =>
  `${labelFor(scheduleOptions, i.schedule)} · ${i.days.map((d) => labelFor(dayOptions, d)).join(", ")}${
    i.hours ? ` · ${i.hours}` : ""
  }`;

function exportCsv(inquiries: Inquiry[]) {
  const headers = [
    "Date", "Status", "Parent", "Email", "Phone", "City", "Children", "Start", "Schedule",
    "Budget", "Expectations", "Focus topics", "Other topics", "Notes", "Heard from",
  ];
  const rows = inquiries.map((i) => [
    new Date(i.createdAt).toLocaleString(),
    i.status,
    i.parentName,
    i.email,
    i.phone,
    labelFor(cityOptions, i.city),
    i.children.map((c) => `${c.name || "Child"} (${ageFrom(c.birthdate)})`).join("; "),
    i.startDate,
    describeSchedule(i),
    labelFor(budgetOptions, i.budget),
    i.expectations,
    i.focusTopics.map((t) => labelFor(focusTopicOptions, t)).join("; "),
    i.otherTopics,
    i.notes,
    i.heardFrom ? labelFor(heardFromOptions, i.heardFrom) : "",
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `enrollment_requests_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 whitespace-pre-wrap">{children}</dd>
    </div>
  );
}

export default function AdminInquiriesPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [filter, setFilter] = useState<InquiryStatus | "all">("all");

  const { data: inquiries = [], isLoading, error } = useQuery<Inquiry[]>({
    queryKey: ["/api/admin/inquiries"],
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: InquiryStatus }) =>
      apiRequest("PATCH", `/api/admin/inquiries/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/inquiries"] }),
    onError: () => toast({ title: "Couldn't update status", variant: "destructive" }),
  });

  const visible = useMemo(
    () => (filter === "all" ? inquiries : inquiries.filter((i) => i.status === filter)),
    [inquiries, filter],
  );

  return (
    <div className="container max-w-5xl py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" onClick={() => setLocation("/dashboard")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <Button variant="outline" onClick={() => exportCsv(inquiries)} disabled={!inquiries.length} className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enrollment Requests</CardTitle>
          <CardDescription>Families who filled out the “Request a spot” form on the website.</CardDescription>
          <div className="flex flex-wrap gap-2 pt-2">
            {[{ value: "all" as const, label: "All" }, ...statuses].map((s) => {
              const count = s.value === "all" ? inquiries.length : inquiries.filter((i) => i.status === s.value).length;
              return (
                <Button
                  key={s.value}
                  size="sm"
                  variant={filter === s.value ? "default" : "outline"}
                  onClick={() => setFilter(s.value)}
                >
                  {s.label} ({count})
                </Button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <p className="text-muted-foreground">Loading requests…</p>}
          {error && (
            <p className="text-destructive">Couldn't load requests. Make sure you're logged in as an admin.</p>
          )}
          {!isLoading && !error && visible.length === 0 && (
            <p className="py-10 text-center text-muted-foreground">No requests here yet.</p>
          )}

          {visible.map((i) => {
            const status = statuses.find((s) => s.value === i.status) ?? statuses[0];
            return (
              <details key={i.id} className="group rounded-xl border bg-card" open={i.status === "new"}>
                <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold">
                      {i.parentName}{" "}
                      <span className="font-normal text-muted-foreground">
                        · {labelFor(cityOptions, i.city)} · {new Date(i.createdAt).toLocaleDateString()}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {i.children.length} {i.children.length === 1 ? "child" : "children"} · starting{" "}
                      {monthLabel(i.startDate)} · {labelFor(budgetOptions, i.budget)}
                    </p>
                  </div>
                  <Badge className={`${status.className} pointer-events-none border-none`}>{status.label}</Badge>
                </summary>

                <div className="space-y-5 border-t p-4">
                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm" variant="outline" className="gap-2">
                      <a href={`mailto:${i.email}`}>
                        <Mail className="h-4 w-4" /> {i.email}
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="gap-2">
                      <a href={`tel:${i.phone}`}>
                        <Phone className="h-4 w-4" /> {i.phone}
                      </a>
                    </Button>
                    <label className="ml-auto flex items-center gap-2 text-sm">
                      Status
                      <select
                        className="rounded-md border bg-background px-2 py-1"
                        value={i.status}
                        onChange={(e) => updateStatus.mutate({ id: i.id, status: e.target.value as InquiryStatus })}
                      >
                        {statuses.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <dl className="grid gap-4 text-sm sm:grid-cols-2">
                    <Detail label="Children">
                      {i.children.map((c) => `${c.name || "Child"} — ${ageFrom(c.birthdate)}`).join("\n")}
                    </Detail>
                    <Detail label="Schedule">{describeSchedule(i)}</Detail>
                    <Detail label="Budget">{labelFor(budgetOptions, i.budget)}</Detail>
                    <Detail label="Heard about us">{i.heardFrom && labelFor(heardFromOptions, i.heardFrom)}</Detail>
                  </dl>
                  <dl className="space-y-4 text-sm">
                    <Detail label="What they're hoping for">{i.expectations}</Detail>
                    <Detail label="Topics to focus on">
                      <div className="flex flex-wrap gap-1.5">
                        {i.focusTopics.map((t) => (
                          <Badge key={t} variant="secondary">
                            {labelFor(focusTopicOptions, t)}
                          </Badge>
                        ))}
                      </div>
                    </Detail>
                    <Detail label="Other topics">{i.otherTopics}</Detail>
                    <Detail label="Allergies / notes">{i.notes}</Detail>
                  </dl>
                </div>
              </details>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
