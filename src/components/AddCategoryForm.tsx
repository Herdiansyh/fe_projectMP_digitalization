import React, { useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import {
  inputStyle,
  smallBtn,
  labelStyle,
  fieldWrapperStyle,
} from "./shared/styles";

interface AddCategoryFormProps {
  onAdd: (name: string) => Promise<void>;
}

// ── Form kecil: tambah kategori baru ──
const AddCategoryForm: React.FC<AddCategoryFormProps> = ({ onAdd }) => {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onAdd(name.trim());
      setName("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Flex gap={2} mt={2} align="flex-end">
      <Box style={fieldWrapperStyle} flex={1}>
        <label style={labelStyle}>Category Name</label>
        <input
          style={{ ...inputStyle, width: "100%" }}
          placeholder="e.g. Material Handling"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </Box>
      <button
        type="button"
        disabled={saving || !name.trim()}
        onClick={handleSubmit}
        style={{
          ...smallBtn,
          color: "#ffffff",
          backgroundColor: !name.trim() ? "#94a3b8" : "#1A5EA8",
          cursor: !name.trim() ? "not-allowed" : "pointer",
          height: "31px",
        }}
      >
        <FiPlus size={12} /> Add Category
      </button>
    </Flex>
  );
};

export default AddCategoryForm;
