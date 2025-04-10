import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Settings, AlertCircle, Users } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-background">
        <div className="flex h-16 items-center border-b px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold">Status Page</span>
          </Link>
        </div>
        <nav className="space-y-1 p-4">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
            >
              <Home className="h-4 w-4" />
              Overview
            </Button>
          </Link>
          <Link href="/dashboard/services">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              Services
            </Button>
          </Link>
          <Link href="/dashboard/incidents">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
            >
              <AlertCircle className="h-4 w-4" />
              Incidents
            </Button>
          </Link>
          <Link href="/dashboard/team">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
            >
              <Users className="h-4 w-4" />
              Team
            </Button>
          </Link>
          <Link href="/dashboard/settings">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
        </nav>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  );
} 