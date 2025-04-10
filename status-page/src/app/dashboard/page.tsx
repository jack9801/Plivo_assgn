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
  status: string;
  createdAt: string;
  service: {
    name: string;
  };
}

export default function DashboardPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, incidentsRes] = await Promise.all([
          fetch("/api/services"),
          fetch("/api/incidents"),
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

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Service Status</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white overflow-hidden shadow rounded-lg"
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {service.name}
                    </h3>
                    {service.description && (
                      <p className="mt-1 text-sm text-gray-500">
                        {service.description}
                      </p>
                    )}
                  </div>
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
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900">Recent Incidents</h2>
        <div className="mt-4">
          {incidents.length === 0 ? (
            <p className="text-gray-500">No recent incidents.</p>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {incidents.map((incident) => (
                  <li key={incident.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="sm:flex">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {incident.title}
                          </p>
                          <p className="mt-1 sm:mt-0 sm:ml-6 text-sm text-gray-500">
                            {incident.service.name}
                          </p>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {incident.status}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            Created{" "}
                            {new Date(incident.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 