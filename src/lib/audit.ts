export async function logAction(companyId: string, userId: string, action: string, details: string) {
  const timestamp = new Date().toLocaleString();
  
  // For our MVP, we are logging these directly to the secure server console.
  // In a future Version 2, you could create an AuditLog table in Prisma 
  // and replace these console.logs with: await db.auditLog.create(...)
  console.log(`\n================ AUDIT LOG ================`);
  console.log(`Time:    ${timestamp}`);
  console.log(`Company: ${companyId}`);
  console.log(`User ID: ${userId}`);
  console.log(`Action:  ${action}`);
  console.log(`Details: ${details}`);
  console.log(`===========================================\n`);
}