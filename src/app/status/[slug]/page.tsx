import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

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
  {
    name: "Email Service",
    status: "MAJOR_OUTAGE",
    description: "Email delivery service",
  },
];

const incidents = [
  {
    title: "Database Performance Issues",
    status: "INVESTIGATING",
    severity: "MAJOR",
    createdAt: "2024-03-20T10:00:00Z",
    updates: [
      {
        content: "We are currently investigating performance issues with our database service.",
        createdAt: "2024-03-20T10:00:00Z",
      },
      {
        content: "We have identified the issue and are working on a fix.",
        createdAt: "2024-03-20T10:30:00Z",
      },
    ],
  },
  {
    title: "API Service Maintenance",
    status: "RESOLVED",
    severity: "MINOR",
    createdAt: "2024-03-19T15:30:00Z",
    updates: [
      {
        content: "Scheduled maintenance for API service improvements.",
        createdAt: "2024-03-19T15:30:00Z",
      },
      {
        content: "Maintenance completed successfully.",
        createdAt: "2024-03-19T16:00:00Z",
      },
    ],
  },
];

export default function StatusPage({ params }: { params: { slug: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">Status Page</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Service Status</h1>
          <p className="text-muted-foreground">
            Real-time status of our services and incidents
          </p>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          <h2 className="mb-4 text-2xl font-bold">Recent Incidents</h2>
          <div className="space-y-4">
            {incidents.map((incident) => (
              <div
                key={incident.title}
                className="rounded-lg border p-4"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{incident.title}</h3>
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
                <div className="space-y-2">
                  {incident.updates.map((update, index) => (
                    <div
                      key={index}
                      className="rounded-lg bg-muted/50 p-3"
                    >
                      <p className="text-sm">{update.content}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(update.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Status Page. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
} 