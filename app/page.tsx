"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

// Client-side timestamp component
function Timestamp() {
  const [timestamp, setTimestamp] = useState<string>("");

  useEffect(() => {
    setTimestamp(new Date().toLocaleString());
  }, []);

  return <p>Last updated: {timestamp}</p>;
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl">Status Page</div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">Welcome to Status Page</h1>
            <p className="text-xl text-muted-foreground">
              A modern status page for your services
            </p>
          </div>

          <div className="space-y-4">
            <p>
              This application helps you create and manage status pages for your services.
              Provide real-time updates to your users about the status of your systems.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Status Page. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 