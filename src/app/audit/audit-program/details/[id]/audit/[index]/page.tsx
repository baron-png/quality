
"use client";
import { createAuditForProgram } from "@/api/auditService";
import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";

const Page = () => {
  const [auditDetails, setAuditDetails] = useState({
    objectives: "",
    scope: "",
    criteria: "",
    methods: "",
  });

  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token } = useAuth();
  const { id: programId, index } = params;
  const auditHeader = searchParams.get("auditHeader") || "Unknown Audit";

  const handleInputChange = (field: string, value: string | undefined) => {
    setAuditDetails((prev) => ({ ...prev, [field]: value || "" }));
  };

  const handleSave = async () => {
    try {
          await createAuditForProgram(
        programId as string,
        {
          scope: auditDetails.scope ? [auditDetails.scope] : [],
          specificAuditObjectives: auditDetails.objectives ? [auditDetails.objectives] : [], // <-- PLURAL
          methods: auditDetails.methods ? [auditDetails.methods] : [],
          criteria: auditDetails.criteria ? [auditDetails.criteria] : [],
          auditNumber: auditHeader,
        },
        token
      );
      router.push(`/audit/audit-program/details/${programId}`);
    } catch (error: any) {
      alert(error.message || "Failed to save audit details");
    }
  };

  const handleCancel = () => {
    router.push(`/audit/audit-program/details/${programId}`);
  };

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
          background: "linear-gradient(135deg, #FFFFFF 0%, #F9FBFC 100%)",
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
          padding: "28px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <Typography variant="h5" sx={{ color: "#1A73E8", fontWeight: 600 }}>
          Audit: {auditHeader}
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
              commands.strike,
              commands.underline,
              commands.header,
              commands.header2,
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
              commands.strike,
              commands.underline,
              commands.header,
              commands.header2,
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
              commands.strike,
              commands.underline,
              commands.header,
              commands.header2,
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
              commands.strike,
              commands.underline,
              commands.header,
              commands.header2,
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

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "16px", mt: "24px" }}>
          <Button
            variant="outlined"
            onClick={handleCancel}
            sx={{
              color: "#D32F2F",
              borderColor: "#D32F2F",
              padding: "10px 24px",
              borderRadius: "10px",
              "&:hover": { borderColor: "#B71C1C", color: "#B71C1C" },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              background: "linear-gradient(90deg, #1976D2 0%, #42A5F5 100%)",
              color: "#FFFFFF",
              padding: "10px 24px",
              borderRadius: "10px",
              "&:hover": { background: "linear-gradient(90deg, #1565C0 0%, #2196F3 100%)" },
            }}
          >
            Save
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Page;
