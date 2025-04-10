"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface Subscription {
  id: string;
  email: string;
  confirmed: boolean;
  createdAt: string;
  organization: {
    name: string;
    slug: string;
  };
}

export default function DebugSubscriptionsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, unconfirmed: 0 });
  const [email, setEmail] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const { toast } = useToast();

  // Fetch organizations
  useEffect(() => {
    async function fetchOrganizations() {
      try {
        const response = await fetch("/api/organizations");
        if (response.ok) {
          const data = await response.json();
          setOrganizations(data);
        }
      } catch (error) {
        console.error("Error fetching organizations:", error);
        toast({
          title: "Error",
          description: "Failed to load organizations",
          variant: "destructive",
        });
      }
    }

    fetchOrganizations();
  }, [toast]);

  // Fetch subscriptions
  async function fetchSubscriptions() {
    try {
      const response = await fetch("/api/debug-subscriptions");
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      toast({
        title: "Error",
        description: "Failed to load subscriptions",
        variant: "destructive",
      });
    }
  }

  useEffect(() => {
    fetchSubscriptions();
  }, [toast]);

  // Create subscription
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !organizationId) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/debug-subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, organizationId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Subscription created successfully",
        });
        setEmail("");
        setOrganizationId("");
        fetchSubscriptions();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create subscription",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating subscription:", error);
      toast({
        title: "Error",
        description: "Failed to create subscription",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Debug Subscriptions</h1>

      <Card>
        <CardHeader>
          <CardTitle>Create Confirmed Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Select value={organizationId} onValueChange={setOrganizationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit">Create Confirmed Subscription</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscriptions List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground mb-4">
            Total: {stats.total} subscriptions ({stats.confirmed} confirmed, {stats.unconfirmed} unconfirmed)
          </div>

          <div className="border rounded-md">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left font-medium">Email</th>
                  <th className="p-2 text-left font-medium">Organization</th>
                  <th className="p-2 text-left font-medium">Status</th>
                  <th className="p-2 text-left font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                      No subscriptions found
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((subscription) => (
                    <tr key={subscription.id} className="border-b">
                      <td className="p-2">{subscription.email}</td>
                      <td className="p-2">{subscription.organization.name}</td>
                      <td className="p-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            subscription.confirmed
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {subscription.confirmed ? "Confirmed" : "Unconfirmed"}
                        </span>
                      </td>
                      <td className="p-2">
                        {new Date(subscription.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Button onClick={fetchSubscriptions} variant="outline" className="mt-4">
            Refresh List
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2">
            <li>Use the form above to create a confirmed subscription directly in the database.</li>
            <li>The subscription will be automatically set to "confirmed" without requiring email verification.</li>
            <li>Create a new incident, incident update, or change service status to test email notifications.</li>
            <li>Check your Mailtrap inbox for the email notifications.</li>
          </ol>
          <p className="mt-4 text-sm text-muted-foreground">
            <strong>Note:</strong> This page is for debugging purposes only and bypasses the normal email confirmation process.
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 