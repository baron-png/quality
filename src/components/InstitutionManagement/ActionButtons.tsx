import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  disableEdit?: boolean;
  disableDelete?: boolean;
}

export function ActionButtons({
  onEdit,
  onDelete,
  disableEdit = false,
  disableDelete = false,
}: ActionButtonsProps) {
  return (
    <div className="flex space-x-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onEdit}
        disabled={disableEdit}
        className={`p-2 rounded-full ${
          disableEdit
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-blue-500 hover:bg-blue-100 hover:text-blue-600'
        } transition-colors duration-200`}
        aria-label="Edit item"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        disabled={disableDelete}
        className={`p-2 rounded-full ${
          disableDelete
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-red-500 hover:bg-red-100 hover:text-red-600'
        } transition-colors duration-200`}
        aria-label={`Delete item${disableDelete ? ' (disabled)' : ''}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}