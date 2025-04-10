import { Button } from "@/components/ui/button";
import { Plus, AlertCircle, CheckCircle2, XCircle, MoreVertical } from "lucide-react";
import Link from "next/link";

const services = [
  {
    id: "1",
    name: "API Service",
    status: "OPERATIONAL",
    description: "Main API service for the application",
    lastUpdated: "2024-03-20T10:00:00Z",
  },
  {
    id: "2",
    name: "Database",
    status: "DEGRADED",
    description: "Primary database service",
    lastUpdated: "2024-03-20T09:30:00Z",
  },
  {
    id: "3",
    name: "Frontend",
    status: "OPERATIONAL",
    description: "Web application frontend",
    lastUpdated: "2024-03-20T08:00:00Z",
  },
  {
    id: "4",
    name: "Email Service",
    status: "MAJOR_OUTAGE",
    description: "Email delivery service",
    lastUpdated: "2024-03-20T07:00:00Z",
  },
];

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Services</h2>
        <Link href="/dashboard/services/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Service
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border">
        <div className="grid grid-cols-12 border-b bg-muted/50 p-4 text-sm font-medium">
          <div className="col-span-4">Name</div>
          <div className="col-span-4">Description</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Last Updated</div>
        </div>
        {services.map((service) => (
          <div
            key={service.id}
            className="grid grid-cols-12 border-b p-4 text-sm last:border-0"
          >
            <div className="col-span-4 font-medium">{service.name}</div>
            <div className="col-span-4 text-muted-foreground">
              {service.description}
            </div>
            <div className="col-span-2">
              <div className="flex items-center gap-2">
                {service.status === "OPERATIONAL" ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : service.status === "DEGRADED" ? (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={
                    service.status === "OPERATIONAL"
                      ? "text-green-500"
                      : service.status === "DEGRADED"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }
                >
                  {service.status}
                </span>
              </div>
            </div>
            <div className="col-span-2 text-muted-foreground">
              {new Date(service.lastUpdated).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 