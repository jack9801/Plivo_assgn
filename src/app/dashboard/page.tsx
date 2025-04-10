import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

const services = [
  {
    name: "API Service",
    status: "OPERATIONAL",
    description: "Main API service for the application",
  },
  {
    name: "Database",
    status: "DEGRADED",
    description: "Primary database service",
  },
  {
    name: "Frontend",
    status: "OPERATIONAL",
    description: "Web application frontend",
  },
];

const incidents = [
  {
    title: "Database Performance Issues",
    status: "INVESTIGATING",
    severity: "MAJOR",
    createdAt: "2024-03-20T10:00:00Z",
  },
  {
    title: "API Service Maintenance",
    status: "RESOLVED",
    severity: "MINOR",
    createdAt: "2024-03-19T15:30:00Z",
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Overview</h2>
        <div className="flex gap-2">
          <Link href="/dashboard/services/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </Link>
          <Link href="/dashboard/incidents/new">
            <Button variant="outline">
              <AlertCircle className="mr-2 h-4 w-4" />
              Report Incident
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {services.map((service) => (
          <div
            key={service.name}
            className="rounded-lg border p-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{service.name}</h3>
              {service.status === "OPERATIONAL" ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : service.status === "DEGRADED" ? (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {service.description}
            </p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Recent Incidents</h3>
        <div className="rounded-lg border">
          {incidents.map((incident) => (
            <div
              key={incident.title}
              className="flex items-center justify-between border-b p-4 last:border-0"
            >
              <div>
                <h4 className="font-medium">{incident.title}</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(incident.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    incident.severity === "MAJOR"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {incident.severity}
                </span>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    incident.status === "RESOLVED"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {incident.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 