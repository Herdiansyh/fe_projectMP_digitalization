import type React from "react";

export const inputStyle: React.CSSProperties = {
  padding: "6px 10px",
  fontSize: "13px",
  color: "#1a202c",
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  outline: "none",
};

export const smallBtn: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  padding: "5px 10px",
  fontSize: "12px",
  fontWeight: 600,
  borderRadius: "6px",
  cursor: "pointer",
  border: "1px solid transparent",
};

export const labelStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 600,
  color: "#64748b",
  marginBottom: "3px",
  display: "block",
};

export const fieldWrapperStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
};
