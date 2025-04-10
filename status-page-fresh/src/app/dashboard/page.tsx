"use client";

import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Welcome back{session?.user?.name ? `, ${session.user.name}` : ''}!</h2>
        <p className="text-gray-600 dark:text-gray-300">
          Use the navigation above to manage your services and incidents.
        </p>
      </div>
    </div>
  );
} 