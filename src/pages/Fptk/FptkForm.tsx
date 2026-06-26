import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Flex,
  Input,
  // Textarea,
  HStack,
  Stack,
  Grid,
} from "@chakra-ui/react";
import { FiSave, FiArrowLeft, FiPlus, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import fptkService from "../../services/fptkService";
import type { CreateRequisitionInput, MasterData } from "../../types/fptk";
import { toaster } from "../../components/ui/toaster";
import { useAuth } from "../../contexts/AuthContext";
import userService from "../../services/userService";

const FptkForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [masterData, setMasterData] = useState<MasterData | null>(null);
  const [formData, setFormData] = useState<CreateRequisitionInput>({
    requester_name: user?.name ?? "",
    request_date: new Date().toISOString().split("T")[0],
    group: "",
    department: "",
    section: "",
    type: "",
    position: "",
    status: "",
    duration: "",
    level: "",
    cost_employee: "",
    fulfilment_time: "",
    education: "",
    max_age: undefined,
    min_experience: undefined,
    technical_skill: [],
    soft_skill: [],
    description: "",
    cost_center: "",
    objective: "",
    reason: "",
    employee_out: "",
    manpower_plan: "",
    unplanned_reason: "",
  });

  const inputStyle = {
    bg: "#f9fafb",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    color: "#1a202c",
    _hover: { borderColor: "#cbd5e0" },
    _focus: {
      borderColor: "#3182ce",
      boxShadow: "0 0 0 1px #3182ce",
      backgroundColor: "#f9fafb",
    },
  };
  const [approverChain, setApproverChain] = useState<{
    manager: string | null;
    division: string | null;
    director: string | null;
  }>({ manager: null, division: null, director: null });
  useEffect(() => {
    const loadData = async () => {
      try {
        const [masterRes, approverRes] = await Promise.all([
          fptkService.getMasterData(),
          userService.getApproversForUser(user!.id),
        ]);
        setMasterData(masterRes.data);
        setApproverChain({
          manager: approverRes.data.approver_manager?.name ?? null,
          division: approverRes.data.approver_division?.name ?? null,
          director: approverRes.data.approver_director?.name ?? null,
        });
      } catch {
        toaster.create({ title: "Failed to load data", type: "error" });
      }
    };

    void loadData();
  }, [user]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await fptkService.createRequisition(formData);
      toaster.create({
        title: "Requisition created successfully",
        type: "success",
      });
      navigate("/fptklist");
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response
      ) {
        const responseData = error.response.data as {
          message?: string;
          errors?: Record<string, string[]>;
        };

        if (responseData.errors) {
          const errorMessages = Object.entries(responseData.errors)
            .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
            .join("\n");
          toaster.create({
            title: "Gagal membuat FPTK",
            description: errorMessages,
            type: "error",
          });
          return;
        }

        if (responseData.message) {
          toaster.create({
            title: "Gagal membuat FPTK",
            description: responseData.message,
            type: "error",
          });
          return;
        }
      }

      toaster.create({
        title: "Gagal membuat FPTK",
        description: "Terjadi kesalahan, silakan coba lagi.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof CreateRequisitionInput,
    value: unknown,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (
    field: "technical_skill" | "soft_skill",
    index: number,
    value: string,
  ) => {
    const newArr = [...(formData[field] || [])];
    newArr[index] = value;
    handleChange(field, newArr);
  };

  const addArrayItem = (field: "technical_skill" | "soft_skill") => {
    handleChange(field, [...(formData[field] || []), ""]);
  };

  const removeArrayItem = (
    field: "technical_skill" | "soft_skill",
    index: number,
  ) => {
    const newArr = [...(formData[field] || [])];
    newArr.splice(index, 1);
    handleChange(field, newArr);
  };

  return (
    <MainLayout>
      <Box p={6}>
        <HStack mb={6}>
          <button
            type="button"
            onClick={() => navigate("/fptklist")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#4a5568",
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#f7fafc")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#ffffff")
            }
          >
            <FiArrowLeft size={14} /> Back
          </button>
          <Text fontSize="2xl" fontWeight="bold" color="brand.800">
            Create New FPTK
          </Text>
        </HStack>

        <form onSubmit={handleSubmit}>
          <Stack
            gap={8}
            bg="white"
            shadow="sm"
            rounded="xl"
            p={8}
            borderWidth="1px"
            borderColor="gray.100"
          >
            {/* 1. Requirement Section */}
            <Box>
              <Text
                fontSize="xl"
                fontWeight="bold"
                color="brand.700"
                mb={4}
                borderBottomWidth="2px"
                borderColor="brand.100"
                pb={2}
              >
                1. Requirement
              </Text>
              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                <Box>
                  <Text
                    mb="2px"
                    fontWeight="600"
                    fontSize="sm"
                    color="gray.700"
                  >
                    Requested By *
                  </Text>
                  <Input
                    required
                    {...inputStyle}
                    value={formData.requester_name}
                    disabled
                    style={{
                      opacity: 0.7,
                      cursor: "not-allowed",
                      backgroundColor: "#f1f5f9",
                    }}
                  />
                </Box>
                <Box>
                  <Text
                    mb="2px"
                    fontWeight="600"
                    fontSize="sm"
                    color="gray.700"
                  >
                    Request Date *
                  </Text>
                  <Input
                    type="date"
                    required
                    {...inputStyle}
                    value={formData.request_date}
                    onChange={(e) =>
                      handleChange("request_date", e.target.value)
                    }
                  />
                </Box>
                {/* <Box>
                  <Text
                    mb="2px"
                    fontWeight="600"
                    fontSize="sm"
                    color="gray.700"
                  >
                    Group
                  </Text>
                  <select
                    value={formData.group}
                    onChange={(e) => handleChange("group", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#f9fafb",
                      color: "#1a202c",
                    }}
                  >
                    <option value="">Select Group</option>
                    {masterData?.companies.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Box> */}
                <Box>
                  <Text
                    mb="2px"
                    fontWeight="600"
                    fontSize="sm"
                    color="gray.700"
                  >
                    Departement
                  </Text>
                  <select
                    value={formData.department}
                    onChange={(e) => handleChange("department", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#f9fafb",
                      color: "#1a202c",
                    }}
                  >
                    <option value="">Select Department</option>
                    {masterData?.departments.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </Box>
                <Box>
                  <Text
                    mb="2px"
                    fontWeight="600"
                    fontSize="sm"
                    color="gray.700"
                  >
                    Section
                  </Text>
                  <select
                    value={formData.section}
                    onChange={(e) => handleChange("section", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#f9fafb",
                      color: "#1a202c",
                    }}
                  >
                    <option value="">Select Section</option>
                    {masterData?.sections.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Box>
                {/* <Box>
                  <Text
                    mb="2px"
                    fontWeight="600"
                    fontSize="sm"
                    color="gray.700"
                  >
                    Fullfilment Type
                  </Text>
                  <select
                    value={formData.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#f9fafb",
                      color: "#1a202c",
                    }}
                  >
                    <option value="">Select Type</option>
                    <option value="Internal">Internal</option>
                    <option value="Eksternal">Eksternal</option>
                  </select>
                </Box> */}
                <Box>
                  <Text
                    mb="2px"
                    fontWeight="600"
                    fontSize="sm"
                    color="gray.700"
                  >
                    Position
                  </Text>
                  <Input
                    {...inputStyle}
                    value={formData.position}
                    onChange={(e) => handleChange("position", e.target.value)}
                  />
                </Box>
                <Box>
                  <Text
                    mb="2px"
                    fontWeight="600"
                    fontSize="sm"
                    color="gray.700"
                  >
                    Status
                  </Text>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange("status", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#f9fafb",
                      color: "#1a202c",
                    }}
                  >
                    <option value="">Select Status</option>
                    {masterData?.employee_statuses.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Box>
                <Box>
                  <Text
                    mb="2px"
                    fontWeight="600"
                    fontSize="sm"
                    color="gray.700"
                  >
                    Level
                  </Text>
                  <select
                    value={formData.level}
                    onChange={(e) => handleChange("level", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#f9fafb",
                      color: "#1a202c",
                    }}
                  >
                    <option value="">Select Level</option>
                    {[0, 1, 2, 3, 4, 5].map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </Box>
                <Box>
                  <Text
                    mb="2px"
                    fontWeight="600"
                    fontSize="sm"
                    color="gray.700"
                  >
                    Duration
                  </Text>
                  <Input
                    type="number"
                    {...inputStyle}
                    value={formData.duration}
                    onChange={(e) => handleChange("duration", e.target.value)}
                  />
                </Box>
                <Box>
                  <Text
                    mb="2px"
                    fontWeight="600"
                    fontSize="sm"
                    color="gray.700"
                  >
                    Number Of Employee
                  </Text>
                  <Input
                    {...inputStyle}
                    value={formData.cost_employee}
                    onChange={(e) =>
                      handleChange("cost_employee", e.target.value)
                    }
                  />
                </Box>
                <Box>
                  <Text
                    mb="2px"
                    fontWeight="600"
                    fontSize="sm"
                    color="gray.700"
                  >
                    Fullfilment Time
                  </Text>
                  <Input
                    type="date"
                    {...inputStyle}
                    value={formData.fulfilment_time}
                    onChange={(e) =>
                      handleChange("fulfilment_time", e.target.value)
                    }
                  />
                </Box>
              </Grid>
            </Box>

            {/* 2. Specifications Section */}
            <Box>
              <Text
                fontSize="xl"
                fontWeight="bold"
                color="brand.700"
                mb={4}
                borderBottomWidth="2px"
                borderColor="brand.100"
                pb={2}
              >
                2. Man Spesification & Job Spesification
              </Text>
              <Grid
                templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                gap={6}
                mb={6}
              >
                <Box>
                  <Text
                    mb="2px"
                    fontWeight="600"
                    fontSize="sm"
                    color="gray.700"
                  >
                    Minimum Education
                  </Text>
                  <select
                    value={formData.education}
                    onChange={(e) => handleChange("education", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#f9fafb",
                      color: "#1a202c",
                    }}
                  >
                    <option value="">Select Education</option>
                    <option value="SMA/SMK">SMA/SMK</option>
                    <option value="D1/D3">D1/D3</option>
                    <option value="S1/S2">S1/S2</option>
                  </select>
                </Box>
                {/* <Box>
                  <Text
                    mb="2px"
                    fontWeight="600"
                    fontSize="sm"
                    color="gray.700"
                  >
                    Maximum Age
                  </Text>
                  <Input
                    type="number"
                    {...inputStyle}
                    value={formData.max_age || ""}
                    onChange={(e) =>
                      handleChange(
                        "max_age",
                        parseInt(e.target.value) || undefined,
                      )
                    }
                  />
                </Box> */}
                <Box>
                  <Text
                    mb="2px"
                    fontWeight="600"
                    fontSize="sm"
                    color="gray.700"
                  >
                    Min. Experience
                  </Text>
                  <select
                    value={formData.min_experience}
                    onChange={(e) =>
                      handleChange(
                        "min_experience",
                        parseInt(e.target.value) || undefined,
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#f9fafb",
                      color: "#1a202c",
                    }}
                  >
                    <option value="">Select Min Experience</option>
                    <option value="0">Fresh Graduate</option>
                    <option value="1">1 - 2 Years</option>
                    <option value="2">2 Years above</option>
                  </select>
                </Box>
              </Grid>

              <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
                <Box>
                  <Text
                    mb="2px"
                    fontWeight="600"
                    fontSize="sm"
                    color="gray.700"
                  >
                    Technical Skill
                  </Text>
                  <Stack gap={2}>
                    {formData.technical_skill?.map((skill, index) => (
                      <HStack key={index}>
                        <Input
                          {...inputStyle}
                          value={skill}
                          onChange={(e) =>
                            handleArrayChange(
                              "technical_skill",
                              index,
                              e.target.value,
                            )
                          }
                          placeholder="e.g. ReactJS"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            removeArrayItem("technical_skill", index)
                          }
                          style={{
                            width: "32px",
                            height: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "6px",
                            color: "#e53e3e",
                            backgroundColor: "#fff5f5",
                            border: "1px solid #fed7d7",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#fed7d7")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#fff5f5")
                          }
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </HStack>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem("technical_skill")}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "6px 12px",
                        fontSize: "13px",
                        borderRadius: "6px",
                        color: "#4a5568",
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        cursor: "pointer",
                        alignSelf: "flex-start",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f7fafc")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#ffffff")
                      }
                    >
                      <FiPlus size={13} /> Add Technical Skill
                    </button>
                  </Stack>
                </Box>
                <Box>
                  <Text
                    mb="2px"
                    fontWeight="600"
                    fontSize="sm"
                    color="gray.700"
                  >
                    Soft Skill
                  </Text>
                  <Stack gap={2}>
                    {formData.soft_skill?.map((skill, index) => (
                      <HStack key={index}>
                        <Input
                          {...inputStyle}
                          value={skill}
                          onChange={(e) =>
                            handleArrayChange(
                              "soft_skill",
                              index,
                              e.target.value,
                            )
                          }
                          placeholder="e.g. Communication"
                        />
                        <button
                          type="button"
                          onClick={() => removeArrayItem("soft_skill", index)}
                          style={{
                            width: "32px",
                            height: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "6px",
                            color: "#e53e3e",
                            backgroundColor: "#fff5f5",
                            border: "1px solid #fed7d7",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#fed7d7")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#fff5f5")
                          }
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </HStack>
                    ))}
                    <button
                      type="button"
                      onClick={() => addArrayItem("soft_skill")}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "6px 12px",
                        fontSize: "13px",
                        borderRadius: "6px",
                        color: "#4a5568",
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        cursor: "pointer",
                        alignSelf: "flex-start",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f7fafc")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#ffffff")
                      }
                    >
                      <FiPlus size={13} /> Add Soft Skill
                    </button>
                  </Stack>
                </Box>
              </Grid>
            </Box>

            {/* 3. Detail Requisition */}
            <Box>
              <Text
                fontSize="xl"
                fontWeight="bold"
                color="brand.700"
                mb={4}
                borderBottomWidth="2px"
                borderColor="brand.100"
                pb={2}
              >
                3. Detail Requisition
              </Text>

              {/* <Box mb={4}>
                <Text mb="2px" fontWeight="600" fontSize="sm" color="gray.700">
                  Description
                </Text>
                <Textarea
                  {...inputStyle}
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                />
              </Box> */}

              <Grid
                templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                gap={6}
                mb={4}
              >
                <Box>
                  <Text
                    mb="2px"
                    fontWeight="600"
                    fontSize="sm"
                    color="gray.700"
                  >
                    Employee Cost Center
                  </Text>
                  <select
                    value={formData.cost_center}
                    onChange={(e) =>
                      handleChange("cost_center", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#f9fafb",
                      color: "#1a202c",
                    }}
                  >
                    <option value="">Select Cost Center</option>
                    <option value="DL">DL</option>
                    <option value="IDL">IDL</option>
                    <option value="SGA">SGA</option>
                  </select>
                </Box>
                <Box>
                  <Text
                    mb="2px"
                    fontWeight="600"
                    fontSize="sm"
                    color="gray.700"
                  >
                    Requisition Objectives
                  </Text>
                  <select
                    value={formData.objective}
                    onChange={(e) => handleChange("objective", e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#f9fafb",
                      color: "#1a202c",
                    }}
                  >
                    <option value="">Select Objective</option>
                    <option value="Replacement">Replacement</option>
                    <option value="Additional">Additional</option>
                  </select>
                </Box>
              </Grid>

              {formData.objective === "Replacement" && (
                <Grid
                  templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                  gap={6}
                  mb={4}
                >
                  <Box>
                    <Text
                      mb="2px"
                      fontWeight="600"
                      fontSize="sm"
                      color="gray.700"
                    >
                      Replacement Reason
                    </Text>
                    <select
                      value={formData.reason}
                      onChange={(e) => handleChange("reason", e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
                        backgroundColor: "#f9fafb",
                        color: "#1a202c",
                      }}
                    >
                      <option value="">Select Reason</option>
                      <option value="End Of Contract">End Of Contract</option>
                      <option value="Resign">Resign</option>
                      <option value="Not Pass Probation">
                        Not Pass Probation
                      </option>
                      <option value="Transferred">Transferred</option>
                    </select>
                  </Box>
                  <Box>
                    <Text
                      mb="2px"
                      fontWeight="600"
                      fontSize="sm"
                      color="gray.700"
                    >
                      Name Of Employee Out
                    </Text>
                    <Input
                      {...inputStyle}
                      value={formData.employee_out}
                      onChange={(e) =>
                        handleChange("employee_out", e.target.value)
                      }
                    />
                  </Box>
                </Grid>
              )}

              <Grid
                templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                gap={6}
                mb={4}
              >
                <Box>
                  <Text
                    mb="2px"
                    fontWeight="600"
                    fontSize="sm"
                    color="gray.700"
                  >
                    Manpower Plan
                  </Text>
                  <select
                    value={formData.manpower_plan}
                    onChange={(e) =>
                      handleChange("manpower_plan", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#f9fafb",
                      color: "#1a202c",
                    }}
                  >
                    <option value="">Select Plan</option>
                    <option value="Planned">Planned</option>
                    <option value="Unplanned">Unplanned</option>
                  </select>
                </Box>
                {formData.manpower_plan === "Unplanned" && (
                  <Box>
                    <Text
                      mb="2px"
                      fontWeight="600"
                      fontSize="sm"
                      color="gray.700"
                    >
                      Unplanned Reason
                    </Text>
                    <Input
                      {...inputStyle}
                      value={formData.unplanned_reason}
                      onChange={(e) =>
                        handleChange("unplanned_reason", e.target.value)
                      }
                    />
                  </Box>
                )}
              </Grid>
            </Box>
            {/* Acknowledgement Section */}
            <Box>
              <Text
                fontSize="xl"
                fontWeight="bold"
                color="brand.700"
                mb={4}
                borderBottomWidth="2px"
                borderColor="brand.100"
                pb={2}
              >
                4. Acknowledge
              </Text>
              <Box maxW="400px">
                <Text mb="2px" fontWeight="600" fontSize="sm" color="gray.700">
                  Acknowledged By
                </Text>
                <Input
                  {...inputStyle}
                  value={
                    approverChain.manager ??
                    approverChain.division ??
                    approverChain.director ??
                    "— Tidak Ada —"
                  }
                  disabled
                  style={{
                    opacity: 0.7,
                    cursor: "not-allowed",
                    backgroundColor:
                      (approverChain.manager ??
                      approverChain.division ??
                      approverChain.director)
                        ? "#f0fdf4"
                        : "#f8fafc",
                    borderColor:
                      (approverChain.manager ??
                      approverChain.division ??
                      approverChain.director)
                        ? "#86efac"
                        : "#e2e8f0",
                    color:
                      (approverChain.manager ??
                      approverChain.division ??
                      approverChain.director)
                        ? "#166534"
                        : "#94a3b8",
                  }}
                />
              </Box>
            </Box>
            {/* Footer buttons */}
            <Flex
              mt={8}
              pt={6}
              borderTopWidth="1px"
              borderColor="gray.100"
              justify="flex-end"
              gap={4}
            >
              <button
                type="button"
                onClick={() => navigate("/fptklist")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "8px 16px",
                  fontSize: "14px",
                  borderRadius: "8px",
                  color: "#4a5568",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#f7fafc")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#ffffff")
                }
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 20px",
                  fontSize: "14px",
                  fontWeight: "500",
                  borderRadius: "8px",
                  color: "#ffffff",
                  backgroundColor: loading ? "#7fb3d3" : "#1A5EA8",
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading)
                    e.currentTarget.style.backgroundColor = "#154d8c";
                }}
                onMouseLeave={(e) => {
                  if (!loading)
                    e.currentTarget.style.backgroundColor = "#1A5EA8";
                }}
              >
                <FiSave size={15} /> Save FPTK
              </button>
            </Flex>
          </Stack>
        </form>
      </Box>
    </MainLayout>
  );
};

export default FptkForm;
