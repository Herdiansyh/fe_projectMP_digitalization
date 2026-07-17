import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  HStack,
  Input,
  VStack,
  IconButton,
  Switch,
  Accordion,
  Textarea,
} from "@chakra-ui/react";
import { toaster } from "../../components/ui/toaster";
import MainLayout from "../../components/layout/MainLayout";
import evaluationService from "../../services/evaluationService";
import manageService from "../../services/evaluationCriteriaManageService";
import ScoringRubricTable from "../Evaluation/ScoringRubricTable";
import type { EvaluationGroup } from "../../types/evaluation";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const IconTrash = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);
const IconUp = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);
const IconDown = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const EvaluationFormManage: React.FC = () => {
  const [groups, setGroups] = useState<EvaluationGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = (options: any) =>
    toaster.create({ ...options, type: options.status });

  const [confirmDelete, setConfirmDelete] = useState<{
    type: string;
    id: number;
  } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await evaluationService.getCriteria();
      setGroups(res.data || []);
    } catch (e: any) {
      toast({ title: "Failed to load criteria", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalWeight = useMemo(() => {
    return groups.reduce(
      (acc, g) =>
        acc +
        g.subgroups.reduce(
          (accS, sg) =>
            accS +
            sg.criteria.reduce(
              (accC, c) => accC + (c.is_active ? c.weight : 0),
              0,
            ),
          0,
        ),
      0,
    );
  }, [groups]);

  // Local Updates
  const handleUpdateGroup = (id: number, field: string, val: any) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: val } : g)),
    );
  };

  const handleUpdateSubgroup = (id: number, field: string, val: any) => {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        subgroups: g.subgroups.map((s) =>
          s.id === id ? { ...s, [field]: val } : s,
        ),
      })),
    );
  };

  const handleUpdateCriteria = (id: number, field: string, val: any) => {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        subgroups: g.subgroups.map((s) => ({
          ...s,
          criteria: s.criteria.map((c) =>
            c.id === id ? { ...c, [field]: val } : c,
          ),
        })),
      })),
    );
  };

  const handleUpdateScaleOption = (
    criteriaId: number,
    score: number,
    description: string,
  ) => {
    setGroups((prev) =>
      prev.map((g) => ({
        ...g,
        subgroups: g.subgroups.map((s) => ({
          ...s,
          criteria: s.criteria.map((c) => {
            if (c.id === criteriaId) {
              const currentOptions = [...(c.scale_options || [])];
              const optIndex = currentOptions.findIndex(
                (o) => o.score === score,
              );
              if (optIndex >= 0) {
                currentOptions[optIndex] = {
                  ...currentOptions[optIndex],
                  description,
                };
              } else {
                currentOptions.push({
                  id: 0,
                  description,
                  score,
                  order: score,
                });
              }
              return { ...c, scale_options: currentOptions };
            }
            return c;
          }),
        })),
      })),
    );
  };

  const [saving, setSaving] = useState(false);
  const handleSaveAll = async () => {
    try {
      setSaving(true);
      await manageService.bulkUpdate({ groups });
      toast({ title: "Semua perubahan berhasil disimpan!", status: "success" });
      loadData();
    } catch (e: any) {
      toast({
        title: "Gagal menyimpan",
        description: e.response?.data?.message,
        status: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // Handle Deletes
  const handleDelete = async () => {
    if (!confirmDelete) return;
    const { type, id } = confirmDelete;
    try {
      if (type === "group") await manageService.deleteGroup(id);
      if (type === "subgroup") await manageService.deleteSubgroup(id);
      if (type === "criteria") await manageService.deleteCriteria(id);
      toast({ title: "Deleted successfully", status: "success" });
      loadData();
    } catch (e: any) {
      toast({
        title: "Deletion failed",
        description: e.response?.data?.message,
        status: "error",
      });
    } finally {
      setConfirmDelete(null);
    }
  };

  // Add Items
  const handleAddGroup = async () => {
    try {
      await manageService.createGroup({ name: "New Group", code: "NEW" });
      loadData();
    } catch (e) {
      toast({ title: "Failed", status: "error" });
    }
  };
  const handleAddSubgroup = async (groupId: number) => {
    try {
      await manageService.createSubgroup(groupId, {
        name: "New Subgroup",
        roman_code: "I",
      });
      loadData();
    } catch (e) {
      toast({ title: "Failed", status: "error" });
    }
  };
  const handleAddCriteria = async (groupId: number, subgroupId: number) => {
    try {
      await manageService.createCriteria(groupId, {
        name: "New Criteria",
        subgroup_id: subgroupId,
        weight: 5,
        is_active: true,
      });
      loadData();
    } catch (e) {
      toast({ title: "Failed", status: "error" });
    }
  };

  // Reorder (Local State)
  const handleReorder = (
    type: string,
    parentId: number | null,
    items: any[],
    index: number,
    direction: "up" | "down",
  ) => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === items.length - 1) return;

    setGroups((prev) => {
      const newGroups = [...prev];
      if (type === "group") {
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        [newGroups[index], newGroups[targetIndex]] = [
          newGroups[targetIndex],
          newGroups[index],
        ];
      } else if (type === "subgroup") {
        const gIdx = newGroups.findIndex((g) => g.id === parentId);
        if (gIdx >= 0) {
          const targetIndex = direction === "up" ? index - 1 : index + 1;
          const newSubgroups = [...newGroups[gIdx].subgroups];
          [newSubgroups[index], newSubgroups[targetIndex]] = [
            newSubgroups[targetIndex],
            newSubgroups[index],
          ];
          newGroups[gIdx] = { ...newGroups[gIdx], subgroups: newSubgroups };
        }
      } else if (type === "criteria") {
        const gIdx = newGroups.findIndex((g) =>
          g.subgroups.some((s) => s.id === parentId),
        );
        if (gIdx >= 0) {
          const sIdx = newGroups[gIdx].subgroups.findIndex(
            (s) => s.id === parentId,
          );
          const targetIndex = direction === "up" ? index - 1 : index + 1;
          const newCriteria = [...newGroups[gIdx].subgroups[sIdx].criteria];
          [newCriteria[index], newCriteria[targetIndex]] = [
            newCriteria[targetIndex],
            newCriteria[index],
          ];
          const newSubgroups = [...newGroups[gIdx].subgroups];
          newSubgroups[sIdx] = { ...newSubgroups[sIdx], criteria: newCriteria };
          newGroups[gIdx] = { ...newGroups[gIdx], subgroups: newSubgroups };
        }
      }
      return newGroups;
    });
  };

  if (loading)
    return (
      <MainLayout>
        <Box p={8} textAlign="center">
          Loading...
        </Box>
      </MainLayout>
    );

  return (
    <MainLayout>
      <Flex direction="column" gap={6}>
        <Flex justify="space-between" align="center">
          <Box>
            <Text fontSize="2xl" fontWeight="bold">
              Manage Evaluation Form
            </Text>
            <Text fontSize="sm" color="gray.500">
              Configure evaluation rubric criteria and weights.
            </Text>
          </Box>
          <HStack>
            <Button colorScheme="blue" size="sm" onClick={handleAddGroup}>
              + Add Group
            </Button>
            <Button
              colorPalette="green"
              size="sm"
              onClick={handleSaveAll}
              loading={saving}
            >
              Save Changes
            </Button>
          </HStack>
        </Flex>

        {totalWeight !== 100 && (
          <Box
            p={3}
            bg="orange.50"
            border="1px solid"
            borderColor="orange.200"
            borderRadius="md"
          >
            <Text fontSize="sm" color="orange.800">
              <b>Warning:</b> Total weight of active criteria is not 100. Please
              adjust the weights.
            </Text>
          </Box>
        )}

        <Flex
          gap={6}
          align="flex-start"
          direction={{ base: "column", lg: "row" }}
        >
          {/* Editor Panel */}
          <Box
            flex={{ lg: 1 }}
            w="100%"
            bg="white"
            p={4}
            borderRadius="lg"
            shadow="sm"
            maxH="80vh"
            overflowY="auto"
          >
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Editor
            </Text>
            {groups.map((group, gIdx) => (
              <Box
                key={group.id}
                mb={4}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                p={3}
                bg="gray.50"
              >
                <Flex align="center" gap={3} mb={3}>
                  <Input
                    size="sm"
                    value={group.name || ""}
                    onChange={(e) =>
                      handleUpdateGroup(group.id, "name", e.target.value)
                    }
                    w="auto"
                    flex={1}
                    fontWeight="bold"
                    bg="white"
                    placeholder="Nama Group (contoh: A. Hasil Kerja)"
                  />
                  <Input
                    size="sm"
                    value={group.code || ""}
                    onChange={(e) =>
                      handleUpdateGroup(group.id, "code", e.target.value)
                    }
                    w="60px"
                    bg="white"
                    placeholder="Kode"
                  />
                  <HStack gap={1}>
                    <IconButton
                      aria-label="Up"
                      size="xs"
                      onClick={() =>
                        handleReorder("group", null, groups, gIdx, "up")
                      }
                      disabled={gIdx === 0}
                    >
                      <IconUp />
                    </IconButton>
                    <IconButton
                      aria-label="Down"
                      size="xs"
                      onClick={() =>
                        handleReorder("group", null, groups, gIdx, "down")
                      }
                      disabled={gIdx === groups.length - 1}
                    >
                      <IconDown />
                    </IconButton>
                    <IconButton
                      aria-label="Delete"
                      size="xs"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() =>
                        setConfirmDelete({ type: "group", id: group.id })
                      }
                    >
                      <IconTrash />
                    </IconButton>
                  </HStack>
                </Flex>

                <Textarea
                  size="sm"
                  value={group.description || ""}
                  onChange={(e) =>
                    handleUpdateGroup(group.id, "description", e.target.value)
                  }
                  placeholder="Penjelasan / Deskripsi Group (opsional)"
                  bg="white"
                  mb={3}
                  resize="vertical"
                  minH="40px"
                />

                <Box pl={4}>
                  {group.subgroups.map((subgroup, sIdx) => (
                    <Box
                      key={subgroup.id}
                      mb={3}
                      border="1px solid"
                      borderColor="gray.200"
                      borderRadius="md"
                      p={3}
                      bg="white"
                    >
                      <Flex align="center" gap={3} mb={2}>
                        <Input
                          size="sm"
                          value={subgroup.name || ""}
                          onChange={(e) =>
                            handleUpdateSubgroup(
                              subgroup.id,
                              "name",
                              e.target.value,
                            )
                          }
                          flex={1}
                          fontWeight="semibold"
                          placeholder="Nama Subgroup (contoh: Penguasaan Kerja)"
                        />
                        <Input
                          size="sm"
                          value={subgroup.roman_code || ""}
                          onChange={(e) =>
                            handleUpdateSubgroup(
                              subgroup.id,
                              "roman_code",
                              e.target.value,
                            )
                          }
                          w="60px"
                          placeholder="Romawi"
                        />
                        <HStack gap={1}>
                          <IconButton
                            aria-label="Up"
                            size="xs"
                            onClick={() =>
                              handleReorder(
                                "subgroup",
                                group.id,
                                group.subgroups,
                                sIdx,
                                "up",
                              )
                            }
                            disabled={sIdx === 0}
                          >
                            <IconUp />
                          </IconButton>
                          <IconButton
                            aria-label="Down"
                            size="xs"
                            onClick={() =>
                              handleReorder(
                                "subgroup",
                                group.id,
                                group.subgroups,
                                sIdx,
                                "down",
                              )
                            }
                            disabled={sIdx === group.subgroups.length - 1}
                          >
                            <IconDown />
                          </IconButton>
                          <IconButton
                            aria-label="Delete"
                            size="xs"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() =>
                              setConfirmDelete({
                                type: "subgroup",
                                id: subgroup.id,
                              })
                            }
                          >
                            <IconTrash />
                          </IconButton>
                        </HStack>
                      </Flex>

                      <Textarea
                        size="sm"
                        value={subgroup.description || ""}
                        onChange={(e) =>
                          handleUpdateSubgroup(
                            subgroup.id,
                            "description",
                            e.target.value,
                          )
                        }
                        placeholder="Penjelasan / Deskripsi Subgroup (opsional)"
                        bg="white"
                        mb={3}
                        resize="vertical"
                        minH="40px"
                      />

                      <Box pl={4}>
                        {subgroup.criteria.map((criteria, cIdx) => (
                          <Accordion.Root collapsible key={criteria.id}>
                            <Accordion.Item
                              value={criteria.id.toString()}
                              border="none"
                            >
                              <Flex
                                align="center"
                                gap={3}
                                mb={2}
                                bg="gray.50"
                                p={2}
                                borderRadius="md"
                                border="1px solid"
                                borderColor="gray.200"
                              >
                                <Switch.Root
                                  size="sm"
                                  checked={criteria.is_active}
                                  onCheckedChange={(e) =>
                                    handleUpdateCriteria(
                                      criteria.id,
                                      "is_active",
                                      e.checked,
                                    )
                                  }
                                >
                                  <Switch.HiddenInput />
                                  <Switch.Control>
                                    <Switch.Thumb />
                                  </Switch.Control>
                                </Switch.Root>
                                <Input
                                  size="sm"
                                  value={criteria.name || ""}
                                  onChange={(e) =>
                                    handleUpdateCriteria(
                                      criteria.id,
                                      "name",
                                      e.target.value,
                                    )
                                  }
                                  flex={1}
                                  bg="white"
                                />
                                <Input
                                  size="sm"
                                  type="number"
                                  step="1"
                                  min="0"
                                  w="60px"
                                  value={criteria.weight ?? ""}
                                  onChange={(e) => {
                                    const raw = e.target.value;
                                    // Buang bagian desimal kalau user paste/ketik angka koma
                                    const intValue =
                                      raw === "" ? 0 : parseInt(raw, 10);
                                    handleUpdateCriteria(
                                      criteria.id,
                                      "weight",
                                      Number.isNaN(intValue) ? 0 : intValue,
                                    );
                                  }}
                                  onKeyDown={(e) => {
                                    // Cegah user mengetik titik/koma langsung di field ini
                                    if (e.key === "." || e.key === ",") {
                                      e.preventDefault();
                                    }
                                  }}
                                  bg="white"
                                />
                                <Accordion.ItemTrigger
                                  w="auto"
                                  p={1}
                                  borderRadius="md"
                                  bg="blue.50"
                                  color="blue.600"
                                  px={2}
                                  _hover={{ bg: "blue.100" }}
                                >
                                  <Text fontSize="xs" fontWeight="bold" mr={1}>
                                    Opsi (N1-N5)
                                  </Text>
                                  <Accordion.ItemIndicator />
                                </Accordion.ItemTrigger>
                                <HStack gap={1}>
                                  <IconButton
                                    aria-label="Up"
                                    size="xs"
                                    onClick={() =>
                                      handleReorder(
                                        "criteria",
                                        group.id,
                                        subgroup.criteria,
                                        cIdx,
                                        "up",
                                      )
                                    }
                                    disabled={cIdx === 0}
                                  >
                                    <IconUp />
                                  </IconButton>
                                  <IconButton
                                    aria-label="Down"
                                    size="xs"
                                    onClick={() =>
                                      handleReorder(
                                        "criteria",
                                        group.id,
                                        subgroup.criteria,
                                        cIdx,
                                        "down",
                                      )
                                    }
                                    disabled={
                                      cIdx === subgroup.criteria.length - 1
                                    }
                                  >
                                    <IconDown />
                                  </IconButton>
                                  <IconButton
                                    aria-label="Delete"
                                    size="xs"
                                    colorScheme="red"
                                    variant="ghost"
                                    onClick={() =>
                                      setConfirmDelete({
                                        type: "criteria",
                                        id: criteria.id,
                                      })
                                    }
                                  >
                                    <IconTrash />
                                  </IconButton>
                                </HStack>
                              </Flex>
                              <Accordion.ItemContent pb={4} pt={0}>
                                <VStack gap={2} align="stretch" pl={4}>
                                  {[1, 2, 3, 4, 5].map((score) => {
                                    const opt = criteria.scale_options.find(
                                      (o) => o.score === score,
                                    );
                                    return (
                                      <Flex
                                        key={score}
                                        align="flex-start"
                                        gap={2}
                                      >
                                        <Text
                                          fontSize="xs"
                                          fontWeight="bold"
                                          w="24px"
                                          pt={2}
                                        >
                                          N{score}
                                        </Text>
                                        <Textarea
                                          size="xs"
                                          value={opt?.description || ""}
                                          onChange={(e) =>
                                            handleUpdateScaleOption(
                                              criteria.id,
                                              score,
                                              e.target.value,
                                            )
                                          }
                                          placeholder={`Penjelasan untuk poin ${score}`}
                                          resize="vertical"
                                          minH="40px"
                                        />
                                      </Flex>
                                    );
                                  })}
                                </VStack>
                              </Accordion.ItemContent>
                            </Accordion.Item>
                          </Accordion.Root>
                        ))}
                        <Button
                          size="xs"
                          mt={2}
                          onClick={() =>
                            handleAddCriteria(group.id, subgroup.id)
                          }
                        >
                          + Add Criteria
                        </Button>
                      </Box>
                    </Box>
                  ))}
                  <Button
                    size="xs"
                    mt={2}
                    onClick={() => handleAddSubgroup(group.id)}
                  >
                    + Add Subgroup
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>

          {/* Preview Panel */}
          <Box
            flex={{ lg: 1 }}
            w="100%"
            bg="white"
            p={4}
            borderRadius="lg"
            shadow="sm"
            maxH="80vh"
            overflowY="auto"
          >
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Live Preview
            </Text>
            <ScoringRubricTable
              criteriaGroups={groups.map((g) => ({
                ...g,
                subgroups: g.subgroups.map((s) => ({
                  ...s,
                  criteria: s.criteria.filter((c) => c.is_active),
                })),
              }))}
              scores={{}}
              onChange={() => {}}
            />
          </Box>
        </Flex>
      </Flex>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete Confirmation"
        message={`Are you sure you want to delete this ${confirmDelete?.type}?`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </MainLayout>
  );
};

export default EvaluationFormManage;
