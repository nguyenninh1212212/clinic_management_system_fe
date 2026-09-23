// src/features/triage/pages/TriageListPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { StatusChip } from '@/components/common/StatusChip';
import { useQuery } from '@tanstack/react-query';
import { triageResultsApi } from '@/api/endpoints/triage-results.api';
import { queryKeys } from '@/api/queryKeys';
import { TriageResult, TriageLevel } from '@/types';
import dayjs from 'dayjs';

export const TriageListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [triageLevel, setTriageLevel] = useState<TriageLevel | ''>('');

  const [selectedTriage, setSelectedTriage] = useState<TriageResult | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.triageResults.list({ page, limit }),
    queryFn: () => triageResultsApi.findAll({ page, limit }),
    staleTime: 30_000,
  });

  // Client filter by triage level if selected
  const filteredRows = triageLevel
    ? (data?.data || []).filter((r) => r.triageLevel === triageLevel)
    : data?.data || [];

  const columns: Column<TriageResult>[] = [
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
      id: 'appointmentId',
      label: 'Mã cuộc hẹn',
      minWidth: 160,
      render: (row) => (
        <div>
          <button
            onClick={() => navigate(`/appointments/${row.appointmentId}`)}
            className="font-semibold text-sky-700 hover:underline text-left block text-xs font-mono"
          >
            #{row.appointmentId.slice(0, 13)}
          </button>
          <span className="text-[11px] text-slate-400">Xem hồ sơ tiếp đón →</span>
        </div>
      ),
    },
    {
      id: 'triageLevel',
      label: 'Phân loại cấp cứu',
      minWidth: 160,
      render: (row) => <StatusChip status={row.triageLevel} type="triage" />,
    },
    {
      id: 'vitals',
      label: 'Chỉ số sinh hiệu',
      minWidth: 240,
      render: (row) => (
        <div className="flex flex-wrap gap-2 text-xs font-mono tabular-nums">
          {row.bloodPressure && (
            <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
              HA: {row.bloodPressure}
            </span>
          )}
          {row.heartRate && (
            <span className="bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded">
              Mạch: {row.heartRate}
            </span>
          )}
          {row.spo2 && (
            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
              SpO2: {row.spo2}%
            </span>
          )}
          {row.temperature && (
            <span className="bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded">
              T: {row.temperature}°C
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'chiefComplaint',
      label: 'Lý do vào viện',
      minWidth: 180,
      render: (row) => (
        <span className="text-slate-600 text-xs line-clamp-1">
          {row.chiefComplaint || '—'}
        </span>
      ),
    },
    {
      id: 'createdAt',
      label: 'Thời gian đo',
      minWidth: 130,
      render: (row) => (
        <span className="text-slate-500 text-xs tabular-nums">
          {dayjs(row.createdAt).format('HH:mm DD/MM/YYYY')}
        </span>
      ),
    },
    {
      id: 'actions',
      label: 'Chi tiết',
      align: 'right',
      minWidth: 100,
      render: (row) => (
        <Button
          size="small"
          onClick={() => setSelectedTriage(row)}
          className="text-xs text-sky-700 font-semibold"
        >
          Xem sinh hiệu
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Phân loại Cấp cứu & Sinh hiệu (Triage)"
        subtitle="Hệ thống sàng lọc và đánh giá mức độ ưu tiên cấp cứu bệnh nhân tại phòng khám"
        breadcrumbs={[{ label: 'Trang chủ', href: '/dashboard' }, { label: 'Phân loại cấp cứu' }]}
      />

      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <FormControl size="small" className="sm:w-80">
          <InputLabel id="triage-filter-label">Mức độ ưu tiên cấp cứu</InputLabel>
          <Select
            labelId="triage-filter-label"
            value={triageLevel}
            label="Mức độ ưu tiên cấp cứu"
            onChange={(e) => {
              setTriageLevel(e.target.value as TriageLevel | '');
            }}
          >
            <MenuItem value="">Tất cả các mức độ</MenuItem>
            <MenuItem value={TriageLevel.LEVEL_1}>Cấp 1 - Nguy kịch (Đỏ)</MenuItem>
            <MenuItem value={TriageLevel.LEVEL_2}>Cấp 2 - Nặng (Cam)</MenuItem>
            <MenuItem value={TriageLevel.LEVEL_3}>Cấp 3 - Trung bình (Vàng)</MenuItem>
            <MenuItem value={TriageLevel.LEVEL_4}>Cấp 4 - Nhẹ (Xanh lá)</MenuItem>
            <MenuItem value={TriageLevel.LEVEL_5}>Cấp 5 - Không khẩn cấp (Xanh lam)</MenuItem>
          </Select>
        </FormControl>

        <div className="text-xs text-slate-500 tabular-nums">
          Tổng số: <strong className="text-slate-800">{data?.pagination?.total || 0}</strong> lượt phân loại
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filteredRows}
        loading={isLoading}
        pagination={data?.pagination}
        onPageChange={(p) => setPage(p)}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        emptyTitle="Chưa có kết quả phân loại nào"
        emptyDescription="Kết quả phân loại được ghi nhận trong quy trình tiếp đón lịch hẹn khám."
      />

      {/* Triage Detail Dialog */}
      <Dialog
        open={Boolean(selectedTriage)}
        onClose={() => setSelectedTriage(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="font-bold text-slate-900 flex items-center justify-between">
          <span>Chi tiết Kết quả Phân loại</span>
          {selectedTriage && (
            <StatusChip status={selectedTriage.triageLevel} type="triage" />
          )}
        </DialogTitle>
        <DialogContent className="space-y-4 pt-2">
          {selectedTriage && (
            <>
              <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                <div>
                  Mã hẹn: <span className="font-mono">{selectedTriage.appointmentId}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Huyết áp</div>
                  <div className="font-bold text-slate-800 mt-0.5 font-mono">
                    {selectedTriage.bloodPressure || '—'}
                  </div>
                  <div className="text-[10px] text-slate-400">mmHg</div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Nhịp tim</div>
                  <div className="font-bold text-slate-800 mt-0.5 tabular-nums">
                    {selectedTriage.heartRate ?? '—'}
                  </div>
                  <div className="text-[10px] text-slate-400">nhịp/phút</div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Thân nhiệt</div>
                  <div className="font-bold text-slate-800 mt-0.5 tabular-nums">
                    {selectedTriage.temperature ? `${selectedTriage.temperature}°C` : '—'}
                  </div>
                  <div className="text-[10px] text-slate-400">Thân nhiệt</div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">SpO2</div>
                  <div className="font-bold text-slate-800 mt-0.5 tabular-nums">
                    {selectedTriage.spo2 ? `${selectedTriage.spo2}%` : '—'}
                  </div>
                  <div className="text-[10px] text-slate-400">O2 bão hòa</div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Cân nặng</div>
                  <div className="font-bold text-slate-800 mt-0.5 tabular-nums">
                    {selectedTriage.weight ? `${selectedTriage.weight} kg` : '—'}
                  </div>
                  <div className="text-[10px] text-slate-400">Khối lượng</div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Chiều cao</div>
                  <div className="font-bold text-slate-800 mt-0.5 tabular-nums">
                    {selectedTriage.height ? `${selectedTriage.height} cm` : '—'}
                  </div>
                  <div className="text-[10px] text-slate-400">Chiều cao</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-slate-400">Lý do vào viện (Chief Complaint)</div>
                <div className="text-sm font-medium text-slate-800 mt-0.5">
                  {selectedTriage.chiefComplaint || 'Không có ghi nhận'}
                </div>
              </div>

              {selectedTriage.notes && (
                <div>
                  <div className="text-xs text-slate-400">Ghi chú điều dưỡng</div>
                  <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg mt-0.5">
                    {selectedTriage.notes}
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions className="px-6 pb-4">
          <Button onClick={() => setSelectedTriage(null)} color="inherit">
            Đóng
          </Button>
          {selectedTriage && (
            <Button
              variant="contained"
              onClick={() => {
                navigate(`/appointments/${selectedTriage.appointmentId}`);
              }}
            >
              Xem cuộc hẹn
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};
