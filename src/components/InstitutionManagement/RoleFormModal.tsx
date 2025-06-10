import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Role } from '@/types/institution';

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  role?: Role;
}

export function RoleFormModal({ isOpen, onClose, onSubmit, role }: RoleFormModalProps) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: role || { name: '', description: '' },
  });

  useEffect(() => {
    reset(role || { name: '', description: '' });
  }, [role, reset]);

  const onFormSubmit = async (data: any) => {
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save role');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white/95 backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            {role ? 'Edit Role' : 'Add Role'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-700">Name *</Label>
            <Input
              id="name"
              {...register('name', { required: 'Name is required' })}
              placeholder="e.g., Instructor"
              className="border-gray-300 focus:ring-cyan-500"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-700">Description</Label>
            <Input
              id="description"
              {...register('description')}
              placeholder="e.g., Manages course delivery"
              className="border-gray-300 focus:ring-cyan-500"
            />
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
              {role ? 'Update' : 'Add'} Role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}