interface User {
  id: string;
  label: string;
}

export async function fetchUsers(token: string): Promise<User[]> {
  try {
    const response = await fetch('http://localhost:5004/api/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch users');
    }

    const data = await response.json();
    return data.map((user: any) => ({
      id: user.id,
      label: `${user.firstName} ${user.lastName}`,
    }));
  } catch (error: any) {
    console.error('Error fetching users:', error);
    throw new Error(error.message || 'Failed to fetch users');
  }
} 