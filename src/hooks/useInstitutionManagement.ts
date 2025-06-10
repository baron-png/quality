import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Institution, Department, Role, User } from '@/types/institution';
import {
  fetchInstitutionDetails,
  fetchUsers,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  addRole,
  updateRole,
  deleteRole,
  addUser,
  updateUser,
  deleteUser,
} from '@/api/tenantService'; 

interface UseInstitutionManagementProps {
  tenantId?: string;
  token?: string;
}

export function useInstitutionManagement({ tenantId, token }: UseInstitutionManagementProps) {
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!tenantId || !token) {
        setError('Missing tenant ID or token');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
       const [instData, userData] = await Promise.all([
  fetchInstitutionDetails(tenantId, token),
  fetchUsers(tenantId, token),
]);
        setInstitution(instData.details);
        setUsers(userData.users ?? []);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        toast.error(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [tenantId, token]);

  const handleAddDepartment = async (data: any) => {
    if (!tenantId || !token) throw new Error('Missing tenant ID or token');
    try {
      const newDept = await addDepartment(tenantId, data, token);
      setInstitution((prev) => prev ? {
        ...prev,
        departments: [...prev.departments, newDept],
      } : null);
      toast.success('Department added successfully');
    } catch (err: any) {
      throw new Error(err.message || 'Failed to add department');
    }
  };

  const handleEditDepartment = async (id: string, data: any) => {
    if (!tenantId || !token) throw new Error('Missing tenant ID or token');
    try {
      const updatedDept = await updateDepartment(tenantId, id, data, token);
      setInstitution((prev) => prev ? {
        ...prev,
        departments: prev.departments.map((dept) =>
          dept.id === id ? updatedDept : dept
        ),
      } : null);
      toast.success('Department updated successfully');
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update department');
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!tenantId || !token) throw new Error('Missing tenant ID or token');
    try {
      await deleteDepartment(tenantId, id, token);
      setInstitution((prev) => prev ? {
        ...prev,
        departments: prev.departments.filter((dept) => dept.id !== id),
      } : null);
      toast.success('Department deleted successfully');
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete department');
    }
  };

  const handleAddRole = async (data: any) => {
    if (!tenantId || !token) throw new Error('Missing tenant ID or token');
    try {
      const newRole = await addRole(tenantId, data, token);
      setInstitution((prev) => prev ? {
        ...prev,
        roles: [...prev.roles, newRole],
      } : null);
      toast.success('Role added successfully');
    } catch (err: any) {
      throw new Error(err.message || 'Failed to add role');
    }
  };

  const handleEditRole = async (id: string, data: any) => {
    if (!tenantId || !token) throw new Error('Missing tenant ID or token');
    try {
      const updatedRole = await updateRole(tenantId, id, data, token);
      setInstitution((prev) => prev ? {
        ...prev,
        roles: prev.roles.map((role) => (role.id === id ? updatedRole : role)),
      } : null);
      toast.success('Role updated successfully');
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update role');
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!tenantId || !token) throw new Error('Missing tenant ID or token');
    try {
      await deleteRole(tenantId, id, token);
      setInstitution((prev) => prev ? {
        ...prev,
        roles: prev.roles.filter((role) => role.id !== id),
      } : null);
      toast.success('Role deleted successfully');
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete role');
    }
  };

  const handleAddUser = async (data: any) => {
    if (!tenantId || !token) throw new Error('Missing tenant ID or token');
    try {
      const newUser = await addUser(tenantId, data, token);
      setUsers((prev) => [...prev, newUser]);
      toast.success('User added successfully');
    } catch (err: any) {
      throw new Error(err.message || 'Failed to add user');
    }
  };

  const handleEditUser = async (id: string, data: any) => {
    if (!tenantId || !token) throw new Error('Missing tenant ID or token');
    try {
      const updatedUser = await updateUser(tenantId, id, data, token);
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? updatedUser : user))
      );
      toast.success('User updated successfully');
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!tenantId || !token) throw new Error('Missing tenant ID or token');
    try {
      await deleteUser(tenantId, id, token);
      setUsers((prev) => prev.filter((user) => user.id !== id));
      toast.success('User deleted successfully');
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete user');
    }
  };

  return {
    institution,
    users,
    loading,
    error,
    handleAddDepartment,
    handleEditDepartment,
    handleDeleteDepartment,
    handleAddRole,
    handleEditRole,
    handleDeleteRole,
    handleAddUser,
    handleEditUser,
    handleDeleteUser,
  };
}