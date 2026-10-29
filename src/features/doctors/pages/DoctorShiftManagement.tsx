import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Column, DataTable } from "@/components/common/DataTable";
import { PageHeader } from "@/components/common/PageHeader";
import { useSpecialtiesDropdown } from "@/features/specialties/hooks/useSpecialties";
import { useListFilters } from "@/hooks/useListFilters";
import { Doctor, DoctorDegree, DoctorQueryParams, DoctorShift } from "@/types";
import { Alert, Avatar, FormControlLabel, Radio } from "@mui/material";
import dayjs from "dayjs";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DoctorShiftForm } from "../components/DoctorShiftForm";
import { DoctorShiftList } from "../components/DoctorShiftList";
import { useDoctor, useDoctors } from "../hooks/useDoctors";
import {
  useCreateDoctorShift,
  useDeleteDoctorShift,
  useDoctorShifts,
} from "../hooks/useDoctorShifts";

export const DoctorShiftManagement: React.FC = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const { filters, replaceFilters } =
    useListFilters<Omit<DoctorQueryParams, "page" | "limit">>();
  const getDegreeLabel = (d?: DoctorDegree) => {
    switch (d) {
      case DoctorDegree.MD:
        return "Bác sĩ Đa khoa (MD)";
      case DoctorDegree.MASTER:
        return "Thạc sĩ Y khoa";
      case DoctorDegree.PHD:
        return "Tiến sĩ Y khoa";
      case DoctorDegree.PROFESSOR:
        return "Giáo sư";
      case DoctorDegree.ASSOCIATE_PROFESSOR:
        return "Phó Giáo sư";
      default:
        return d || "—";
    }
  };
  const { data, isLoading } = useDoctors({
    page,
    limit,
    ...filters,
  });

  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [deleteShift, setDeleteShift] = useState<DoctorShift | null>(null);
  const { data: selectedDoctorData, isError: doctorsError } =
    useDoctor(doctorId);
  const { data: specialties } = useSpecialtiesDropdown();
  const {
    data: shifts = [],
    isLoading: loadingShifts,
    isError: shiftsError,
  } = useDoctorShifts(doctorId, date);
  const createMutation = useCreateDoctorShift();
  const deleteMutation = useDeleteDoctorShift();
  const selectedDoctor = selectedDoctorData?.data;

  const createShift = async (values: {
    workDate: string;
    startTime: string;
    endTime: string;
  }) => {
    try {
      await createMutation.mutateAsync({ doctorId, dto: values });
    } catch {
      /* interceptor handles backend feedback */
    }
  };
  const deleteShiftConfirmed = async () => {
    if (!deleteShift) return;
    try {
      await deleteMutation.mutateAsync(deleteShift.id);
      setDeleteShift(null);
    } catch {
      /* interceptor handles backend feedback */
    }
  };
  const columns: Column<Doctor>[] = [
    {
      id: "avatar",
      label: "Ảnh",
      minWidth: 60,
      render: (row) => (
        <Avatar
          src={row.user?.avatar}
          sx={{ width: 34, height: 34, bgcolor: "#0284c7" }}
          className="text-xs font-semibold"
        >
          {row.user?.fullName?.charAt(0) || "D"}
        </Avatar>
      ),
    },
    {
      id: "fullName",
      label: "Bác sĩ",
      filterFields: [
        { key: "search", label: "Tìm bác sĩ", type: "input" },
        { key: "isActive", label: "Đang hoạt động", type: "boolean" },
      ],
      minWidth: 180,
      render: (row) => (
        <div>
          <button
            onClick={() => navigate(`/doctors/${row.id}`)}
            className="font-semibold text-sky-700 hover:underline text-left text-sm"
          >
            {row.user?.fullName || "Bác sĩ"}
          </button>
          <div className="text-xs text-slate-400">{row.user?.email}</div>
        </div>
      ),
    },
    {
      id: "specialty",
      label: "Chuyên khoa",
      filterFields: [
        {
          key: "specialtyId",
          label: "Chuyên khoa",
          type: "select",
          filters: (specialties || []).map((specialty) => ({
            text: specialty.name,
            value: specialty.id,
          })),
        },
      ],
      minWidth: 140,
      render: (row) => (
        <span className="font-medium text-slate-700">
          {row.specialty?.name || "Chưa phân chuyên khoa"}
        </span>
      ),
    },
    {
      id: "degree",
      label: "Học vị / Học hàm",
      filterFields: [
        {
          key: "degree",
          label: "Học vị",
          type: "select",
          filters: Object.values(DoctorDegree).map((value) => ({
            text: value,
            value,
          })),
        },
      ],
      minWidth: 160,
      render: (row) => (
        <span className="text-xs text-sky-800 font-medium bg-sky-50 px-2 py-0.5 rounded">
          {getDegreeLabel(row.degree)}
        </span>
      ),
    },
    {
      id: "licenseNumber",
      label: "Số CCHN",
      filterFields: [
        { key: "licenseNumber", label: "Số giấy phép", type: "input" },
      ],
      minWidth: 130,
      render: (row) => (
        <span className="font-mono text-xs tabular-nums text-slate-600 font-medium">
          {row.licenseNumber}
        </span>
      ),
    },
    {
      id: "yearsOfExperience",
      label: "Kinh nghiệm",
      filterFields: [
        {
          key: "yearsOfExperience",
          label: "Số năm kinh nghiệm",
          type: "number",
        },
      ],
      minWidth: 120,
      render: (row) => (
        <span className="tabular-nums text-xs text-slate-700 font-medium">
          {row.yearsOfExperience
            ? `${row.yearsOfExperience} năm`
            : "Chưa cập nhật"}
        </span>
      ),
    },
    {
      id: "actions",
      label: "Thao tác",
      align: "right",
      minWidth: 120,
      render: (row) => {
        const isSelected = doctorId === row.id;

        return (
          <div className="flex items-center justify-center gap-1 ">
            <FormControlLabel
              control={
                <Radio
                  checked={isSelected}
                  onClick={() => {
                    if (isSelected) {
                      setDoctorId("");
                    }
                  }}
                  onChange={() => {
                    setDoctorId(row.id);
                  }}
                  value={row.id}
                />
              }
              label={isSelected}
            />
          </div>
        );
      },
    },
  ];
  return (
    <div className="space-y-4">
      <PageHeader
        title="Phân công ca bác sĩ"
        subtitle="Quản lý ca làm việc và thời gian tiếp nhận lịch khám của từng bác sĩ"
        breadcrumbs={[
          { label: "Trang chủ", href: "/dashboard" },
          { label: "Bác sĩ", href: "/doctors" },
          { label: "Phân công ca" },
        ]}
      />
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
        emptyTitle="Chưa có bác sĩ nào phù hợp"
        emptyDescription="Thử bỏ lọc hoặc thêm hồ sơ bác sĩ mới vào hệ thống."
        onEmptyAction={() => navigate("/doctors/new")}
      />

      {(doctorsError || shiftsError) && (
        <Alert severity="error">
          Không thể tải dữ liệu ca làm. Vui lòng thử lại.
        </Alert>
      )}
      {doctorId && (
        <DoctorShiftForm
          doctorId={doctorId}
          setDate={setDate}
          defaultDate={date}
          existingShifts={shifts}
          isSaving={createMutation.isPending}
          onSubmit={createShift}
        />
      )}
      {!doctorId ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-slate-500">
          Chọn bác sĩ để xem và phân công ca.
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold ">
              Ca làm của {selectedDoctor?.user?.fullName || "bác sĩ"}
            </h2>
            <span className="text-xs text-slate-500">{date}</span>
          </div>
          <DoctorShiftList
            shifts={shifts}
            loading={loadingShifts}
            onDelete={setDeleteShift}
          />
        </>
      )}
      <ConfirmDialog
        open={Boolean(deleteShift)}
        title="Xóa ca làm?"
        content={`Bạn có chắc muốn xóa ca ${deleteShift?.startTime} - ${deleteShift?.endTime} ngày ${deleteShift?.workDate}?`}
        confirmText="Xóa ca"
        isLoading={deleteMutation.isPending}
        onConfirm={deleteShiftConfirmed}
        onClose={() => setDeleteShift(null)}
      />
    </div>
  );
};
