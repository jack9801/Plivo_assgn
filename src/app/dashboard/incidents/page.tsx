import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, CheckCircle2, XCircle, MoreVertical } from "lucide-react";
import Link from "next/link";

const incidents = [
  {
    id: "1",
    title: "Database Performance Issues",
    status: "INVESTIGATING",
    severity: "MAJOR",
    service: "Database",
    createdAt: "2024-03-20T10:00:00Z",
    updatedAt: "2024-03-20T10:30:00Z",
  },
  {
    id: "2",
    title: "API Service Maintenance",
    status: "RESOLVED",
    severity: "MINOR",
    service: "API Service",
    createdAt: "2024-03-19T15:30:00Z",
    updatedAt: "2024-03-19T16:00:00Z",
  },
  {
    id: "3",
    title: "Email Service Outage",
    status: "MONITORING",
    severity: "CRITICAL",
    service: "Email Service",
    createdAt: "2024-03-19T14:00:00Z",
    updatedAt: "2024-03-19T15:00:00Z",
  },
];

export default function IncidentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Incidents</h2>
        <Link href="/dashboard/incidents/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Report Incident
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border">
        <div className="grid grid-cols-12 border-b bg-muted/50 p-4 text-sm font-medium">
          <div className="col-span-3">Title</div>
          <div className="col-span-2">Service</div>
          <div className="col-span-2">Severity</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3">Last Updated</div>
        </div>
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className="grid grid-cols-12 border-b p-4 text-sm last:border-0"
          >
            <div className="col-span-3 font-medium">{incident.title}</div>
            <div className="col-span-2 text-muted-foreground">
              {incident.service}
            </div>
            <div className="col-span-2">
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  incident.severity === "CRITICAL"
                    ? "bg-red-100 text-red-700"
                    : incident.severity === "MAJOR"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {incident.severity}
              </span>
            </div>
            <div className="col-span-2">
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  incident.status === "RESOLVED"
                    ? "bg-green-100 text-green-700"
                    : incident.status === "MONITORING"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {incident.status}
              </span>
            </div>
            <div className="col-span-3 text-muted-foreground">
              {new Date(incident.updatedAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 