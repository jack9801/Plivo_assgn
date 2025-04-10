"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/lib/socket-provider";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Service {
  id: string;
  name: string;
  description: string | null;
  status: string;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  createdAt: string;
  service: Service;
  updates: Update[];
}

interface Update {
  id: string;
  content: string;
  status: string;
  createdAt: string;
}

interface StatusData {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  status: string;
  services: Service[];
  activeIncidents: Incident[];
  recentIncidents: Incident[];
}

export default function StatusPage({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState("services");
  const [statusData, setStatusData] = useState<StatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    console.log("Status page mounted, slug:", params.slug);
    fetchStatusData();

    // Set up socket listeners for real-time updates
    if (socket) {
      console.log("Setting up socket listeners");
      socket.on("service:updated", handleServiceUpdate);
      socket.on("incident:created", handleIncidentCreated);
      socket.on("incident:updated", handleIncidentUpdated);

      return () => {
        console.log("Cleaning up socket listeners");
        socket.off("service:updated", handleServiceUpdate);
        socket.off("incident:created", handleIncidentCreated);
        socket.off("incident:updated", handleIncidentUpdated);
      };
    }
  }, [params.slug, socket]);

  const fetchStatusData = async () => {
    try {
      console.log(`Fetching status data for slug: ${params.slug}`);
      const url = `/api/public/status?slug=${params.slug}`;
      console.log("Request URL:", url);
      
      const response = await fetch(url, {
        cache: 'no-store'
      });
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response: ${response.status} - ${errorText}`);
        setError(`Failed to fetch status data: ${response.status}`);
        throw new Error(`Failed to fetch status data: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Status data received:", {
        organizationName: data.organization?.name,
        servicesCount: data.services?.length || 0,
        activeIncidentsCount: data.activeIncidents?.length || 0,
        recentIncidentsCount: data.recentIncidents?.length || 0
      });
      
      setStatusData(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching status data:", error);
      setError(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceUpdate = (data: any) => {
    if (statusData) {
      console.log("Service update received:", data);
      const updatedServices = statusData.services.map(service => 
        service.id === data.id ? { ...service, status: data.status } : service
      );
      
      setStatusData({
        ...statusData,
        services: updatedServices
      });
    }
  };

  const handleIncidentCreated = (data: any) => {
    if (statusData) {
      console.log("New incident received:", data);
      setStatusData({
        ...statusData,
        activeIncidents: [data, ...statusData.activeIncidents],
        recentIncidents: [data, ...statusData.recentIncidents.slice(0, 9)]
      });
    }
  };

  const handleIncidentUpdated = (data: any) => {
    if (statusData) {
      console.log("Incident update received:", data);
      const updatedActiveIncidents = statusData.activeIncidents.map(incident => 
        incident.id === data.id ? data : incident
      ).filter(incident => incident.status !== "RESOLVED");
      
      const updatedRecentIncidents = statusData.recentIncidents.map(incident => 
        incident.id === data.id ? data : incident
      );
      
      setStatusData({
        ...statusData,
        activeIncidents: updatedActiveIncidents,
        recentIncidents: updatedRecentIncidents
      });
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !statusData) return;
    
    setIsSubscribing(true);
    setSubscriptionMessage("");
    
    try {
      console.log("Submitting subscription for:", email);
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          organizationId: statusData.organization.id
        })
      });
      
      console.log("Subscription response status:", response.status);
      const data = await response.json();
      
      if (response.ok) {
        console.log("Subscription successful");
        setSubscriptionMessage("Thank you! Please check your email to confirm your subscription.");
        setEmail("");
      } else {
        console.error("Subscription failed:", data.error);
        setSubscriptionMessage(`Error: ${data.error || "Failed to subscribe"}`);
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      setSubscriptionMessage("An error occurred. Please try again later.");
    } finally {
      setIsSubscribing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPERATIONAL":
        return <span className="px-2 py-0.5 bg-green-600 text-black rounded text-xs">Operational</span>;
      case "DEGRADED":
        return <span className="px-2 py-0.5 bg-yellow-500 text-black rounded text-xs">Degraded Performance</span>;
      case "PARTIAL_OUTAGE":
        return <span className="px-2 py-0.5 bg-orange-500 text-black rounded text-xs">Partial Outage</span>;
      case "MAJOR_OUTAGE":
        return <span className="px-2 py-0.5 bg-red-500 text-black rounded text-xs">Major Outage</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-500 text-white rounded text-xs">{status}</span>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "LOW":
        return <span className="px-2 py-0.5 bg-blue-500 text-black rounded text-xs">Low</span>;
      case "MEDIUM":
        return <span className="px-2 py-0.5 bg-yellow-500 text-black rounded text-xs">Medium</span>;
      case "HIGH":
        return <span className="px-2 py-0.5 bg-orange-500 text-black rounded text-xs">High</span>;
      case "CRITICAL":
        return <span className="px-2 py-0.5 bg-red-500 text-black rounded text-xs">Critical</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-500 text-white rounded text-xs">{severity}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading status page...</h1>
          <p className="text-gray-400">Loading information for {params.slug}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error loading status page</h1>
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={fetchStatusData} className="bg-gray-700 hover:bg-gray-600">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!statusData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Status page not found</h1>
          <p className="text-gray-400">The organization you're looking for doesn't exist or is not accessible.</p>
          <p className="text-gray-400 mt-2">Tried to load: {params.slug}</p>
        </div>
      </div>
    );
  }

  const getSystemStatus = () => {
    switch (statusData.status) {
      case "OPERATIONAL":
        return "All systems are currently operational";
      case "DEGRADED":
        return "Some systems experiencing degraded performance";
      case "PARTIAL_OUTAGE":
        return "Some systems experiencing a partial outage";
      case "MAJOR_OUTAGE":
        return "Major outage in progress";
      default:
        return "System status unknown";
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4">
        <header className="pt-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-400">
              {statusData.organization.name}
            </div>
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">
              Dashboard
            </Link>
          </div>
        </header>

        <main className="py-8">
          <h1 className="text-3xl font-bold text-white mb-2">Public Status Page</h1>
          <p className="text-xl pb-4">{getSystemStatus()}</p>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            {/* Tabs */}
            <div className="flex space-x-4 text-sm font-medium border-b border-gray-800 w-full md:w-auto">
              <button 
                onClick={() => setActiveTab("services")} 
                className={`pb-2 ${activeTab === "services" ? "border-b-2 border-white font-medium" : "text-gray-500 hover:text-white"}`}
              >
                Services
              </button>
              <button 
                onClick={() => setActiveTab("incidents")} 
                className={`pb-2 ${activeTab === "incidents" ? "border-b-2 border-white font-medium" : "text-gray-500 hover:text-white"}`}
              >
                Incidents
              </button>
              <button 
                onClick={() => setActiveTab("timeline")} 
                className={`pb-2 ${activeTab === "timeline" ? "border-b-2 border-white font-medium" : "text-gray-500 hover:text-white"}`}
              >
                Timeline
              </button>
            </div>

            {/* Status & Timestamp */}
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 text-sm text-gray-400">
              <span className={`${
                statusData.status === "OPERATIONAL" ? "text-green-400" : 
                statusData.status === "DEGRADED" ? "text-yellow-400" : 
                statusData.status === "PARTIAL_OUTAGE" ? "text-orange-400" : 
                "text-red-400"
              } font-semibold`}>
                {statusData.status.replace("_", " ")}
              </span>
              <span>Last updated: {new Date().toLocaleString()}</span>
            </div>
          </div>

          <div className="mt-6 mb-10">
            {activeTab === "services" && (
              <div className="space-y-4">
                {!statusData.services || statusData.services.length === 0 ? (
                  <p className="text-gray-400">No services found for this organization.</p>
                ) : (
                  <div className="space-y-3">
                    {statusData.services.map((service) => (
                      <div key={service.id} className="py-3 px-4 border border-gray-800 rounded-md flex justify-between items-center bg-gray-900">
                        <div>
                          <span className="font-medium">{service.name}</span>
                          {service.description && (
                            <p className="text-sm text-gray-400 mt-1">{service.description}</p>
                          )}
                        </div>
                        <div>{getStatusBadge(service.status)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "incidents" && (
              <div className="space-y-4">
                {statusData.activeIncidents && statusData.activeIncidents.length > 0 ? (
                  statusData.activeIncidents.map((incident) => (
                    <div key={incident.id} className="border border-gray-800 rounded-md p-4 bg-gray-900">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-medium text-lg">{incident.title}</h3>
                        <div className="flex gap-2">
                          {getSeverityBadge(incident.severity)}
                          {getStatusBadge(incident.status)}
                        </div>
                      </div>
                      <p className="text-gray-400 mb-2">{incident.description}</p>
                      <p className="text-sm text-gray-500">
                        Affects: {incident.service?.name || "Unknown service"}
                      </p>
                      
                      {incident.updates && incident.updates.length > 0 && (
                        <div className="mt-4 ml-4">
                          <h4 className="text-sm font-medium mb-2">Latest Updates</h4>
                          <div className="space-y-2">
                            {incident.updates.slice(0, 3).map((update) => (
                              <div key={update.id} className="text-sm border-l-2 border-gray-700 pl-3 py-1">
                                <p>{update.content}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(update.createdAt).toLocaleString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No active incidents at this time</p>
                )}
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="space-y-4">
                {!statusData.recentIncidents || statusData.recentIncidents.length === 0 ? (
                  <p className="text-gray-400">No recent incidents</p>
                ) : (
                  <div className="space-y-4">
                    {statusData.recentIncidents.map((incident) => (
                      <div key={incident.id} className="border border-gray-800 rounded-md p-4 bg-gray-900">
                        <div className="text-sm text-gray-500 mb-1">
                          {new Date(incident.createdAt).toLocaleString()}
                        </div>
                        <h3 className="font-medium mb-1">{incident.title}</h3>
                        <div className="flex gap-2 mb-2">
                          {getSeverityBadge(incident.severity)}
                          {getStatusBadge(incident.status)}
                        </div>
                        <p className="text-sm text-gray-400">
                          {incident.service?.name}: {incident.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-2">Subscribe to Updates</h2>
            <p className="text-gray-400 mb-4">
              Get notified when services go down or incidents occur.
            </p>
            
            <form onSubmit={handleSubscribe} className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white px-4 py-2 rounded-md w-full max-w-md"
              />
              <Button type="submit" disabled={isSubscribing} className="bg-gray-700 hover:bg-gray-600 text-white w-auto">
                {isSubscribing ? "Subscribing..." : "Subscribe"}
              </Button>
            </form>
            
            {subscriptionMessage && (
              <div className={`mt-2 text-sm ${subscriptionMessage.startsWith("Error") ? "text-red-400" : "text-green-400"}`}>
                {subscriptionMessage}
              </div>
            )}
            
            <p className="text-xs text-gray-500 mt-2">
              We'll only email you when important status changes occur.
            </p>
          </div>
        </main>

        <footer className="py-4 mt-4 text-center">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} {statusData.organization.name}. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}