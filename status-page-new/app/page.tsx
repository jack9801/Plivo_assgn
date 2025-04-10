"use client";

import { useEffect, useState } from "react";
import { ServiceStatus } from "@prisma/client";

interface Service {
  id: string;
  name: string;
  description: string | null;
  status: ServiceStatus;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  service: {
    name: string;
  };
}

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, incidentsRes] = await Promise.all([
          fetch("/api/public/services"),
          fetch("/api/public/incidents"),
        ]);

        const servicesData = await servicesRes.json();
        const incidentsData = await incidentsRes.json();

        setServices(servicesData);
        setIncidents(incidentsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket(
      `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${
        window.location.host
      }/api/ws`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "SERVICE_UPDATE") {
        setServices((prev) =>
          prev.map((service) =>
            service.id === data.service.id ? data.service : service
          )
        );
      } else if (data.type === "INCIDENT_UPDATE") {
        setIncidents((prev) => [data.incident, ...prev]);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case "OPERATIONAL":
        return "bg-green-100 text-green-800";
      case "DEGRADED_PERFORMANCE":
        return "bg-yellow-100 text-yellow-800";
      case "PARTIAL_OUTAGE":
        return "bg-orange-100 text-orange-800";
      case "MAJOR_OUTAGE":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOverallStatus = () => {
    if (services.some((s) => s.status === "MAJOR_OUTAGE")) {
      return {
        text: "Major System Outage",
        color: "bg-red-500",
      };
    }
    if (services.some((s) => s.status === "PARTIAL_OUTAGE")) {
      return {
        text: "Partial System Outage",
        color: "bg-orange-500",
      };
    }
    if (services.some((s) => s.status === "DEGRADED_PERFORMANCE")) {
      return {
        text: "Degraded System Performance",
        color: "bg-yellow-500",
      };
    }
    return {
      text: "All Systems Operational",
      color: "bg-green-500",
    };
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    );
  }

  const { text: statusText, color: statusColor } = getOverallStatus();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className={`${statusColor} transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-white text-xl font-bold text-center">
            {statusText}
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-gray-900">Current Status</h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white shadow rounded-lg overflow-hidden"
                >
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="mt-1 text-sm text-gray-500">
                        {service.description}
                      </p>
                    )}
                    <div className="mt-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          service.status
                        )}`}
                      >
                        {service.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">
              Incidents & Maintenance
            </h2>
            <div className="mt-6">
              {incidents.length === 0 ? (
                <p className="text-gray-500">No incidents reported.</p>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <ul className="divide-y divide-gray-200">
                    {incidents.map((incident) => (
                      <li key={incident.id} className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {incident.title}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              {incident.service.name}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}
                          >
                            {incident.status}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-gray-600">
                          {incident.description}
                        </p>
                        <p className="mt-2 text-sm text-gray-500">
                          {new Date(incident.createdAt).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
