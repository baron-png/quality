import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export function LoadingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 md:p-8"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-10 w-1/3 bg-gray-200" />
        <div className="space-y-4">
          <Skeleton className="h-40 w-full bg-gray-200" />
          <Skeleton className="h-64 w-full bg-gray-200" />
          <Skeleton className="h-64 w-full bg-gray-200" />
          <Skeleton className="h-64 w-full bg-gray-200" />
        </div>
      </div>
    </motion.div>
  );
}