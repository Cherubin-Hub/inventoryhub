import { db } from "@/lib/db";
import { requireCompany } from "@/lib/permissions";
import { AddMemberForm } from "@/modules/team/components/add-member-form";

export default async function TeamPage() {
  // 1. Get the current user's company and role securely
  const { companyId, role } = await requireCompany();

  // 2. Fetch ONLY the users that belong to this specific company
  const team = await db.user.findMany({
    where: { companyId },
    orderBy: { createdAt: "asc" }
  });

  const canAddMembers = role === "OWNER" || role === "MANAGER";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Team Members</h1>
        <p className="text-muted-foreground">Manage your company staff and permissions.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left side: The Table */}
        <div className="md:col-span-2">
          <div className="rounded-md border bg-white overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Role</th>
                </tr>
              </thead>
              <tbody>
                {team.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="p-4">{user.name}</td>
                    <td className="p-4">{user.email}</td>
                    <td className="p-4 font-medium">{user.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right side: The Form */}
        <div>
          {canAddMembers ? (
            <AddMemberForm />
          ) : (
            <div className="rounded-md bg-muted p-4 text-sm text-center">
              Only Owners and Managers can add new staff.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
