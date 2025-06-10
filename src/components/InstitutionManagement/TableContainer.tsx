import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GenericTable } from './GenericTable';

interface TableContainerProps<T> {
  title: string;
  data: T[];
  columns: { key: string; label: string; sortable?: boolean; render?: (item: T) => React.ReactNode }[];
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
  defaultOpen?: boolean;
  extraProps?: Record<string, any>;
}

export function TableContainer<T>({
  title,
  data,
  columns,
  onAdd,
  onEdit,
  onDelete,
  defaultOpen = true,
  extraProps = {},
}: TableContainerProps<T>) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      role="region"
      aria-labelledby={`${title.toLowerCase().replace(' ', '-')}-table`}
    >
      <Card className="bg-white/80 backdrop-blur-md border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle
            id={`${title.toLowerCase().replace(' ', '-')}-table`}
            className="text-xl font-semibold text-gray-800"
          >
            {title}
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="default"
              size="sm"
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold"
              onClick={onAdd}
              aria-label={`Add new ${title.slice(0, -1).toLowerCase()}`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {title.slice(0, -1)}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? `Collapse ${title} table` : `Expand ${title} table`}
            >
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-gray-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-600" />
              )}
            </Button>
          </div>
        </CardHeader>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <CardContent>
                <GenericTable
                  data={data}
                  columns={columns}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  extraProps={extraProps}
                />
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}