import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Role, User, Department } from '@/types/institution';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  user?: User;
  roles: Role[];
  departments: Department[];
}

export function UserFormModal({ isOpen, onClose, onSubmit, user, roles, departments }: UserFormModalProps) {
  const { register, handleSubmit, formState: { errors }, setValue, reset, watch } = useForm({
    defaultValues: user || {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      roleIds: [],
      departmentId: 'none',
    },
  });

  useEffect(() => {
    reset(user || {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      roleIds: [],
      departmentId: 'none',
    });
    if (user?.roleIds) setValue('roleIds', user.roleIds);
    if (user?.departmentId) setValue('departmentId', user.departmentId);
  }, [user, reset, setValue]);

  const onFormSubmit = async (data: any) => {
    try {
      const transformedData = {
        ...data,
        departmentId: data.departmentId === 'none' ? '' : data.departmentId,
      };
      await onSubmit(transformedData);
      reset();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save user');
    }
  };

  const departmentId = watch('departmentId');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            {user ? 'Edit User' : 'Add User'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register('email', { required: 'Email is required' })}
                placeholder="e.g., user@example.com"
                className="border-gray-300 focus:ring-cyan-500"
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-gray-700">First Name *</Label>
              <Input
                id="firstName"
                {...register('firstName', { required: 'First Name is required' })}
                placeholder="e.g., John"
                className="border-gray-300 focus:ring-cyan-500"
              />
              {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-gray-700">Last Name *</Label>
              <Input
                id="lastName"
                {...register('lastName', { required: 'Last Name is required' })}
                placeholder="e.g., Doe"
                className="border-gray-300 focus:ring-cyan-500"
              />
              {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700">
                Password {user ? '(Leave blank to keep unchanged)' : '*'}
              </Label>
              <Input
                id="password"
                type="password"
                {...register('password', { required: user ? false : 'Password is required' })}
                placeholder="Enter a secure password"
                className="border-gray-300 focus:ring-cyan-500"
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleIds" className="text-gray-700">Role *</Label>
              <Select
                onValueChange={(value) => setValue('roleIds', [value], { shouldValidate: true })}
                value={watch('roleIds')?.[0] || undefined}
              >
                <SelectTrigger className="border-gray-300 focus:ring-cyan-500">
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
              <Label htmlFor="departmentId" className="text-gray-700">Department</Label>
              <input
                type="hidden"
                {...register('departmentId')}
              />
              <Select
                onValueChange={(value) => setValue('departmentId', value, { shouldValidate: true })}
                value={departmentId}
              >
                <SelectTrigger className="border-gray-300 focus:ring-cyan-500">
                  <SelectValue placeholder="Select a department" />
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
              {errors.departmentId && <p className="text-red-500 text-sm">Department selection is invalid</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-gray-300 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              {user ? 'Update' : 'Add'} User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}