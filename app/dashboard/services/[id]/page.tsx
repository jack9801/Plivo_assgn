"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSocket } from "@/lib/socket-provider";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Link from "next/link";

interface Service {
  id: string;
  name: string;
  description: string | null;
  status: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
}

interface UptimeData {
  period: {
    days: number;
    start: string;
    end: string;
  };
  metrics: {
    overallUptime: number;
    daily: Array<{
      date: string;
      uptime: number;
    }>;
  };
}

export default function ServiceDetailPage({ params }: { params: { id: string } }) {
  const [service, setService] = useState<Service | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("OPERATIONAL");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [uptimeData, setUptimeData] = useState<UptimeData | null>(null);
  const [timeRange, setTimeRange] = useState("30"); // Default to 30 days
  const { toast } = useToast();
  const router = useRouter();
  const { socket } = useSocket();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchService();
    fetchUptimeData(timeRange);
  }, [params.id]);

  const fetchService = async () => {
    try {
      const response = await fetch(`/api/services/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch service");
      }
      const data = await response.json();
      setService(data);
      setName(data.name);
      setDescription(data.description || "");
      setStatus(data.status);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch service details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUptimeData = async (days: string) => {
    try {
      const response = await fetch(`/api/services/${params.id}/metrics?days=${days}`);
      if (!response.ok) {
        throw new Error("Failed to fetch uptime data");
      }
      const data = await response.json();
      setUptimeData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch uptime metrics",
        variant: "destructive",
      });
    }
  };

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value);
    fetchUptimeData(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast({
        title: "Missing fields",
        description: "Service name is required",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/services/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          description,
          status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update service");
      }

      toast({
        title: "Success",
        description: "Service updated successfully",
      });
      
      fetchService(); // Refresh data
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update service",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this service? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/services/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete service");
      }

      // Emit socket event for real-time updates
      if (socket) {
        socket.emit("service:delete", { id: params.id });
      }

      toast({
        title: "Success",
        description: "Service deleted successfully",
      });
      
      router.push(`/dashboard/organizations/${service?.organizationId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (serviceStatus: string) => {
    switch (serviceStatus) {
      case "OPERATIONAL":
        return "bg-green-100 text-green-800";
      case "DEGRADED":
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
    return <div className="container mx-auto py-6">Loading...</div>;
  }

  if (!service) {
    return <div className="container mx-auto py-6">Service not found</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Edit Service</h1>
        <div className="flex space-x-2">
          <Link href={`/dashboard/organizations/${service.organizationId}?tab=services`}>
            <Button variant="outline">Back to Organization</Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Service
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="uptime">Uptime Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Service Name *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPERATIONAL">Operational</SelectItem>
                        <SelectItem value="DEGRADED">Degraded</SelectItem>
                        <SelectItem value="PARTIAL_OUTAGE">Partial Outage</SelectItem>
                        <SelectItem value="MAJOR_OUTAGE">Major Outage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting || !name}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Name</h3>
                    <p>{service.name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Description</h3>
                    <p>{service.description || "No description provided"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Status</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                      {service.status.replace("_", " ")}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium">Created</h3>
                    <p>{new Date(service.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Last Updated</h3>
                    <p>{new Date(service.updatedAt).toLocaleString()}</p>
                  </div>
                  <Button onClick={() => setIsEditing(true)}>Edit Service</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uptime">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Uptime Metrics</CardTitle>
                <Select
                  value={timeRange}
                  onValueChange={handleTimeRangeChange}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="60">Last 60 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {uptimeData ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">Overall Uptime</h3>
                      <div className="text-3xl font-bold">
                        {uptimeData.metrics.overallUptime}%
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Operational (100-99%)</span>
                      <div className="w-3 h-3 rounded-full bg-yellow-500 ml-2"></div>
                      <span>Degraded (98-95%)</span>
                      <div className="w-3 h-3 rounded-full bg-red-500 ml-2"></div>
                      <span>Outage (&lt;95%)</span>
                    </div>
                  </div>
                  
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={uptimeData.metrics.daily}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        />
                        <YAxis 
                          domain={[90, 100]} 
                          tick={{ fontSize: 12 }} 
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip 
                          formatter={(value: number) => [`${value}%`, 'Uptime']}
                          labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="uptime"
                          name="Uptime %"
                          stroke="#4f46e5"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="text-sm text-gray-500 text-center">
                    Showing data from {new Date(uptimeData.period.start).toLocaleDateString()} to {new Date(uptimeData.period.end).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">No uptime data available yet. This data will appear once status changes occur.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 