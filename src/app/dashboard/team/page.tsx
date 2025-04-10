import { Button } from "@/components/ui/button";
import { Plus, UserPlus, UserMinus } from "lucide-react";

const members = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "ADMIN",
    joinedAt: "2024-03-01T10:00:00Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "MEMBER",
    joinedAt: "2024-03-05T14:30:00Z",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "MEMBER",
    joinedAt: "2024-03-10T09:15:00Z",
  },
];

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Team Members</h2>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      <div className="rounded-lg border">
        <div className="grid grid-cols-12 border-b bg-muted/50 p-4 text-sm font-medium">
          <div className="col-span-4">Name</div>
          <div className="col-span-4">Email</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Joined</div>
        </div>
        {members.map((member) => (
          <div
            key={member.id}
            className="grid grid-cols-12 border-b p-4 text-sm last:border-0"
          >
            <div className="col-span-4 font-medium">{member.name}</div>
            <div className="col-span-4 text-muted-foreground">
              {member.email}
            </div>
            <div className="col-span-2">
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  member.role === "ADMIN"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {member.role}
              </span>
            </div>
            <div className="col-span-2 text-muted-foreground">
              {new Date(member.joinedAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 