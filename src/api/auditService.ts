// src/api/auditService.ts
export async function fetchAuditPrograms(token: string, role: string) {
  try {
    const response = await fetch(`http://localhost:5004/api/audit-programs`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      let errorMsg = "Failed to fetch audit programs";
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorMsg;
      } catch {
        // ignore JSON parse error
      }
      throw new Error(errorMsg);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    // Optionally log error here
    return []; // Return empty array to avoid breaking the UI
  }
}
export async function getAuditProgramById(id: string, token: string) {
  const response = await fetch(`http://localhost:5004/api/audit-programs/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch audit program");
  }
  return response.json();
}
export async function updateAuditProgram(id: string, updatedProgram: any, token: string) {
  const response = await fetch(`http://localhost:5004/api/audit-programs/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: updatedProgram.name,
      auditProgramObjective: updatedProgram.auditProgramObjective,
      startDate: updatedProgram.startDate,
      endDate: updatedProgram.endDate,
    }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update audit program");
  }
  return response.json();
}

export async function submitForApprovalAuditProgram(id: string, token: string) {
  const response = await fetch(`http://localhost:5004/api/audit-programs/${id}/submit`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to submit audit program");
  }
  return response.json();
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

export async function archiveAuditProgram(id: string, token: string) {
  const response = await fetch(`http://localhost:5004/api/audit-programs/${id}/archive`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to archive audit program");
  }
  return response.json();
}

export async function createAuditProgram(newProgram: any, token: string) {
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
      tenantId: newProgram.tenantId,
      tenantName: newProgram.tenantName,
      createdBy: newProgram.createdBy,
    }),
  });
  if (!programRes.ok) throw new Error("Failed to create audit program");
  return await programRes.json();
}

export async function createAuditProgramWithAudits(newProgram: any, token: string) {
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