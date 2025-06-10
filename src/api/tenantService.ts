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

export async function fetchInstitutionDetails(tenantId: string, token: string) {
  const response = await fetch(`http://localhost:5001/tenant/api/${tenantId}/details`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch institution details");
  }
  return response.json();
}

export async function fetchUsers(tenantId: string, token: string) {
  const response = await fetch(`http://localhost:5001/tenant/api/${tenantId}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch users");
  }
  return response.json();
}

export async function addDepartment(tenantId: string, data: any, token: string) {
  const response = await fetch(`http://localhost:5001/tenant/api/${tenantId}/departments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to add department");
  }
  return response.json();
}

export async function updateDepartment(tenantId: string, id: string, data: any, token: string) {
  const response = await fetch(`http://localhost:5001/tenant/api/tenants/${tenantId}/departments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update department");
  }
  return response.json();
}

export async function deleteDepartment(tenantId: string, id: string, token: string) {
  const response = await fetch(`http://localhost:5001/tenant/api/tenants/${tenantId}/departments/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete department");
  }
  return response.json();
}

export async function addRole(tenantId: string, data: any, token: string) {
  const response = await fetch(`http://localhost:5001/tenant/api/${tenantId}/roles`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to add role");
  }
  return response.json();
}

export async function updateRole(tenantId: string, id: string, data: any, token: string) {
  const response = await fetch(`http://localhost:5001/tenant/api/tenants/${tenantId}/roles/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update role");
  }
  return response.json();
}

export async function deleteRole(tenantId: string, id: string, token: string) {
  const response = await fetch(`http://localhost:5001/tenant/api/tenants/${tenantId}/roles/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete role");
  }
  return response.json();
}

export async function addUser(tenantId: string, data: any, token: string) {
  const response = await fetch(`http://localhost:5001/tenant/api/${tenantId}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to add user");
  }
  return response.json();
}

export async function updateUser(tenantId: string, id: string, data: any, token: string) {
  const response = await fetch(`http://localhost:5001/tenant/api/tenants/${tenantId}/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update user");
  }
  return response.json();
}

export async function deleteUser(tenantId: string, id: string, token: string) {
  const response = await fetch(`http://localhost:5001/tenant/api/tenants/${tenantId}/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete user");
  }
  return response.json();
}