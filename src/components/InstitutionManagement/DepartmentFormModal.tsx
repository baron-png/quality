import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Department } from '@/types/institution';

interface DepartmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  department?: Department;
}

export function DepartmentFormModal({ isOpen, onClose, onSubmit, department }: DepartmentFormModalProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: department || {
      name: '',
      code: '',
      head: { email: '', firstName: '', lastName: '', password: '' },
    },
  });

  useEffect(() => {
    reset(department || {
      name: '',
      code: '',
      head: { email: '', firstName: '', lastName: '', password: '' },
    });
  }, [department, reset]);

  const onFormSubmit = async (data: any) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save department');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            {department ? 'Edit Department' : 'Add Department'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Name is required' })}
                placeholder="e.g., Computer Science"
                className="border-gray-300 focus:ring-cyan-500"
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="code" className="text-gray-700">Code *</Label>
              <Input
                id="code"
                {...register('code', { required: 'Code is required' })}
                placeholder="e.g., CS101"
                className="border-gray-300 focus:ring-cyan-500"
              />
              {errors.code && <p className="text-red-500 text-sm">{errors.code.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="head.email" className="text-gray-700">Head Email *</Label>
              <Input
                id="head.email"
                type="email"
                {...register('head.email', { required: 'Email is required' })}
                placeholder="e.g., head@example.com"
                className="border-gray-300 focus:ring-cyan-500"
              />
              {errors.head?.email && <p className="text-red-500 text-sm">{errors.head.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="head.firstName" className="text-gray-700">Head First Name *</Label>
              <Input
                id="head.firstName"
                {...register('head.firstName', { required: 'First Name is required' })}
                placeholder="e.g., John"
                className="border-gray-300 focus:ring-cyan-500"
              />
              {errors.head?.firstName && <p className="text-red-500 text-sm">{errors.head.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="head.lastName" className="text-gray-700">Head Last Name *</Label>
              <Input
                id="head.lastName"
                {...register('head.lastName', { required: 'Last Name is required' })}
                placeholder="e.g., Doe"
                className="border-gray-300 focus:ring-cyan-500"
              />
              {errors.head?.lastName && <p className="text-red-500 text-sm">{errors.head.lastName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="head.password" className="text-gray-700">
                Head Password {department ? '(Leave blank to keep unchanged)' : '*'}
              </Label>
              <Input
                id="head.password"
                type="password"
                {...register('head.password', { required: department ? false : 'Password is required' })}
                placeholder="Enter a secure password"
                className="border-gray-300 focus:ring-cyan-500"
              />
              {errors.head?.password && <p className="text-red-500 text-sm">{errors.head.password.message}</p>}
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
              {department ? 'Update' : 'Add'} Department
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}