"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Organization {
  id: string;
  name: string;
}

interface Service {
  id: string;
  name: string;
}

export default function NewIncidentPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("");
  const [status, setStatus] = useState("INVESTIGATING");
  const [serviceId, setServiceId] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch organizations
        const orgResponse = await fetch("/api/organizations");
        if (orgResponse.ok) {
          const orgData = await orgResponse.json();
          setOrganizations(orgData);
          if (orgData.length > 0) {
            setOrganizationId(orgData[0].id);
            
            // Once we have an organization, fetch services for that organization
            const servicesResponse = await fetch(`/api/organizations/${orgData[0].id}/services`);
            if (servicesResponse.ok) {
              const servicesData = await servicesResponse.json();
              setServices(servicesData);
              if (servicesData.length > 0) {
                setServiceId(servicesData[0].id);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch organizations and services",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleOrganizationChange = async (value: string) => {
    setOrganizationId(value);
    try {
      const response = await fetch(`/api/organizations/${value}/services`);
      if (response.ok) {
        const data = await response.json();
        setServices(data);
        if (data.length > 0) {
          setServiceId(data[0].id);
        } else {
          setServiceId("");
        }
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !severity || !status || !serviceId || !organizationId) {
      toast({
        title: "Missing fields",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/incidents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          severity,
          status,
          serviceId,
          organizationId
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create incident");
      }

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: "Incident created successfully",
        });
        
        router.push("/dashboard/incidents");
      } else {
        throw new Error("Failed to create incident");
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create incident",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="max-w-lg mx-auto p-6 space-y-4">
        <h2 className="text-2xl font-bold">Create New Incident</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Organization</label>
            <Select value={organizationId} onValueChange={handleOrganizationChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select organization" />
              </SelectTrigger>
              <SelectContent>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Service</label>
            <Select value={serviceId} onValueChange={setServiceId} disabled={services.length === 0}>
              <SelectTrigger>
                <SelectValue placeholder={services.length === 0 ? "No services available" : "Select service"} />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>{service.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {services.length === 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                Please create a service for this organization first.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="min-h-[100px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Severity</label>
            <Select value={severity} onValueChange={setSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="Select severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INVESTIGATING">Investigating</SelectItem>
                <SelectItem value="IDENTIFIED">Identified</SelectItem>
                <SelectItem value="MONITORING">Monitoring</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="w-full mt-4" 
            onClick={handleSubmit}
            disabled={isSubmitting || !serviceId || services.length === 0}
          >
            {isSubmitting ? "Creating..." : "Create Incident"}
          </Button>
        </div>
      </Card>
    </div>
  );
} 