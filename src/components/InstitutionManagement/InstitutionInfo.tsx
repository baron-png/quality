import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit } from 'lucide-react';
import { Institution } from '@/types/institution';

interface InstitutionInfoProps {
  institution: Institution;
}

export function InstitutionInfo({ institution }: InstitutionInfoProps) {
  // Get main campus if available
  const mainCampus = institution.campuses?.find((c) => c.isMain) || institution.campuses?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      role="region"
      aria-label="Institution Overview"
    >
      <Card className="bg-white/80 backdrop-blur-md border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-800">Institution Overview</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="hover:bg-gray-100"
                  disabled
                  aria-label="Edit institution details (coming soon)"
                >
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editing institution details coming soon</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-6">
          {institution.logoUrl ? (
            <img
              src={institution.logoUrl}
              alt={`${institution.name} logo`}
              className="w-24 h-24 rounded-lg object-contain border border-gray-200 shadow-sm hover:scale-105 transition-transform duration-200"
              loading="lazy"
            />
          ) : (
            <div
              className="w-24 h-24 rounded-lg bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium"
              aria-label="No logo available"
            >
              No Logo
            </div>
          )}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">{institution.name}</h2>
            <p className="text-gray-600">
              <span className="font-medium">Domain:</span> {institution.domain}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Email:</span> {institution.email}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Address:</span>{" "}
              {mainCampus?.address || "N/A"}, {mainCampus?.city || "N/A"}, {mainCampus?.country || "N/A"}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Phone:</span> {institution.phone || mainCampus?.phone || "N/A"}
            </p>
            <p className="text-gray-600 flex items-center">
              <span className="font-medium">Status:</span>
              <span
                className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                  institution.status === 'Active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
                aria-label={`Institution status: ${institution.status}`}
              >
                {institution.status}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}