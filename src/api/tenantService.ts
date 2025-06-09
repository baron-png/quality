export async function createInstitution(data: any, token: string) {
  const res = await fetch("http://localhost:5001/tenant/api/tenants", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create institution");
  }
  return res.json();
}

export async function getInstitutions(token: string) {
  const res = await fetch("http://localhost:5001/tenant/api/superadmin/tenant", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to fetch institutions");
  }
  return res.json();
}

export async function getInstitutionById(tenantId: string, token: string) {
  const res = await fetch(
    `http://localhost:5001/tenant/api/tenants/${tenantId}/details`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to fetch institution details");
  }
  return res.json();
}