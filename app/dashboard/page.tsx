"use client";

import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, AlertTriangle, Users } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Default to true to prevent flicker

  useEffect(() => {
    // Check if the user is authenticated
    const hasCookie = document.cookie.includes("__clerk_db_jwt");
    
    if (!hasCookie) {
      router.push("/sign-in?redirect_url=" + encodeURIComponent(window.location.href));
    }
  }, [router]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome to your status page dashboard
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/dashboard/services">
          <Card className="p-6 h-full hover:shadow-md transition-shadow border border-gray-200">
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <Box size={32} className="text-indigo-900" />
              <h2 className="text-xl font-semibold">Services</h2>
              <p className="text-gray-600">
                Manage your services and their status
              </p>
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/incidents">
          <Card className="p-6 h-full hover:shadow-md transition-shadow border border-gray-200">
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <AlertTriangle size={32} className="text-indigo-900" />
              <h2 className="text-xl font-semibold">Incidents</h2>
              <p className="text-gray-600">
                Track and manage incidents
              </p>
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/organizations">
          <Card className="p-6 h-full hover:shadow-md transition-shadow border border-gray-200">
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <Users size={32} className="text-indigo-900" />
              <h2 className="text-xl font-semibold">Team</h2>
              <p className="text-gray-600">
                Manage team members and roles
              </p>
            </div>
          </Card>
        </Link>
      </div>

      <div className="mt-8 border-t pt-6">
        <Link href="/" className="text-indigo-600 hover:text-indigo-800 flex items-center">
          <span className="mr-2">←</span> Back to Status Page
        </Link>
      </div>
    </div>
  );
} 