import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import RemoveCircleOutlinedIcon from "@mui/icons-material/RemoveCircleOutlined";

import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, Column } from "@/components/common/DataTable";
import { SearchInput } from "@/components/common/SearchInput";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

import {
  usePrescriptions,
  useCreatePrescription,
  useDeletePrescription,
} from "../hooks/usePrescriptions";

import { useExaminations } from "@/features/examinations/hooks/useExaminations";
import { useMedicinesDropdown } from "@/features/medicines/hooks/useMedicines";

import { Prescription, CreatePrescriptionItemDto, Medicine } from "@/types";

import dayjs from "dayjs";

export const PrescriptionListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const preselectedExamId = searchParams.get("examinationId") || "";

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  // Delete state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Create prescription dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(
    Boolean(preselectedExamId),
  );

  const [selectedExamId, setSelectedExamId] =
    useState<string>(preselectedExamId);

  const [notes, setNotes] = useState("");

  const [items, setItems] = useState<CreatePrescriptionItemDto[]>([
    {
      medicineId: "",
      quantity: 10,
      dosage: "1 viên/lần",
      frequency: "2 lần/ngày (sau ăn)",
      duration: "5 ngày",
      durationDays: 5,
      note: "",
      instructions: "",
    },
  ]);

  const { data, isLoading } = usePrescriptions({
    page,
    limit,
    search: search || undefined,
  });

  const { data: examsData } = useExaminations({
    limit: 50,
  });

  const { data: medicinesData } = useMedicinesDropdown(100);

  const createMutation = useCreatePrescription();
  const deleteMutation = useDeletePrescription();

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        medicineId: "",
        quantity: 10,
        dosage: "1 viên/lần",
        frequency: "2 lần/ngày (sau ăn)",
        duration: "5 ngày",
        durationDays: 5,
        note: "",
        instructions: "",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof CreatePrescriptionItemDto,
    value: any,
  ) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleCreateSubmit = async () => {
    if (
      !selectedExamId ||
      items.some((item) => !item.medicineId || item.quantity <= 0)
    ) {
      return;
    }

    try {
      const created = await createMutation.mutateAsync({
        examinationId: selectedExamId,
        notes: notes || undefined,
        items,
      });

      setCreateDialogOpen(false);

      navigate(`/prescriptions/${created.id}`);
    } catch {
      // Handled by interceptor
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    try {
      await deleteMutation.mutateAsync(deleteId);
      setDeleteId(null);
    } catch {
      // Handled by interceptor
    }
  };

  const columns: Column<Prescription>[] = [
    {
      id: "id",
      label: "Mã đơn",
      minWidth: 80,
      render: (row) => (
        <Typography
          component="span"
          variant="body2"
          sx={{
            fontFamily: "monospace",
            color: "text.secondary",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          #{row.id.slice(0, 8)}
        </Typography>
      ),
    },

    {
      id: "patient",
      label: "Bệnh nhân",
      minWidth: 180,
      render: (row) => (
        <Stack spacing={0.25}>
          <Button
            variant="text"
            onClick={() => navigate(`/prescriptions/${row.id}`)}
            sx={{
              p: 0,
              minWidth: 0,
              justifyContent: "flex-start",
              textTransform: "none",
              fontWeight: 600,
              fontSize: 14,
              color: "primary.main",
              "&:hover": {
                backgroundColor: "transparent",
                textDecoration: "underline",
              },
            }}
          >
            {row.examination?.appointment?.patient?.fullName || "Bệnh nhân"}
          </Button>

          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontFamily: "monospace",
            }}
          >
            {row.examination?.appointment?.patient?.phone || "—"}
          </Typography>
        </Stack>
      ),
    },

    {
      id: "doctor",
      label: "Bác sĩ kê đơn",
      minWidth: 160,
      render: (row) => (
        <Typography
          variant="body2"
          sx={{
            color: "text.primary",
            fontWeight: 500,
          }}
        >
          {row.examination?.doctor?.user?.fullName || "Bác sĩ điều trị"}
        </Typography>
      ),
    },

    {
      id: "diagnosis",
      label: "Chẩn đoán xác định",
      minWidth: 200,
      render: (row) => (
        <Typography
          variant="body2"
          noWrap
          sx={{
            color: "text.primary",
            maxWidth: 240,
            fontSize: 13,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {row.examination?.diagnosis || "—"}
        </Typography>
      ),
    },

    {
      id: "itemCount",
      label: "Số vị thuốc",
      minWidth: 110,
      render: (row) => (
        <Chip
          size="small"
          label={`${row.items?.length || 0} loại thuốc`}
          sx={{
            fontWeight: 600,
            fontSize: 12,
            backgroundColor: "success.50",
            color: "success.700",
          }}
        />
      ),
    },

    {
      id: "createdAt",
      label: "Ngày kê đơn",
      minWidth: 130,
      render: (row) => (
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {dayjs(row.createdAt).format("HH:mm DD/MM/YYYY")}
        </Typography>
      ),
    },

    {
      id: "actions",
      label: "Thao tác",
      align: "right",
      minWidth: 120,
      render: (row) => (
        <Stack direction="row" spacing={0.5} className="flex justify-end">
          <Tooltip title="Xem & In đơn thuốc">
            <IconButton
              size="small"
              onClick={() => navigate(`/prescriptions/${row.id}`)}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  color: "primary.main",
                  backgroundColor: "primary.50",
                },
              }}
            >
              <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Xóa đơn thuốc">
            <IconButton
              size="small"
              onClick={() => setDeleteId(row.id)}
              sx={{
                color: "text.secondary",
                "&:hover": {
                  color: "error.main",
                  backgroundColor: "error.50",
                },
              }}
            >
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <PageHeader
        title="Danh sách Đơn thuốc"
        subtitle="Quản lý đơn thuốc ngoại trú, liều dùng và hướng dẫn sử dụng dược phẩm"
        breadcrumbs={[
          {
            label: "Trang chủ",
            href: "/dashboard",
          },
          {
            label: "Đơn thuốc",
          },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Kê đơn thuốc mới
          </Button>
        }
      />

      {/* Search */}
      <Box
        sx={{
          backgroundColor: "background.paper",
          p: 2,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <SearchInput
          placeholder="Tìm theo mã đơn hoặc chẩn đoán..."
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          className="w-full sm:w-80"
        />

        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          Tổng số:{" "}
          <Box
            component="strong"
            sx={{
              color: "text.primary",
              fontWeight: 700,
            }}
          >
            {data?.pagination?.total || 0}
          </Box>{" "}
          đơn thuốc
        </Typography>
      </Box>

      {/* Table */}
      <DataTable
        columns={columns}
        rows={data?.data || []}
        loading={isLoading}
        pagination={data?.pagination}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        emptyTitle="Chưa có đơn thuốc nào"
        emptyDescription="Tạo đơn thuốc liên kết với phiếu khám bệnh của bệnh nhân."
        emptyActionText="Kê đơn thuốc mới"
        onEmptyAction={() => setCreateDialogOpen(true)}
      />

      {/* Create Prescription Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: "text.primary",
          }}
        >
          Kê đơn thuốc cho bệnh nhân
        </DialogTitle>

        <Divider />

        <DialogContent
          sx={{
            pt: 2,
          }}
        >
          <Stack spacing={2.5}>
            {createMutation.isError && (
              <Alert severity="error">
                {(createMutation.error as any)?.response?.data?.message ||
                  "Có lỗi xảy ra khi tạo đơn thuốc. Lưu ý: Mỗi phiếu khám chỉ có 1 đơn thuốc duy nhất."}
              </Alert>
            )}

            {/* Examination */}
            <FormControl fullWidth size="small">
              <InputLabel id="exam-select-label">
                Phiếu khám bệnh liên kết *
              </InputLabel>

              <Select
                labelId="exam-select-label"
                value={selectedExamId}
                label="Phiếu khám bệnh liên kết *"
                onChange={(event) => setSelectedExamId(event.target.value)}
              >
                {examsData?.data?.map((exam) => (
                  <MenuItem key={exam.id} value={exam.id}>
                    {exam.appointment?.patient?.fullName || "Bệnh nhân"} — Chẩn
                    đoán: {exam.diagnosis || "Chưa có"} (
                    {dayjs(exam.createdAt).format("DD/MM")})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Notes */}
            <TextField
              label="Lời dặn chung / Ghi chú đơn thuốc"
              fullWidth
              size="small"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="VD: Kiêng đồ cay nóng, uống nhiều nước ấm, tái khám sau 5 ngày..."
            />

            {/* Medicine section */}
            <Box>
              <Stack
                direction="row"
                className="flex justify-between mb-2 items-center"
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "text.primary",
                  }}
                >
                  Danh mục thuốc kê ({items.length} loại)
                </Typography>

                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddItem}
                >
                  Thêm thuốc
                </Button>
              </Stack>

              <Stack spacing={1.5}>
                {items.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 2,
                      backgroundColor: "grey.50",
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Stack spacing={1.5}>
                      {/* Medicine header */}
                      <Stack
                        direction="row"
                        className="flex justify-between items-center"
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            color: "primary.dark",
                          }}
                        >
                          Thuốc #{idx + 1}
                        </Typography>

                        {items.length > 1 && (
                          <Tooltip title="Xóa thuốc">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveItem(idx)}
                            >
                              <RemoveCircleOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>

                      {/* Medicine fields */}
                      <Grid container spacing={1.5}>
                        <Grid
                          size={{
                            xs: 12,
                            sm: 8,
                          }}
                        >
                          <FormControl fullWidth size="small">
                            <InputLabel id={`med-select-${idx}`}>
                              Chọn biệt dược *
                            </InputLabel>

                            <Select
                              labelId={`med-select-${idx}`}
                              value={item.medicineId}
                              label="Chọn biệt dược *"
                              onChange={(event) =>
                                handleItemChange(
                                  idx,
                                  "medicineId",
                                  event.target.value,
                                )
                              }
                            >
                              {medicinesData?.data?.map(
                                (medicine: Medicine) => (
                                  <MenuItem
                                    key={medicine.id}
                                    value={medicine.id}
                                  >
                                    {medicine.name} ({medicine.unit})
                                  </MenuItem>
                                ),
                              )}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid
                          size={{
                            xs: 12,
                            sm: 4,
                          }}
                        >
                          <TextField
                            label="Số lượng *"
                            type="number"
                            size="small"
                            fullWidth
                            value={item.quantity}
                            onChange={(event) =>
                              handleItemChange(
                                idx,
                                "quantity",
                                Number(event.target.value),
                              )
                            }
                            slotProps={{
                              htmlInput: {
                                min: 1,
                              },
                            }}
                          />
                        </Grid>

                        <Grid
                          size={{
                            xs: 12,
                            sm: 4,
                          }}
                        >
                          <TextField
                            label="Liều dùng"
                            size="small"
                            fullWidth
                            value={item.dosage}
                            onChange={(event) =>
                              handleItemChange(
                                idx,
                                "dosage",
                                event.target.value,
                              )
                            }
                            placeholder="1 viên/lần"
                          />
                        </Grid>

                        <Grid
                          size={{
                            xs: 12,
                            sm: 4,
                          }}
                        >
                          <TextField
                            label="Tần suất dùng"
                            size="small"
                            fullWidth
                            value={item.frequency}
                            onChange={(event) =>
                              handleItemChange(
                                idx,
                                "frequency",
                                event.target.value,
                              )
                            }
                            placeholder="2 lần/ngày (sáng, tối)"
                          />
                        </Grid>

                        <Grid
                          size={{
                            xs: 12,
                            sm: 4,
                          }}
                        >
                          <TextField
                            label="Số ngày dùng"
                            type="number"
                            size="small"
                            fullWidth
                            value={item.durationDays || 5}
                            onChange={(event) => {
                              const days = Number(event.target.value);

                              handleItemChange(idx, "durationDays", days);

                              handleItemChange(idx, "duration", `${days} ngày`);
                            }}
                            slotProps={{
                              htmlInput: {
                                min: 1,
                              },
                            }}
                            placeholder="5"
                          />
                        </Grid>

                        <Grid
                          size={{
                            xs: 12,
                          }}
                        >
                          <TextField
                            label="Hướng dẫn uống chi tiết"
                            size="small"
                            fullWidth
                            value={item.instructions || ""}
                            onChange={(event) => {
                              handleItemChange(
                                idx,
                                "instructions",
                                event.target.value,
                              );

                              handleItemChange(idx, "note", event.target.value);
                            }}
                            placeholder="Uống sau bữa ăn 30 phút với nhiều nước..."
                          />
                        </Grid>
                      </Grid>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
          }}
        >
          <Button onClick={() => setCreateDialogOpen(false)} color="inherit">
            Hủy
          </Button>

          <Button
            onClick={handleCreateSubmit}
            variant="contained"
            disabled={!selectedExamId || createMutation.isPending}
          >
            {createMutation.isPending
              ? "Đang lưu..."
              : "Xác nhận tạo đơn thuốc"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Xóa đơn thuốc?"
        content="Bạn có chắc muốn xóa đơn thuốc này? Thao tác không thể hoàn tác."
        confirmText="Xóa đơn thuốc"
        confirmColor="error"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteId(null)}
      />
    </Box>
  );
};
