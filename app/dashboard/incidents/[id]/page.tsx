"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, Clock, AlertTriangle } from "lucide-react";

interface Service {
  id: string;
  name: string;
}

interface Update {
  id: string;
  content: string;
  status: string;
  createdAt: string;
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
  updates: Update[];
}

export default function IncidentDetailPage({ params }: { params: { id: string } }) {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [updateContent, setUpdateContent] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchIncident();
  }, [params.id]);

  const fetchIncident = async () => {
    try {
      const response = await fetch(`/api/incidents/${params.id}`);
      if (!response.ok) throw new Error("Failed to fetch incident");
      const data = await response.json();
      setIncident(data);
      setUpdateStatus(data.status);
    } catch (error) {
      console.error("Error fetching incident:", error);
      toast({
        title: "Error",
        description: "Failed to fetch incident details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!updateContent || !updateStatus) {
      toast({
        title: "Missing fields",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/incidents/${params.id}/updates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: updateContent,
          status: updateStatus
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update incident");
      }

      toast({
        title: "Success",
        description: "Incident updated successfully",
      });
      
      setUpdateContent("");
      fetchIncident();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update incident",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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

  const getSeverityBadge = (severity: string) => {
    const styles = {
      LOW: "bg-blue-100 text-blue-800",
      MEDIUM: "bg-yellow-100 text-yellow-800",
      HIGH: "bg-orange-100 text-orange-800",
      CRITICAL: "bg-red-100 text-red-800",
    };
    return styles[severity as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading incident details...</p>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Incident Not Found</h2>
        <p className="text-gray-500 mb-4">The incident you're looking for doesn't exist or has been removed.</p>
        <Link href="/dashboard/incidents">
          <Button>Back to Incidents</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/incidents">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Incidents
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <div className="mb-4">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <h1 className="text-2xl font-bold">{incident.title}</h1>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityBadge(incident.severity)}`}>
                  {incident.severity}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(incident.status)}`}>
                  {incident.status}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
              <span>Service: {incident.service.name}</span>
              <span>Created: {new Date(incident.createdAt).toLocaleString()}</span>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p>{incident.description}</p>
          </div>

          <h3 className="text-lg font-medium mb-2">Update Incident</h3>
          <form onSubmit={handleSubmitUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <Select value={updateStatus} onValueChange={setUpdateStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INVESTIGATING">Investigating</SelectItem>
                  <SelectItem value="IDENTIFIED">Identified</SelectItem>
                  <SelectItem value="MONITORING">Monitoring</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Update Message</label>
              <Textarea
                placeholder="Provide details about this update"
                value={updateContent}
                onChange={(e) => setUpdateContent(e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting || !updateContent}
              className="w-full md:w-auto"
            >
              {isSubmitting ? "Submitting..." : "Add Update"}
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          <h3 className="text-xl font-medium">Update History</h3>
          
          {incident.updates && incident.updates.length > 0 ? (
            <div className="space-y-4">
              {incident.updates.map((update) => (
                <Card key={update.id} className="p-4 border-l-4 border-l-blue-500">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {new Date(update.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(update.status)}`}>
                      {update.status}
                    </span>
                  </div>
                  <p className="text-gray-800">{update.content}</p>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-4 text-center">
              <p className="text-gray-500">No updates added yet.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 