"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Plus, AlertCircle } from "lucide-react";

interface Service {
  id: string;
  name: string;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  createdAt: string;
  updatedAt: string;
  service: Service;
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      // First, fetch the first organization as a temporary solution
      const orgResponse = await fetch("/api/organizations");
      if (!orgResponse.ok) throw new Error("Failed to fetch organizations");
      const organizations = await orgResponse.json();
      
      if (organizations.length === 0) {
        // No organizations, so no incidents to fetch
        setIncidents([]);
        return;
      }
      
      // Use the first organization's ID
      const organizationId = organizations[0].id;
      
      const response = await fetch(`/api/incidents?organizationId=${organizationId}`);
      if (!response.ok) throw new Error("Failed to fetch incidents");
      const data = await response.json();
      setIncidents(data);
    } catch (error) {
      console.error("Error fetching incidents:", error);
      toast({
        title: "Error",
        description: "Failed to fetch incidents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const styles = {
      LOW: "bg-blue-100 text-blue-800",
      MEDIUM: "bg-yellow-100 text-yellow-800",
      HIGH: "bg-orange-100 text-orange-800",
      CRITICAL: "bg-red-100 text-red-800",
    };
    return styles[severity as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      INVESTIGATING: "bg-yellow-100 text-yellow-800",
      IDENTIFIED: "bg-blue-100 text-blue-800",
      MONITORING: "bg-purple-100 text-purple-800",
      RESOLVED: "bg-green-100 text-green-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading incidents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Incidents</h1>
        <Link href="/dashboard/incidents/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Incident
          </Button>
        </Link>
      </div>

      {incidents.length === 0 ? (
        <Card className="p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">No incidents found</h3>
          <p className="text-gray-500 mb-4">
            No incidents have been reported yet. Create your first incident to get started.
          </p>
          <Link href="/dashboard/incidents/new">
            <Button>Create First Incident</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {incidents.map((incident) => (
            <Card key={incident.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <Link href={`/dashboard/incidents/${incident.id}`}>
                    <h2 className="text-lg font-medium hover:text-blue-600 transition-colors">
                      {incident.title}
                    </h2>
                  </Link>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1 text-sm text-gray-500">
                    <span>Service: {incident.service.name}</span>
                    <span>Created: {new Date(incident.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityBadge(incident.severity)}`}>
                    {incident.severity}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(incident.status)}`}>
                    {incident.status}
                  </span>
                  <Link href={`/dashboard/incidents/${incident.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 