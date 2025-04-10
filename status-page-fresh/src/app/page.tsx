"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface Service {
  id: string;
  name: string;
  description: string | null;
  status: string;
  updatedAt: string;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  createdAt: string;
  service: {
    name: string;
  };
}

export default function Home() {
  const [services, setServices] = useState<Service[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const [servicesRes, incidentsRes] = await Promise.all([
          fetch("/api/public/services"),
          fetch("/api/public/incidents"),
        ]);

        if (!servicesRes.ok || !incidentsRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const servicesData = await servicesRes.json();
        const incidentsData = await incidentsRes.json();

        setServices(servicesData);
        setIncidents(incidentsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        setError("Failed to load status page data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "OPERATIONAL":
        return {
          color: "text-green-500",
          bgColor: "bg-green-500",
          icon: CheckCircle2,
          text: "Operational"
        };
      case "DEGRADED":
        return {
          color: "text-yellow-500",
          bgColor: "bg-yellow-500",
          icon: AlertCircle,
          text: "Degraded"
        };
      case "OUTAGE":
        return {
          color: "text-red-500",
          bgColor: "bg-red-500",
          icon: XCircle,
          text: "Outage"
        };
      default:
        return {
          color: "text-gray-500",
          bgColor: "bg-gray-500",
          icon: AlertCircle,
          text: "Unknown"
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center p-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">System Status</h1>
        
        <div className="mb-12 space-y-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Services</h2>
          <div className="grid gap-4">
            {services.map((service) => {
              const statusInfo = getStatusInfo(service.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <div
                  key={service.id}
                  className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {service.name}
                      </h3>
                      {service.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {service.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                      <span className={`text-sm font-medium ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Recent Incidents</h2>
          {incidents.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No recent incidents reported.</p>
          ) : (
            <div className="grid gap-4">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                >
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {incident.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {incident.description}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">Service: {incident.service.name}</span>
                    <span>•</span>
                    <span>{new Date(incident.createdAt).toLocaleString()}</span>
                    <span>•</span>
                    <span className="capitalize">{incident.status.toLowerCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
