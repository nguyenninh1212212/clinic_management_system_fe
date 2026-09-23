// src/features/examinations/pages/ExaminationListPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { SearchInput } from '@/components/common/SearchInput';
import { useExaminations } from '../hooks/useExaminations';
import { Examination } from '@/types';
import dayjs from 'dayjs';

export const ExaminationListPage: React.FC = () => {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useExaminations({
    page,
    limit,
    search: search || undefined,
  });

  const columns: Column<Examination>[] = [
    {
      id: 'stt',
      label: 'STT',
      minWidth: 50,
      render: (_row, idx) => (
        <span className="text-slate-400 tabular-nums">
          {(page - 1) * limit + idx + 1}
        </span>
      ),
    },
    {
      id: 'patient',
      label: 'Bệnh nhân',
      minWidth: 180,
      render: (row) => (
        <div>
          <button
            onClick={() => navigate(`/examinations/${row.id}`)}
            className="font-semibold text-sky-700 hover:underline text-left text-sm"
          >
            {row.appointment?.patient?.fullName || 'Bệnh nhân'}
          </button>
          <span className="text-xs text-slate-400 font-mono">
            {row.appointment?.patient?.phone}
          </span>
        </div>
      ),
    },
    {
      id: 'doctor',
      label: 'Bác sĩ khám',
      minWidth: 160,
      render: (row) => (
        <span className="text-slate-700 font-medium">
          {row.doctor?.user?.fullName || 'Bác sĩ'}
        </span>
      ),
    },
    {
      id: 'diagnosis',
      label: 'Chẩn đoán xác định',
      minWidth: 220,
      render: (row) => (
        <div>
          <div className="font-semibold text-slate-800 text-xs line-clamp-1">{row.diagnosis}</div>
          {row.icd10Code && (
            <span className="text-[10px] font-mono bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded">
              ICD-10: {row.icd10Code}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'followUpDate',
      label: 'Hẹn tái khám',
      minWidth: 120,
      render: (row) => (
        <span className="text-xs tabular-nums text-slate-600">
          {row.followUpDate ? dayjs(row.followUpDate).format('DD/MM/YYYY') : '—'}
        </span>
      ),
    },
    {
      id: 'prescription',
      label: 'Đơn thuốc',
      minWidth: 130,
      render: (row) => {
        if (row.prescription) {
          return (
            <button
              onClick={() => navigate(`/prescriptions/${row.prescription?.id}`)}
              className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <ReceiptLongIcon fontSize="inherit" />
              <span>Đã kê ({row.prescription.items?.length || 0} thuốc)</span>
            </button>
          );
        }
        return (
          <button
            onClick={() => navigate(`/prescriptions?examinationId=${row.id}`)}
            className="text-xs font-medium text-slate-400 hover:text-sky-700"
          >
            + Kê đơn
          </button>
        );
      },
    },
    {
      id: 'createdAt',
      label: 'Ngày khám',
      minWidth: 120,
      render: (row) => (
        <span className="text-xs tabular-nums text-slate-500">
          {dayjs(row.createdAt).format('DD/MM/YYYY')}
        </span>
      ),
    },
    {
      id: 'actions',
      label: 'Thao tác',
      align: 'right',
      minWidth: 100,
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip title="Xem chi tiết phiếu khám">
            <IconButton
              size="small"
              onClick={() => navigate(`/examinations/${row.id}`)}
              className="text-slate-500 hover:text-sky-600"
            >
              <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Danh sách Phiếu Khám bệnh"
        subtitle="Hồ sơ bệnh án điện tử, chẩn đoán ICD-10 và phác đồ điều trị"
        breadcrumbs={[{ label: 'Trang chủ', href: '/dashboard' }, { label: 'Phiếu khám bệnh' }]}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/examinations/new')}
          >
            Lập phiếu khám mới
          </Button>
        }
      />

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
        <SearchInput
          placeholder="Tìm chẩn đoán, mã ICD-10 hoặc mã phiếu..."
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          className="w-full sm:w-80"
        />
        <div className="text-xs text-slate-500 tabular-nums">
          Tổng số: <strong className="text-slate-800">{data?.pagination?.total || 0}</strong> phiếu khám
        </div>
      </div>

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
        emptyTitle="Chưa có phiếu khám bệnh nào"
        emptyDescription="Phiếu khám bệnh được tạo khi bác sĩ tiến hành khám lâm sàng cho bệnh nhân."
        emptyActionText="Lập phiếu khám mới"
        onEmptyAction={() => navigate('/examinations/new')}
      />
    </div>
  );
};
