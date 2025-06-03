"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Button, TextField, Box, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import AuditObjectiveInput from "./AuditObjectiveInput";

interface NewProgram {
  name: string;
  auditProgramObjective: string;
  status: string;
  startDate: string;
  endDate: string;
  tenantId?: string;
  tenantName?: string;
  createdBy?: string;
  audits?: Array<{
    scope: string[];
    specificAuditObjectives: string[];
    methods: string[];
    criteria: string[];
  }>;
}

interface AuditProgramFormProps {
  initialData?: NewProgram;
  onSubmit: (data: NewProgram) => Promise<void>;
  mode: "create" | "edit";
}

export default function AuditProgramForm({ initialData, onSubmit, mode }: AuditProgramFormProps) {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  const [newProgram, setNewProgram] = useState<NewProgram>({
    name: initialData?.name || "",
    auditProgramObjective: initialData?.auditProgramObjective || "",
    status: initialData?.status || "Draft",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    tenantId: initialData?.tenantId || user?.tenantId,
    tenantName: initialData?.tenantName || user?.tenantName,
    createdBy: initialData?.createdBy || user?.id,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProgram((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!newProgram.name) newErrors.name = "Program Name is required";
    if (!newProgram.startDate) newErrors.startDate = "Start Date is required";
    if (!newProgram.endDate) newErrors.endDate = "End Date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isFormComplete = () =>
    !!newProgram.name && !!newProgram.startDate && !!newProgram.endDate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await onSubmit(newProgram);
      router.push("/audit/audit-program?tab=draft");
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        submit: error.message || `Failed to ${mode === "create" ? "create" : "update"} program. Please try again.`,
      }));
    }
  };

  if (!isClient) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Typography variant="h4" component="h1" className="mb-6 font-bold text-gray-800">
        {mode === "create" ? "Create New Audit Program" : "Edit Audit Program"}
      </Typography>

      <Box
        sx={{
          bgcolor: "white",
          boxShadow: 3,
          p: 4,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "grey.200",
        }}
      >
        <TextField
          label="Program Name"
          name="name"
          value={newProgram.name}
          onChange={handleInputChange}
          fullWidth
          className="mb-4"
          required
          error={!!errors.name}
          helperText={errors.name}
          variant="outlined"
        />
        <AuditObjectiveInput
          value={newProgram.auditProgramObjective}
          onChange={(value: string) =>
            setNewProgram((prev) => ({ ...prev, auditProgramObjective: value }))
          }
        />
        <TextField
          label="Start Date"
          name="startDate"
          type="date"
          value={newProgram.startDate}
          onChange={handleInputChange}
          fullWidth
          className="mb-4"
          required
          error={!!errors.startDate}
          helperText={errors.startDate}
          InputLabelProps={{ shrink: true }}
          variant="outlined"
        />
        <TextField
          label="End Date"
          name="endDate"
          type="date"
          value={newProgram.endDate}
          onChange={handleInputChange}
          fullWidth
          className="mb-4"
          required
          error={!!errors.endDate}
          helperText={errors.endDate}
          InputLabelProps={{ shrink: true }}
          variant="outlined"
        />

        <Box className="flex justify-between mt-6">
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => router.push("/audit/audit-programs?tab=draft")}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={!isFormComplete()}
            startIcon={isFormComplete() ? <CheckCircleIcon /> : undefined}
          >
            {mode === "create" ? "Create Program" : "Save Changes"}
          </Button>
        </Box>
        {errors.submit && (
          <Typography variant="body2" color="error" className="mt-2">
            {errors.submit}
          </Typography>
        )}
      </Box>
    </div>
  );
}