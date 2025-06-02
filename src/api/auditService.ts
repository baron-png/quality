export async function fetchAdminAuditPrograms(token: string) {
  const response = await fetch("http://localhost:5004/api/audit-programs", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch audit programs");
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function approveAuditProgram(id: string, token: string) {
  const response = await fetch(`http://localhost:5004/api/audit-programs/${id}/approve`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to approve audit program");
  }
  return response.json();
}

export async function rejectAuditProgram(id: string, token: string) {
  const response = await fetch(`http://localhost:5004/api/audit-programs/${id}/reject`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to reject audit program");
  }
  return response.json();
}

export async function createAuditProgramWithAudits(newProgram: any, token: string) {
  // 1. Create the program
  const programRes = await fetch("http://localhost:5004/api/audit-programs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: newProgram.name,
      auditProgramObjective: newProgram.auditProgramObjective,
      status: "Draft",
      startDate: newProgram.startDate,
      endDate: newProgram.endDate,
    }),
  });
  if (!programRes.ok) throw new Error("Failed to create audit program");
  const createdProgram = await programRes.json();

  // 2. Create audits
  for (const audit of newProgram.audits) {
    const auditData = {
      scope: audit.scope,
      specificAuditObjective: audit.specificAuditObjectives,
      methods: audit.methods,
      criteria: audit.criteria,
    };
    const auditRes = await fetch(
      `http://localhost:5004/api/audit-programs/${createdProgram.id}/audits`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(auditData),
      }
    );
    if (!auditRes.ok) throw new Error("Failed to create audit");
  }
  return true;
}