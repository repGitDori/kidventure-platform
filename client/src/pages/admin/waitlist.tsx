import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Eye, Download, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface WaitlistEntry {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  interests: string[];
  newsletter: boolean;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: Record<string, any>;
  locationInfo?: Record<string, any>;
  referrer?: string;
  createdAt: Date;
}

export default function AdminWaitlistPage() {
  const { toast } = useToast();
  const [selectedEntry, setSelectedEntry] = useState<WaitlistEntry | null>(null);
  const [, setLocation] = useLocation();

  const {
    data: waitlistEntries,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/admin/waitlist"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleViewDetails = (entry: WaitlistEntry) => {
    setSelectedEntry(entry);
  };

  const handleCloseDetails = () => {
    setSelectedEntry(null);
  };

  const exportToCsv = () => {
    if (!waitlistEntries || waitlistEntries.length === 0) return;

    // Create CSV header
    const headers = [
      "ID",
      "First Name",
      "Last Name",
      "Email",
      "Role",
      "Interests",
      "Newsletter",
      "IP Address",
      "Date Joined",
      "Referrer",
    ];

    // Format data for CSV
    const csvData = waitlistEntries.map((entry: WaitlistEntry) => [
      entry.id,
      entry.firstName,
      entry.lastName,
      entry.email,
      entry.role,
      Array.isArray(entry.interests) ? entry.interests.join(", ") : "",
      entry.newsletter ? "Yes" : "No",
      entry.ipAddress || "",
      new Date(entry.createdAt).toLocaleString(),
      entry.referrer || "",
    ]);

    // Combine header and data rows
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    // Create a downloadable blob
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Create a link and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `waitlist_data_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="container py-10">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => setLocation("/dashboard")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Waitlist Entries</CardTitle>
            <CardDescription>Loading waitlist data...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => setLocation("/dashboard")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Waitlist Entries</CardTitle>
            <CardDescription className="text-destructive">
              Error loading waitlist data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-destructive/10 p-4 rounded-md text-destructive">
              There was an error loading the waitlist entries. Please try again
              later.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation("/dashboard")} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Waitlist Entries</CardTitle>
            <CardDescription>Manage all waitlist registrations</CardDescription>
          </div>
          <Button
            onClick={exportToCsv}
            disabled={!waitlistEntries || waitlistEntries.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          {waitlistEntries && waitlistEntries.length > 0 ? (
            <Table>
              <TableCaption>List of all waitlist entries</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Date Joined</TableHead>
                  <TableHead>Interests</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waitlistEntries.map((entry: WaitlistEntry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">
                      {entry.firstName} {entry.lastName}
                    </TableCell>
                    <TableCell>{entry.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {entry.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {entry.createdAt
                        ? formatDate(new Date(entry.createdAt))
                        : "Unknown"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(entry.interests) &&
                          entry.interests.map((interest, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs"
                            >
                              {interest}
                            </Badge>
                          ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewDetails(entry)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              No waitlist entries found.
            </div>
          )}
        </CardContent>
      </Card>

      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Waitlist Entry Details</CardTitle>
              <CardDescription>
                Detailed information for {selectedEntry.firstName}{" "}
                {selectedEntry.lastName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Basic Information
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-semibold">Name:</span>{" "}
                      {selectedEntry.firstName} {selectedEntry.lastName}
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span>{" "}
                      {selectedEntry.email}
                    </p>
                    <p>
                      <span className="font-semibold">Role:</span>{" "}
                      {selectedEntry.role}
                    </p>
                    <p>
                      <span className="font-semibold">Date Joined:</span>{" "}
                      {formatDate(new Date(selectedEntry.createdAt))}
                    </p>
                    <p>
                      <span className="font-semibold">Newsletter:</span>
                      {selectedEntry.newsletter ? " Yes" : " No"}
                    </p>
                    <p>
                      <span className="font-semibold">Interests:</span>
                      {Array.isArray(selectedEntry.interests)
                        ? " " + selectedEntry.interests.join(", ")
                        : " None specified"}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Technical Information
                  </h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-semibold">IP Address:</span>{" "}
                      {selectedEntry.ipAddress || "Not available"}
                    </p>
                    <p>
                      <span className="font-semibold">Referrer:</span>{" "}
                      {selectedEntry.referrer || "Not available"}
                    </p>

                    {selectedEntry.locationInfo &&
                      Object.keys(selectedEntry.locationInfo).length > 0 && (
                        <>
                          <p className="font-semibold mt-2">
                            Location Information:
                          </p>
                          <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-32">
                            {JSON.stringify(
                              selectedEntry.locationInfo,
                              null,
                              2,
                            )}
                          </pre>
                        </>
                      )}

                    {selectedEntry.deviceInfo &&
                      Object.keys(selectedEntry.deviceInfo).length > 0 && (
                        <>
                          <p className="font-semibold mt-2">
                            Device Information:
                          </p>
                          <pre className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-32">
                            {JSON.stringify(selectedEntry.deviceInfo, null, 2)}
                          </pre>
                        </>
                      )}

                    {selectedEntry.userAgent && (
                      <>
                        <p className="font-semibold mt-2">User Agent:</p>
                        <div className="bg-muted p-2 rounded-md text-xs overflow-auto">
                          {selectedEntry.userAgent}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleCloseDetails}>Close</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
