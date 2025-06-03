
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp, Edit, Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";

const API_BASE_URL = "http://localhost:5001/tenant/api";

// API Service
async function fetchInstitutionDetails(tenantId: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}/details`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch institution details");
  }
  return response.json();
}

async function fetchUsers(tenantId: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch users");
  }
  return response.json();
}

async function addDepartment(tenantId: string, data: any, token: string) {
  const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}/departments`, {
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

async function updateDepartment(tenantId: string, id: string, data: any, token: string) {
  const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}/departments/${id}`, {
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

async function deleteDepartment(tenantId: string, id: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}/departments/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete department");
  }
  return response.json();
}

async function addRole(tenantId: string, data: any, token: string) {
  const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}/roles`, {
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

async function updateRole(tenantId: string, id: string, data: any, token: string) {
  const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}/roles/${id}`, {
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

async function deleteRole(tenantId: string, id: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}/roles/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete role");
  }
  return response.json();
}

async function addUser(tenantId: string, data: any, token: string) {
  const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}/users`, {
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

async function updateUser(tenantId: string, id: string, data: any, token: string) {
  const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}/users/${id}`, {
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

async function deleteUser(tenantId: string, id: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/tenants/${tenantId}/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete user");
  }
  return response.json();
}

// Institution Info Component
interface InstitutionInfoProps {
  institution: any;
}
function InstitutionInfo({ institution }: InstitutionInfoProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="bg-white/80 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-800">Institution Overview</CardTitle>
          <Button variant="outline" size="sm" className="hover:bg-gray-100" disabled>
            <Edit className="h-4 w-4 mr-2" /> Edit (Coming Soon)
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-6">
          {institution.logoUrl ? (
            <img src={institution.logoUrl} alt={institution.name} className="w-24 h-24 rounded-lg object-contain border border-gray-200 shadow-sm" />
          ) : (
            <div className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500">No Logo</div>
          )}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">{institution.name}</h2>
            <p className="text-gray-600"><span className="font-medium">Domain:</span> {institution.domain}</p>
            <p className="text-gray-600"><span className="font-medium">Email:</span> {institution.email}</p>
            <p className="text-gray-600"><span className="font-medium">Address:</span> {institution.address}, {institution.city}, {institution.country}</p>
            <p className="text-gray-600"><span className="font-medium">Phone:</span> {institution.phone}</p>
            <p className="text-gray-600"><span className="font-medium">Status:</span> 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${institution.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {institution.status}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Department Form Modal
interface DepartmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  department?: any;
}
function DepartmentFormModal({ isOpen, onClose, onSubmit, department }: DepartmentFormModalProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: department || {
      name: "",
      code: "",
      head: { email: "", firstName: "", lastName: "", password: "" },
    },
  });

  useEffect(() => {
    reset(department || {
      name: "",
      code: "",
      head: { email: "", firstName: "", lastName: "", password: "" },
    });
  }, [department, reset]);

  const onFormSubmit = async (data: any) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{department ? "Edit Department" : "Add Department"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...register("name", { required: "Name is required" })} placeholder="e.g., Computer Science" />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input id="code" {...register("code", { required: "Code is required" })} placeholder="e.g., CS101" />
              {errors.code && <p className="text-red-500 text-sm">{errors.code.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="head.email">Head Email *</Label>
              <Input id="head.email" type="email" {...register("head.email", { required: "Email is required" })} placeholder="e.g., head@example.com" />
              {errors.head?.email && <p className="text-red-500 text-sm">{errors.head.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="head.firstName">Head First Name *</Label>
              <Input id="head.firstName" {...register("head.firstName", { required: "First Name is required" })} placeholder="e.g., John" />
              {errors.head?.firstName && <p className="text-red-500 text-sm">{errors.head.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="head.lastName">Head Last Name *</Label>
              <Input id="head.lastName" {...register("head.lastName", { required: "Last Name is required" })} placeholder="e.g., Doe" />
              {errors.head?.lastName && <p className="text-red-500 text-sm">{errors.head.lastName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="head.password">Head Password {department ? "(Leave blank to keep unchanged)" : "*"}</Label>
              <Input id="head.password" type="password" {...register("head.password", { required: department ? false : "Password is required" })} placeholder="Enter a secure password" />
              {errors.head?.password && <p className="text-red-500 text-sm">{errors.head.password.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">{department ? "Update" : "Add"} Department</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Departments Table Component
interface DepartmentsTableProps {
  departments: any[];
  isOpen: boolean;
  toggleOpen: () => void;
  onAddDepartment: () => void;
  onEditDepartment: (dept: any) => void;
  onDeleteDepartment: (id: string) => void;
}
function DepartmentsTable({ departments, isOpen, toggleOpen, onAddDepartment, onEditDepartment, onDeleteDepartment }: DepartmentsTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });

  const sortedDepartments = [...departments].sort((a, b) => {
    const aValue = a[sortConfig.key] || '';
    const bValue = b[sortConfig.key] || '';
    return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
  });

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
      <Card className="bg-white/80 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-800">Departments</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="default" size="sm" className="bg-cyan-600 hover:bg-cyan-700" onClick={onAddDepartment}>
              <Plus className="h-4 w-4 mr-2" /> Add Department
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleOpen}>
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </div>
        </CardHeader>
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-100 transition-colors">
                      <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                        Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort('code')}>
                        Code {sortConfig.key === 'code' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                      </TableHead>
                      <TableHead>Head</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedDepartments.length > 0 ? (
                      sortedDepartments.map((dept) => (
                        <TableRow key={dept.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell>{dept.name}</TableCell>
                          <TableCell>{dept.code}</TableCell>
                          <TableCell>{dept.head ? `${dept.head.firstName} ${dept.head.lastName}` : "N/A"}</TableCell>
                          <TableCell>{dept.head?.email || "N/A"}</TableCell>
                          <TableCell className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => onEditDepartment(dept)}>
                              <Edit className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onDeleteDepartment(dept.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-6">No departments found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

// Role Form Modal
interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  role?: any;
}
function RoleFormModal({ isOpen, onClose, onSubmit, role }: RoleFormModalProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: role || { name: "", description: "" },
  });

  useEffect(() => {
    reset(role || { name: "", description: "" });
  }, [role, reset]);

  const onFormSubmit = async (data: any) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{role ? "Edit Role" : "Add Role"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register("name", { required: "Name is required" })} placeholder="e.g., Staff" />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" {...register("description")} placeholder="e.g., Staff role for the institution" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">{role ? "Update" : "Add"} Role</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Roles Table Component
interface RolesTableProps {
  roles: any[];
  isOpen: boolean;
  toggleOpen: () => void;
  onAddRole: () => void;
  onEditRole: (role: any) => void;
  onDeleteRole: (id: string) => void;
}
function RolesTable({ roles, isOpen, toggleOpen, onAddRole, onEditRole, onDeleteRole }: RolesTableProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
      <Card className="bg-white/80 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-800">Roles</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="default" size="sm" className="bg-cyan-600 hover:bg-cyan-700" onClick={onAddRole}>
              <Plus className="h-4 w-4 mr-2" /> Add Role
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleOpen}>
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </div>
        </CardHeader>
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-100 transition-colors">
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.length > 0 ? (
                      roles.map((role) => (
                        <TableRow key={role.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell>{role.name}</TableCell>
                          <TableCell className="max-w-xs truncate">{role.description}</TableCell>
                          <TableCell className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => onEditRole(role)} disabled={role.name === 'ADMIN'}>
                              <Edit className={`h-4 w-4 ${role.name === 'ADMIN' ? 'text-gray-400' : 'text-blue-500'}`} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onDeleteRole(role.id)} disabled={role.name === 'ADMIN'}>
                              <Trash2 className={`h-4 w-4 ${role.name === 'ADMIN' ? 'text-gray-400' : 'text-red-500'}`} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-gray-500 py-6">No roles found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

// User Form Modal
interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  user?: any;
  roles: any[];
  departments: any[];
}
function UserFormModal({ isOpen, onClose, onSubmit, user, roles, departments }: UserFormModalProps) {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    defaultValues: user || {
      email: "",
      firstName: "",
      lastName: "",
      password: "",
      roleIds: "",
      departmentId: "none",
    },
  });

  useEffect(() => {
    reset({
      email: user?.email || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      password: "",
      roleIds: user?.roleIds?.[0] || "",
      departmentId: user?.departmentId || "none",
    });
  }, [user, reset]);

  const onFormSubmit = async (data: any) => {
    try {
      const payload = {
        ...data,
        roleIds: [data.roleIds], // Ensure roleIds is an array
        departmentId: data.departmentId === "none" ? null : data.departmentId, // Convert "none" to null
        password: data.password || undefined, // Omit password if empty during edit
      };
      await onSubmit(payload);
      reset();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Add User"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email", { required: "Email is required" })}
                placeholder="e.g., user@example.com"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                {...register("firstName", { required: "First Name is required" })}
                placeholder="e.g., John"
              />
              {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                {...register("lastName", { required: "Last Name is required" })}
                placeholder="e.g., Doe"
              />
              {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password {user ? "(Leave blank to keep unchanged)" : "*"}</Label>
              <Input
                id="password"
                type="password"
                {...register("password", { required: user ? false : "Password is required" })}
                placeholder="Enter a secure password"
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleIds">Role *</Label>
              <Select
                onValueChange={(value) => setValue("roleIds", value, { shouldValidate: true })}
                defaultValue={user?.roleIds?.[0] || ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roleIds && <p className="text-red-500 text-sm">Role is required</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="departmentId">Department</Label>
              <Select
                onValueChange={(value) => setValue("departmentId", value)}
                defaultValue={user?.departmentId || "none"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a department (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
              {user ? "Update" : "Add"} User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
// Users Table Component
interface UsersTableProps {
  users: any[];
  isOpen: boolean;
  toggleOpen: () => void;
  onAddUser: () => void;
  onEditUser: (user: any) => void;
  onDeleteUser: (id: string) => void;
  roles: any[];
  departments: any[];
}
function UsersTable({ users, isOpen, toggleOpen, onAddUser, onEditUser, onDeleteUser, roles, departments }: UsersTableProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
      <Card className="bg-white/80 backdrop-blur-sm border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-800">Users</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="default" size="sm" className="bg-cyan-600 hover:bg-cyan-700" onClick={onAddUser}>
              <Plus className="h-4 w-4 mr-2" /> Add User
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleOpen}>
              {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </div>
        </CardHeader>
        <AnimatePresence>
          {isOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-100 transition-colors">
                      <TableHead>Email</TableHead>
                      <TableHead>First Name</TableHead>
                      <TableHead>Last Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length > 0 ? (
                      users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.firstName}</TableCell>
                          <TableCell>{user.lastName}</TableCell>
                          <TableCell>{roles.find((role) => role.id === user.roleIds?.[0])?.name || "N/A"}</TableCell>
                          <TableCell>{departments.find((dept) => dept.id === user.departmentId)?.name || "None"}</TableCell>
                          <TableCell className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => onEditUser(user)}>
                              <Edit className="h-4 w-4 text-blue-500" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => onDeleteUser(user.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-6">No users found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

// Delete Confirmation Modal
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: string;
}
function DeleteConfirmationModal({ isOpen, onClose, onConfirm, type }: DeleteConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to delete this {type}? This action cannot be undone.</p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Loading Skeleton Component
function LoadingSkeleton() {
  return (
    <div className="p-8 space-y-6">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

export default function ManageInstitutionPage() {
  const { user, token } = useAuth();
  const [institution, setInstitution] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [departmentsOpen, setDepartmentsOpen] = useState(true);
  const [rolesOpen, setRolesOpen] = useState(true);
  const [usersOpen, setUsersOpen] = useState(true);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState<{ id: string; type: string; action: () => void } | null>(null);
  const [editingDepartment, setEditingDepartment] = useState<any>(null);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [editingUser, setEditingUser] = useState<any>(null);

  const fetchData = async () => {
    try {
      const [institutionData, usersData] = await Promise.all([
        fetchInstitutionDetails(user.tenantId, token),
        fetchUsers(user.tenantId, token),
      ]);
      setInstitution(institutionData);
      setUsers(usersData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.tenantId && token) {
      fetchData();
    } else {
      setError("Authentication details missing");
      setLoading(false);
    }
  }, [user, token]);

  const handleAddDepartment = async (data: any) => {
    try {
      await addDepartment(user.tenantId, data, token);
      toast.success("Department added successfully!");
      await fetchData();
    } catch (error: any) {
      throw error;
    }
  };

  const handleEditDepartment = async (data: any) => {
    try {
      await updateDepartment(user.tenantId, editingDepartment.id, data, token);
      toast.success("Department updated successfully!");
      await fetchData();
      setEditingDepartment(null);
    } catch (error: any) {
      throw error;
    }
  };

  const handleDeleteDepartment = (id: string) => {
    setDeleteInfo({
      id,
      type: "department",
      action: async () => {
        try {
          await deleteDepartment(user.tenantId, id, token);
          toast.success("Department deleted successfully!");
          await fetchData();
          setShowDeleteModal(false);
        } catch (error: any) {
          toast.error(error.message);
        }
      },
    });
    setShowDeleteModal(true);
  };

  const handleAddRole = async (data: any) => {
    try {
      await addRole(user.tenantId, data, token);
      toast.success("Role added successfully!");
      await fetchData();
    } catch (error: any) {
      throw error;
    }
  };

  const handleEditRole = async (data: any) => {
    try {
      await updateRole(user.tenantId, editingRole.id, data, token);
      toast.success("Role updated successfully!");
      await fetchData();
      setEditingRole(null);
    } catch (error: any) {
      throw error;
    }
  };

  const handleDeleteRole = (id: string) => {
    setDeleteInfo({
      id,
      type: "role",
      action: async () => {
        try {
          await deleteRole(user.tenantId, id, token);
          toast.success("Role deleted successfully!");
          await fetchData();
          setShowDeleteModal(false);
        } catch (error: any) {
          toast.error(error.message);
        }
      },
    });
    setShowDeleteModal(true);
  };

  const handleAddUser = async (data: any) => {
    try {
      await addUser(user.tenantId, data, token);
      toast.success("User added successfully!");
      await fetchData();
    } catch (error: any) {
      throw error;
    }
  };

  const handleEditUser = async (data: any) => {
    try {
      await updateUser(user.tenantId, editingUser.id, data, token);
      toast.success("User updated successfully!");
      await fetchData();
      setEditingUser(null);
    } catch (error: any) {
      throw error;
    }
  };

  const handleDeleteUser = (id: string) => {
    setDeleteInfo({
      id,
      type: "user",
      action: async () => {
        try {
          await deleteUser(user.tenantId, id, token);
          toast.success("User deleted successfully!");
          await fetchData();
          setShowDeleteModal(false);
        } catch (error: any) {
          toast.error(error.message);
        }
      },
    });
    setShowDeleteModal(true);
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return (
    <div className="p-8">
      <Card className="bg-red-100 border-red-600">
        <CardContent className="pt-6">
          <p className="text-red-600">Error: {error}</p>
        </CardContent>
        </Card>
      </div>
    
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="text-3xl md:text-4xl font-bold text-gray-900">
          Manage Institution
        </motion.h1>
        <InstitutionInfo institution={institution} />
        <DepartmentsTable
          departments={institution.departments || []}
          isOpen={departmentsOpen}
          toggleOpen={() => setDepartmentsOpen(!departmentsOpen)}
          onAddDepartment={() => { setEditingDepartment(null); setShowDepartmentModal(true); }}
          onEditDepartment={(dept) => { setEditingDepartment(dept); setShowDepartmentModal(true); }}
          onDeleteDepartment={handleDeleteDepartment}
        />
        <RolesTable
          roles={institution.roles || []}
          isOpen={rolesOpen}
          toggleOpen={() => setRolesOpen(!rolesOpen)}
          onAddRole={() => { setEditingRole(null); setShowRoleModal(true); }}
          onEditRole={(role) => { setEditingRole(role); setShowRoleModal(true); }}
          onDeleteRole={handleDeleteRole}
        />
        <UsersTable
          users={users || []}
          isOpen={usersOpen}
          toggleOpen={() => setUsersOpen(!usersOpen)}
          onAddUser={() => { setEditingUser(null); setShowUserModal(true); }}
          onEditUser={(user) => { setEditingUser(user); setShowUserModal(true); }}
          onDeleteUser={handleDeleteUser}
          roles={institution.roles || []}
          departments={institution.departments || []}
        />
        <DepartmentFormModal
          isOpen={showDepartmentModal}
          onClose={() => setShowDepartmentModal(false)}
          onSubmit={editingDepartment ? handleEditDepartment : handleAddDepartment}
          department={editingDepartment}
        />
        <RoleFormModal
          isOpen={showRoleModal}
          onClose={() => setShowRoleModal(false)}
          onSubmit={editingRole ? handleEditRole : handleAddRole}
          role={editingRole}
        />
        <UserFormModal
          isOpen={showUserModal}
          onClose={() => setShowUserModal(false)}
          onSubmit={editingUser ? handleEditUser : handleAddUser}
          user={editingUser}
          roles={institution.roles || []}
          departments={institution.departments || []}
        />
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => deleteInfo?.action()}
          type={deleteInfo?.type || ''}
        />
      </div>
    </div>
  );
}
