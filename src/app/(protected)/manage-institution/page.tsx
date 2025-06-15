'use client';

import { motion } from 'framer-motion';
import { useAuth } from '@/context/auth-context';
import {
  InstitutionInfo,
  TableContainer,
  DepartmentFormModal,
  RoleFormModal,
  UserFormModal,
  DeleteConfirmationModal,
  LoadingSkeleton,
} from '@/components/InstitutionManagement';
import { useInstitutionManagement } from '@/hooks/useInstitutionManagement';
import { useModalState } from '@/hooks/useModalState';
import { Department, Role, User } from '@/types/institution';

export default function ManageInstitutionPage() {
  const { user, token } = useAuth();
  const {
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
  } = useInstitutionManagement({ tenantId: user?.tenantId, token });

  const departmentModal = useModalState<Department>();
  const roleModal = useModalState<Role>();
  const userModal = useModalState<User>();
  const deleteModal = useModalState<any>();

  if (loading) return <LoadingSkeleton />;
  if (error || !institution) return (
    <div className="p-8">
      <div className="bg-red-100 border-red-600 p-6 rounded-lg">
        <p className="text-red-600">Error: {error || 'Institution data missing'}</p>
      </div>
    </div>
  );

  console.log('Departments data:', institution.departments);
  console.log('Users data:', users);
  const departmentColumns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'code', label: 'Code', sortable: true },
    {
      key: 'head',
      label: 'Head',
      render: (dept: Department) => dept.head ? `${dept.head.firstName} ${dept.head.lastName}` : 'N/A',
    },
    {
      key: 'email',
      label: 'Email',
      render: (dept: Department) => dept.head?.email || 'N/A',
    },
  ];

  const roleColumns = [
    { key: 'name', label: 'Name' },
    {
      key: 'description',
      label: 'Description',
      render: (role: Role) => <span className="max-w-xs truncate whitespace-nowrap">{role.description || 'N/A'}</span>,
    },
  ];

  const userColumns = [
    { key: 'email', label: 'Email' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    {
      key: 'roleIds',
      label: 'Role',
      render: (user: User) => institution.roles.find((role) => role.id === user.roleIds?.[0])?.name || 'N/A',
    },
    {
      key: 'departmentId',
      label: 'Department',
      render: (user: User) => institution.departments.find((dept) => dept.id === user.departmentId)?.name || 'None',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="text-3xl md:text-4xl font-bold text-gray-900">
          Manage Institution
        </motion.h1>
        <InstitutionInfo institution={institution} />
        <TableContainer
          title="Departments"
          data={institution.departments}
          columns={departmentColumns}
          onAdd={() => departmentModal.openModal()}
          onEdit={departmentModal.openModal}
          onDelete={(id) => departmentModal.openDeleteModal(id, 'department', () => handleDeleteDepartment(id))}
          extraProps={{ entityName: 'departments' }}
        />
        <TableContainer
          title="Roles"
          data={institution.roles}
          columns={roleColumns}
          onAdd={() => roleModal.openModal()}
          onEdit={roleModal.openModal}
          onDelete={(id) => roleModal.openDeleteModal(id, 'role', () => handleDeleteRole(id))}
          extraProps={{
            entityName: 'roles',
            disableEdit: (role: Role) => role.name === 'ADMIN',
            disableDelete: (role: Role) => role.name === 'ADMIN',
          }}
        />
        <TableContainer
          title="Users"
          data={users}
          columns={userColumns}
          onAdd={() => userModal.openModal()}
          onEdit={userModal.openModal}
          onDelete={(id) => userModal.openDeleteModal(id, 'user', () => handleDeleteUser(id))}
          extraProps={{
            entityName: 'users',
            roles: institution.roles,
            departments: institution.departments,
          }}
        />
        <DepartmentFormModal
          isOpen={departmentModal.modalState.isOpen}
          onClose={departmentModal.closeModal}
          onSubmit={departmentModal.modalState.editingItem ? (data) => handleEditDepartment(departmentModal.modalState.editingItem!.id, data) : handleAddDepartment}
          department={departmentModal.modalState.editingItem}
        />
        <RoleFormModal
          isOpen={roleModal.modalState.isOpen}
          onClose={roleModal.closeModal}
          onSubmit={roleModal.modalState.editingItem ? (data) => handleEditRole(roleModal.modalState.editingItem!.id, data) : handleAddRole}
          role={roleModal.modalState.editingItem}
        />
        <UserFormModal
          isOpen={userModal.modalState.isOpen}
          onClose={userModal.closeModal}
          onSubmit={userModal.modalState.editingItem ? (data) => handleEditUser(userModal.modalState.editingItem!.id, data) : handleAddUser}
          user={userModal.modalState.editingItem}
          roles={institution.roles}
          departments={institution.departments}
        />
        <DeleteConfirmationModal
          isOpen={!!deleteModal.modalState.deleteInfo}
          onClose={deleteModal.closeDeleteModal}
          onConfirm={deleteModal.modalState.deleteInfo?.action || (() => {})}
          type={deleteModal.modalState.deleteInfo?.type || ''}
        />
      </div>
    </div>
  );
}