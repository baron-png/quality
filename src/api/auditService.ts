export async function fetchAuditPrograms(token: string) {
  try {
    const response = await fetch("http://localhost:5004/api/audit-programs", {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      let errorMsg = "Failed to fetch audit programs";
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorMsg;
      } catch {}
      throw new Error(errorMsg);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    return [];
  }
}
export async function createAuditForProgram(
  programId: string,
  audit: {
    scope: string[];
    specificAuditObjectives: string[];
    methods: string[];
    criteria: string[];
    auditNumber: string;
  },
  token: string // <-- Add token parameter
) {
  console.log("[createAuditForProgram] Token:", token); // Log the token being used
  const response = await fetch(`http://localhost:5004/api/audits/${programId}/audits`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // <-- Send token here
    },
    credentials: 'include',
    body: JSON.stringify(audit),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create audit");
  }
  return response.json();
}

export async function getAuditProgramById(id: string, token: string) {
  const response = await fetch(`http://localhost:5004/api/audit-programs/${id}`, {
    credentials: 'include',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch audit program");
  }
  return response.json();
}

export async function saveAuditDates(
  auditId: string,
  dates: {
    auditDates?: { startDate: string | null; endDate: string | null };
    teamLeaderAppointment?: { appointmentDate: string };
    teamMemberAppointments?: { appointmentDate: string }[];
    followUpDates?: { startDate: string | null; endDate: string | null };
    managementReviewDates?: { startDate: string | null; endDate: string | null };
  }
) {
  const response = await fetch(`http://localhost:5004/api/audits/${auditId}/dates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify(dates),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to save audit dates");
  }
  return response.json();
}

export async function saveTeamAppointments(
  auditId: string,
  appointments: {
    teamLeader?: { appointmentDate: string; teamLeaderId: string };
    teamMembers?: { appointmentDate: string; teamMemberIds: string[] };
  }
) {
  const response = await fetch(`http://localhost:5004/api/audits/${auditId}/team-appointments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify(appointments),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to save team appointments");
  }
  return response.json();
}

export async function submitAuditProgram(programId: string) {
  const response = await fetch(`http://localhost:5004/api/audit-programs/${programId}/submit`, {
    method: "PUT",
    credentials: 'include',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to submit audit program");
  }
  return response.json();
}

export async function updateAuditProgram(id: string, updatedProgram: any) {
  const response = await fetch(`http://localhost:5004/api/audit-programs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
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

export async function submitForApprovalAuditProgram(id: string) {
  const response = await fetch(`http://localhost:5004/api/audit-programs/${id}/submit`, {
    method: "PUT",
    credentials: 'include',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to submit audit program");
  }
  return response.json();
}

export async function approveAuditProgram(id: string) {
  const response = await fetch(`http://localhost:5004/api/audit-programs/${id}/approve`, {
    method: "PUT",
    credentials: 'include',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to approve audit program");
  }
  return response.json();
}

export async function rejectAuditProgram(id: string) {
  const response = await fetch(`http://localhost:5004/api/audit-programs/${id}/reject`, {
    method: "PUT",
    credentials: 'include',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to reject audit program");
  }
  return response.json();
}

export async function archiveAuditProgram(id: string) {
  const response = await fetch(`http://localhost:5004/api/audit-programs/${id}/archive`, {
    method: "PUT",
    credentials: 'include',
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
    credentials: 'include',
    body: JSON.stringify({
      name: newProgram.name,
      auditProgramObjective: newProgram.auditProgramObjective,
      status: "Draft",
      startDate: newProgram.startDate,
      endDate: newProgram.endDate,
      tenantId: newProgram.tenantId,      // Must match JWT
      tenantName: newProgram.tenantName,  // Required
      // Do NOT send createdBy
    }),
  });
  if (!programRes.ok) throw new Error("Failed to create audit program");
  const createdProgram = await programRes.json();

  // Create placeholder audits for all auditHeaders
  const auditHeaders = [
    "1ST INTERNAL AUDIT",
    "1ST SURVEILLANCE AUDIT",
    "2ND INTERNAL AUDIT",
    "2ND SURVEILLANCE AUDIT",
    "3RD INTERNAL AUDIT",
    "RE-CERTIFICATION AUDIT",
  ];
  for (const auditNumber of auditHeaders) {
    await createAuditForProgram(
      createdProgram.id,
      {
        auditNumber,
        scope: [],
        specificAuditObjectives: [],
        methods: [],
        criteria: [],
        // Do NOT send createdBy here unless your backend expects it for audits
      },
      token
    );
  }

  return createdProgram;
}
export async function createAuditProgramWithAudits(newProgram: any) {
  const programRes = await fetch("http://localhost:5004/api/audit-programs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
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
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify(auditData),
      }
    );
    if (!auditRes.ok) throw new Error("Failed to create audit");
  }
  return true;
}

export async function getAuditByProgramAndNumber(programId: string, auditNumber: string) {
  const response = await fetch(`http://localhost:5004/api/audit-programs/${programId}`, {
    credentials: 'include',
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch audit");
  }
  const program = await response.json();
  const audit = program.audits.find((a: any) => a.auditNumber === auditNumber);
  return audit || null;
}

export async function updateAudit(auditId: string, data: any) {
  const response = await fetch(`http://localhost:5004/api/audits/${auditId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update audit");
  }
  return response.json();
}