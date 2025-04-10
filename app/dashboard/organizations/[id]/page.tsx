"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useSocket } from "@/lib/socket-provider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  services: Service[];
  members: Member[];
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Member {
  id: string;
  userId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrganizationDetailPage({ params }: { params: { id: string } }) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { socket } = useSocket();

  useEffect(() => {
    fetchOrganization();
  }, [params.id]);

  const fetchOrganization = async () => {
    try {
      const response = await fetch(`/api/organizations/${params.id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch organization");
      }
      const data = await response.json();
      setOrganization(data);
      setName(data.name);
      setSlug(data.slug);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch organization",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/organizations/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          slug,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update organization");
      }

      const updatedOrg = await response.json();
      
      // Emit socket event for real-time updates
      if (socket) {
        socket.emit("organization:update", updatedOrg);
      }

      toast({
        title: "Success",
        description: "Organization updated successfully",
      });
      
      setOrganization(updatedOrg);
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update organization",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this organization? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/organizations/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete organization");
      }

      // Emit socket event for real-time updates
      if (socket) {
        socket.emit("organization:delete", { id: params.id });
      }

      toast({
        title: "Success",
        description: "Organization deleted successfully",
      });
      
      router.push("/dashboard/organizations");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete organization",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="container mx-auto py-6">Loading...</div>;
  }

  if (!organization) {
    return <div className="container mx-auto py-6">Organization not found</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{organization.name}</h1>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/organizations")}
          >
            Back to Organizations
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            Delete Organization
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="mb-4">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Organization Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (URL-friendly name)</Label>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      This will be used in the URL of your status page: /status/{slug}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button type="submit">Save Changes</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setName(organization.name);
                        setSlug(organization.slug);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Name</h3>
                    <p>{organization.name}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Slug</h3>
                    <p>{organization.slug}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Created</h3>
                    <p>{new Date(organization.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Last Updated</h3>
                    <p>{new Date(organization.updatedAt).toLocaleString()}</p>
                  </div>
                  <Button onClick={() => setIsEditing(true)}>Edit Organization</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Services</CardTitle>
              <Button onClick={() => router.push(`/dashboard/organizations/${params.id}/services/new`)}>
                Add Service
              </Button>
            </CardHeader>
            <CardContent>
              {organization.services.length === 0 ? (
                <p>No services found. Add your first service to get started.</p>
              ) : (
                <div className="space-y-4">
                  {organization.services.map((service) => (
                    <div key={service.id} className="p-4 border rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {service.description || "No description"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            service.status === "OPERATIONAL" ? "bg-green-100 text-green-800" :
                            service.status === "DEGRADED" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }`}>
                            {service.status}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/services/${service.id}`)}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Members</CardTitle>
              <Button onClick={() => router.push(`/dashboard/organizations/${params.id}/members/new`)}>
                Add Member
              </Button>
            </CardHeader>
            <CardContent>
              {organization.members.length === 0 ? (
                <p>No members found. Add your first team member to get started.</p>
              ) : (
                <div className="space-y-4">
                  {organization.members.map((member) => (
                    <div key={member.id} className="p-4 border rounded-md">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">User ID: {member.userId}</h3>
                          <p className="text-sm text-muted-foreground">
                            Role: {member.role}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/organizations/${params.id}/members/${member.id}`)}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 