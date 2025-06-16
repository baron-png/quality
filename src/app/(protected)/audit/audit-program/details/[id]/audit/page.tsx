"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Box, Typography, Button, Snackbar, Alert, CircularProgress, Chip } from "@mui/material";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { createAuditForProgram, updateAudit, getAuditProgramById } from "@/api/auditService";

const AuditDetailsPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token, loading: authLoading } = useAuth();
  const { id: programId } = params;
  const auditHeader = searchParams.get("auditHeader") || "Unknown Audit";
  const auditId = searchParams.get("auditId");

  const [auditDetails, setAuditDetails] = useState({
    id: auditId || null,
    auditNumber: auditHeader ? decodeURIComponent(auditHeader) : "",
    objectives: "",
    scope: "",
    criteria: "",
    methods: "",
  });
  const [loading, setLoading] = useState(!!auditId); // Load if auditId exists
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  console.log("AuditDetailsPage rendered", {
    programId,
    auditHeader,
    auditId,
    token: token ? "present" : "missing",
    authLoading,
    params,
  }); // Debug log

  useEffect(() => {
    if (authLoading || !token || !auditId || !programId) return;

    const fetchAudit = async () => {
      console.log("Fetching audit program", { programId, auditId }); // Debug log
      try {
        const program = await getAuditProgramById(programId as string, token);
        console.log("Fetched program:", program); // Debug log
        const audit = program.audits?.find((a: any) => a.id === auditId);
        if (audit) {
          console.log("Found audit:", audit); // Debug log
          setAuditDetails({
            id: audit.id,
            auditNumber: audit.auditNumber || decodeURIComponent(auditHeader),
            objectives: audit.specificAuditObjective?.join("\n") || "",
            scope: audit.scope?.join("\n") || "",
            criteria: audit.criteria?.join("\n") || "",
            methods: audit.methods?.join("\n") || "",
          });
        } else {
          console.log("Audit not found in program", { auditId, programId }); // Debug log
          setError("Audit not found in the program");
        }
      } catch (err: any) {
        console.error("Fetch audit error:", err); // Debug log
        setError(err.message || "Failed to fetch audit details");
      } finally {
        setLoading(false);
      }
    };

    fetchAudit();
  }, [auditId, programId, token, authLoading, auditHeader]);

  const handleInputChange = (field: string, value: string | undefined) => {
    setAuditDetails((prev) => ({ ...prev, [field]: value || "" }));
  };

  const handleSave = async () => {
    console.log("handleSave triggered", { auditDetails, programId, token: token ? "present" : "missing" }); // Debug log
    if (!programId) {
      setError("Program ID is missing");
      console.log("Validation failed: programId is missing"); // Debug log
      return;
    }
    if (!auditDetails.scope.trim() || !auditDetails.objectives.trim() ||
        !auditDetails.criteria.trim() || !auditDetails.methods.trim()) {
      setError("Please fill in all required fields: scope, objectives, criteria, and methods");
      console.log("Validation failed:", auditDetails); // Debug log
      return;
    }

    setSaving(true);
    try {
      const payload = {
        auditNumber: auditDetails.auditNumber,
        scope: auditDetails.scope.split("\n").filter(s => s.trim()),
        specificAuditObjectives: auditDetails.objectives.split("\n").filter(o => o.trim()),
        methods: auditDetails.methods.split("\n").filter(m => m.trim()),
        criteria: auditDetails.criteria.split("\n").filter(c => c.trim()),
      };

      console.log("Saving audit with payload:", payload); // Debug log
      if (auditDetails.id) {
        console.log("Updating audit with ID:", auditDetails.id); // Debug log
        await updateAudit(auditDetails.id, payload, token);
        setSuccess("Audit updated successfully");
      } else {
        console.log("Creating audit for programId:", programId); // Debug log
        await createAuditForProgram(programId as string, payload, token);
        setSuccess("Audit created successfully");
      }

      setTimeout(() => {
        router.push(`/audit/audit-program/details/${programId}`);
      }, 1500);
    } catch (err: any) {
      console.error("Save error:", err); // Debug log
      setError(err.message || "Failed to save audit details");
    } finally {
      setSaving(false);
      console.log("Saving state reset to false"); // Debug log
    }
  };

  const handleCancel = () => {
    console.log("Cancel button clicked"); // Debug log
    router.push(`/audit/audit-program/details/${programId}`);
  };

  if (authLoading || loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: "linear-gradient(135deg, #E3F2FD 0%, #F5F7FA 100%)"
      }}>
        <CircularProgress size={40} sx={{ color: "#1A73E8" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: "32px",
        background: "linear-gradient(135deg, #E3F2FD 0%, #F5F7FA 100%)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <Box
        sx={{
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
          padding: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            boxShadow: "0 12px 32px rgba(0, 0, 0, 0.15)",
          }
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            color: "#1A73E8", 
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 2
          }}
        >
          {auditDetails.id ? "Edit Audit" : "Create Audit"}: {auditHeader}
          {auditDetails.id && (
            <Chip 
              label="Saved" 
              size="small" 
              sx={{ 
                bgcolor: "#E8F0FE", 
                color: "#1A73E8",
                fontWeight: 500
              }} 
            />
          )}
        </Typography>

        <Box>
          <Typography variant="h6" sx={{ color: "#333333", mb: "12px", fontWeight: 600 }}>
            Audit Objective(s)
          </Typography>
          <MDEditor
            value={auditDetails.objectives}
            onChange={(value) => handleInputChange("objectives", value)}
            height={160}
            preview="live"
            commands={[
              commands.bold,
              commands.italic,
              commands.quote,
              commands.code,
              commands.codeBlock,
              commands.unorderedListCommand,
              commands.orderedListCommand,
              commands.link,
              commands.image,
              commands.hr,
              commands.table,
            ].filter(Boolean)}
            style={{
              borderRadius: "10px",
              border: "1px solid #CFD8DC",
              overflow: "hidden",
            }}
            textareaProps={{
              placeholder: "Enter audit objectives...",
            }}
          />
        </Box>

        <Box>
          <Typography variant="h6" sx={{ color: "#333333", mb: "12px", fontWeight: 600 }}>
            Audit Scope
          </Typography>
          <MDEditor
            value={auditDetails.scope}
            onChange={(value) => handleInputChange("scope", value)}
            height={160}
            preview="live"
            commands={[
              commands.bold,
              commands.italic,
              commands.quote,
              commands.code,
              commands.codeBlock,
              commands.unorderedListCommand,
              commands.orderedListCommand,
              commands.link,
              commands.image,
              commands.hr,
              commands.table,
            ].filter(Boolean)}
            style={{
              borderRadius: "10px",
              border: "1px solid #CFD8DC",
              overflow: "hidden",
            }}
            textareaProps={{
              placeholder: "Enter audit scope...",
            }}
          />
        </Box>

        <Box>
          <Typography variant="h6" sx={{ color: "#333333", mb: "12px", fontWeight: 600 }}>
            Audit Criteria
          </Typography>
          <MDEditor
            value={auditDetails.criteria}
            onChange={(value) => handleInputChange("criteria", value)}
            height={160}
            preview="live"
            commands={[
              commands.bold,
              commands.italic,
              commands.quote,
              commands.code,
              commands.codeBlock,
              commands.unorderedListCommand,
              commands.orderedListCommand,
              commands.link,
              commands.image,
              commands.hr,
              commands.table,
            ].filter(Boolean)}
            style={{
              borderRadius: "10px",
              border: "1px solid #CFD8DC",
              overflow: "hidden",
            }}
            textareaProps={{
              placeholder: "Enter audit criteria...",
            }}
          />
        </Box>

        <Box>
          <Typography variant="h6" sx={{ color: "#333333", mb: "12px", fontWeight: 600 }}>
            Audit Methods
          </Typography>
          <MDEditor
            value={auditDetails.methods}
            onChange={(value) => handleInputChange("methods", value)}
            height={160}
            preview="live"
            commands={[
              commands.bold,
              commands.italic,
              commands.quote,
              commands.code,
              commands.codeBlock,
              commands.unorderedListCommand,
              commands.orderedListCommand,
              commands.link,
              commands.image,
              commands.hr,
              commands.table,
            ].filter(Boolean)}
            style={{
              borderRadius: "10px",
              border: "1px solid #CFD8DC",
              overflow: "hidden",
            }}
            textareaProps={{
              placeholder: "Enter audit methods...",
            }}
          />
        </Box>

        <Box sx={{ 
          display: "flex", 
          justifyContent: "flex-end", 
          gap: "16px", 
          mt: "24px",
          position: "relative"
        }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={saving}
            sx={{
              color: "#5F6368",
              borderColor: "#5F6368",
              padding: "10px 24px",
              borderRadius: "10px",
              "&:hover": { 
                borderColor: "#3C4043", 
                color: "#3C4043",
                backgroundColor: "rgba(95, 99, 104, 0.04)"
              },
              transition: "all 0.2s ease-in-out"
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              console.log("Save button clicked, saving:", saving, "programId:", programId); // Debug log
              handleSave();
            }}
            disabled={saving}
            sx={{
              background: "linear-gradient(90deg, #1976D2 0%, #42A5F5 100%)",
              color: "#FFFFFF",
              padding: "10px 24px",
              borderRadius: "10px",
              minWidth: 120,
              "&:hover": { 
                background: "linear-gradient(90deg, #1565C0 0%, #2196F3 100%)",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)"
              },
              "&:disabled": {
                background: "#E0E0E0",
                color: "#9E9E9E"
              },
              transition: "all 0.2s ease-in-out"
            }}
          >
            {saving ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Save"
            )}
          </Button>
        </Box>
      </Box>

      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="error" 
          onClose={() => setError(null)}
          sx={{
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            borderRadius: "8px"
          }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar 
        open={!!success} 
        autoHideDuration={2000} 
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          onClose={() => setSuccess(null)}
          sx={{
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            borderRadius: "8px"
          }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AuditDetailsPage;