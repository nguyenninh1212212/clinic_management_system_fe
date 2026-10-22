// src/features/medicines/pages/MedicineListPage.tsx
import React, { useRef, useState } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, Column } from "@/components/common/DataTable";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useListFilters } from "@/hooks/useListFilters";
import { notifyApiFeedback } from "@/api/axios";
import { medicinesApi } from "@/api/endpoints/medicines.api";
import { queryKeys } from "@/api/queryKeys";
import {
  useMedicines,
  useCreateMedicine,
  useUpdateMedicine,
  useDeleteMedicine,
} from "../hooks/useMedicines";
import {
  Medicine,
  MedicineCategory,
  CreateMedicineDto,
  MedicineQueryParams,
} from "@/types";
import * as XLSX from "xlsx";
import { AxiosError } from "axios";

const createInitialMedicine = (): Medicine => ({
  id: "",
  name: "",
  genericName: "",
  unit: "",
  category: MedicineCategory.OTHER, // Thay bằng enum thực tế
  description: "",
  minStockLevel: 0,
  manufacturer: "",
  registrationNumber: "",
  sellingPrice: 0,
  createdAt: "",
  updatedAt: "",
});

export const MedicineListPage: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { filters, replaceFilters } =
    useListFilters<Omit<MedicineQueryParams, "page" | "limit">>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);

  const [medCategory, setMedCategory] = useState<MedicineCategory>(
    MedicineCategory.ANTIBIOTIC,
  );

  const [payload, setPayload] = useState<Medicine>(createInitialMedicine);
  const {
    name,
    unit,
    description,
    genericName,
    manufacturer,
    minStockLevel,
    registrationNumber,
    sellingPrice,
  } = payload;
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState("");

  const { data, isLoading } = useMedicines({
    page,
    limit,
    ...filters,
  });

  const createMutation = useCreateMedicine();
  const updateMutation = useUpdateMedicine();
  const deleteMutation = useDeleteMedicine();

  const handleOpenCreate = () => {
    setEditingMedicine(null);
    setPayload(createInitialMedicine());
    setMedCategory(MedicineCategory.OTHER);
    setDialogOpen(true);
  };

  const handleOpenEdit = (m: Medicine) => {
    setPayload(m);
    setEditingMedicine(m);
    setMedCategory(m.category);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (payload) {
        const dto: CreateMedicineDto = {
          name: payload.name,
          genericName: payload.genericName,
          unit: payload.unit,
          category: payload.category,
          description: payload.description,
          minStockLevel: payload.minStockLevel,
          manufacturer: payload.manufacturer,
          registrationNumber: payload.registrationNumber,
          sellingPrice: payload.sellingPrice ?? 0,
        };
        if (editingMedicine) {
          await updateMutation.mutateAsync({
            id: editingMedicine.id,
            dto,
          });
        } else {
          await createMutation.mutateAsync(dto);
        }
        setDialogOpen(false);
      }
    } catch (err: any) {
      const axiosError = err as AxiosError<{
        message?: string;
        error?: string;
        statusCode?: number;
      }>;
      notifyApiFeedback(
        axiosError?.response?.data.message || "Cập nhật kho thất bại",
        "error",
      );
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
  const handleDownloadTemplate = () => {
    const rows = [
      [
        "name",
        "genericName",
        "unit",
        "category",
        "description",
        "minStockLevel",
        "manufacturer",
        "registrationNumber",
      ],
      [
        "Paracetamol 500mg",
        "Paracetamol",
        "Viên",
        "ANTIBIOTIC",
        "Bảo quản nơi khô ráo",
        100,
        "DHG Pharma",
        "VD-12345",
      ],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Medicines");

    XLSX.writeFile(workbook, "medicine_import_template.xlsx");
  };

  const handleImportExcel = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await medicinesApi.importFromExcel(file);
      // Import returns a count only, so reload rows instead of trying to patch an incomplete response.
      void queryClient.refetchQueries({
        queryKey: queryKeys.medicines.lists(),
        type: "all",
      });
      notifyApiFeedback("Import thuốc từ Excel thành công", "info");
      setPage(1);
    } catch {
      // Handled by interceptor
    } finally {
      event.target.value = "";
    }
  };
  const updateField = <K extends keyof Medicine>(
    field: K,
    value: Medicine[K],
  ) => {
    setPayload((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const columns: Column<Medicine>[] = [
    {
      id: "name",
      label: "Tên biệt dược / Hoạt chất",
      filterFields: [
        { key: "search", label: "Tìm thuốc", type: "input" },
        { key: "genericName", label: "Tên hoạt chất", type: "input" },
        { key: "isActive", label: "Đang kinh doanh", type: "boolean" },
      ],
      minWidth: 220,
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
            {row.name}
            {row.isLowStock && (
              <Tooltip title="Cảnh báo tồn kho dưới mức an toàn">
                <WarningAmberIcon fontSize="small" className="text-amber-500" />
              </Tooltip>
            )}
          </div>
          {row.genericName && (
            <div className="text-xs text-slate-500 font-mono italic">
              Hoạt chất: {row.genericName}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "category",
      label: "Nhóm thuốc",
      filterFields: [
        {
          key: "category",
          label: "Nhóm thuốc",
          type: "select",
          filters: Object.values(MedicineCategory).map((value) => ({
            text: value,
            value,
          })),
        },
      ],
      minWidth: 150,
      render: (row) => (
        <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
          {row.category}
        </span>
      ),
    },
    {
      id: "unit",
      label: "Đơn vị tính",
      filterFields: [{ key: "unit", label: "Đơn vị tính", type: "input" }],
      minWidth: 100,
      render: (row) => (
        <span className="text-xs text-slate-700">{row.unit}</span>
      ),
    },
    {
      id: "sellingPrice",
      label: "Giá bán",
      minWidth: 100,
      render: (row) => (
        <span className="text-xs text-slate-700">{row.sellingPrice}</span>
      ),
    },
    {
      id: "manufacturer",
      label: "Hãng sản xuất / SĐK",
      filterFields: [
        { key: "manufacturer", label: "Hãng sản xuất", type: "input" },
        { key: "registrationNumber", label: "Số đăng ký", type: "input" },
      ],
      minWidth: 180,
      render: (row) => (
        <div className="text-xs">
          <div className="text-slate-800">{row.manufacturer || "—"}</div>
          {row.registrationNumber && (
            <div className="text-slate-400 font-mono">
              SĐK: {row.registrationNumber}
            </div>
          )}
        </div>
      ),
    },
    {
      id: "actions",
      label: "Thao tác",
      align: "right",
      minWidth: 110,
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip title="Chỉnh sửa thông tin thuốc">
            <IconButton
              size="small"
              onClick={() => handleOpenEdit(row)}
              className="text-slate-500 hover:text-amber-600"
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Xóa thuốc">
            <IconButton
              size="small"
              onClick={() => {
                setDeleteId(row.id);
                setDeleteName(row.name);
              }}
              className="text-slate-500 hover:text-rose-600"
            >
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Danh mục Thuốc & Dược phẩm"
        subtitle="Quản lý danh bạ biệt dược, hoạt chất, mức dự trữ an toàn và đơn vị tính"
        breadcrumbs={[
          { label: "Trang chủ", href: "/dashboard" },
          { label: "Danh mục Thuốc" },
        ]}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outlined"
              startIcon={<DownloadOutlinedIcon />}
              onClick={handleDownloadTemplate}
            >
              Mẫu Excel
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<UploadFileOutlinedIcon />}
              onClick={() => fileInputRef.current?.click()}
            >
              Import Excel
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
            >
              Thêm thuốc mới
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleImportExcel}
            />
          </div>
        }
      />

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="text-xs text-slate-500 tabular-nums">
          Tổng cộng:{" "}
          <strong className="text-slate-800">
            {data?.pagination?.total || 0}
          </strong>{" "}
          loại thuốc
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={data?.data || []}
        loading={isLoading}
        pagination={data?.pagination}
        filters={filters}
        onFilterChange={(nextFilters) => {
          replaceFilters(nextFilters);
          setPage(1);
        }}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        emptyTitle="Chưa có thuốc nào trong danh mục"
        emptyDescription="Thêm danh mục thuốc để phục vụ kê đơn và quản lý kho dược."
        emptyActionText="Thêm thuốc đầu tiên"
        onEmptyAction={handleOpenCreate}
      />

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle className="font-bold text-slate-900">
          {editingMedicine
            ? "Chỉnh sửa thông tin thuốc"
            : "Thêm mới thuốc vào danh mục"}
        </DialogTitle>
        <DialogContent className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="Tên biệt dược *"
              fullWidth
              size="small"
              value={name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="VD: Paracetamol 500mg, Augmentin 1g..."
            />

            <TextField
              label="Hoạt chất / Tên chung quốc tế"
              fullWidth
              size="small"
              value={genericName}
              onChange={(e) => updateField("genericName", e.target.value)}
              placeholder="VD: Amoxicillin + Clavulanic acid"
            />

            <FormControl fullWidth size="small">
              <InputLabel id="dialog-cat-label">Nhóm thuốc *</InputLabel>
              <Select
                labelId="dialog-cat-label"
                value={medCategory}
                label="Nhóm thuốc *"
                onChange={(e) => updateField("category", e.target.value)}
              >
                {Object.values(MedicineCategory).map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Đơn vị tính *"
              fullWidth
              size="small"
              value={payload.unit}
              onChange={(e) => updateField("unit", e.target.value)}
              placeholder="Viên, Vỉ, Hộp, Chai, Ống..."
            />

            <TextField
              label="Mức tồn kho an toàn tối thiểu"
              type="number"
              fullWidth
              size="small"
              value={minStockLevel}
              onChange={(e) =>
                updateField("minStockLevel", parseInt(e.target.value))
              }
            />

            <TextField
              label="Giá bán"
              type="number"
              fullWidth
              size="small"
              value={sellingPrice}
              onChange={(e) =>
                updateField("sellingPrice", parseInt(e.target.value))
              }
            />

            <TextField
              label="Số đăng ký lưu hành (SĐK)"
              fullWidth
              size="small"
              value={registrationNumber}
              onChange={(e) =>
                updateField("registrationNumber", e.target.value)
              }
              placeholder="VD: VD-21543-14"
            />

            <div className="sm:col-span-2">
              <TextField
                label="Hãng sản xuất / Quốc gia"
                fullWidth
                size="small"
                value={manufacturer}
                onChange={(e) => updateField("manufacturer", e.target.value)}
                placeholder="VD: Dược Hậu Giang (DHG Pharma) - Việt Nam"
              />
            </div>

            <div className="sm:col-span-2">
              <TextField
                label="Mô tả / Hướng dẫn bảo quản"
                fullWidth
                multiline
                rows={3}
                size="small"
                value={description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Bảo quản nơi khô ráo dưới 30°C, tránh ánh sáng trực tiếp..."
              />
            </div>
          </div>
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !name.trim() ||
              !unit.trim() ||
              createMutation.isPending ||
              updateMutation.isPending
            }
          >
            {createMutation.isPending || updateMutation.isPending
              ? "Đang lưu..."
              : "Lưu thông tin"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deleteId !== null}
        title="Xóa thuốc khỏi danh mục?"
        content={`Bạn có chắc muốn xóa "${deleteName}"? Thao tác có thể ảnh hưởng đến các đơn thuốc đã kê.`}
        confirmText="Xóa thuốc"
        confirmColor="error"
        isLoading={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
};
