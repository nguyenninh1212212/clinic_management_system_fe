import React, { useEffect, useState } from 'react';
import { Alert, Button, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, Column } from '@/components/common/DataTable';
import { SearchInput } from '@/components/common/SearchInput';
import { Invoice } from '@/types';
import { invoicesApi } from '@/api/endpoints/invoices.api';
import { useInvoices } from '../hooks/useInvoices';
import { ImportInvoiceModal } from '../components/ImportInvoiceModal';

const money = (value?: number) => `${Number(value || 0).toLocaleString('vi-VN')} ₫`;

export const InvoiceListPage: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [importOpen, setImportOpen] = useState(false);
  const { data, isLoading, isError, error } = useInvoices({ page, limit, search: debouncedSearch || undefined });

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [search]);

  const download = async (id?: string) => {
    const response = await invoicesApi.export(id);
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = id ? `invoice-${id}.xlsx` : `invoices-${Date.now()}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const columns: Column<Invoice>[] = [
    { id: 'invoiceNumber', label: 'Mã hóa đơn', minWidth: 150, render: (row) => <span className="font-mono text-xs font-bold text-sky-700">{row.invoiceNumber || `#${row.id.slice(0, 8)}`}</span> },
    { id: 'buyerName', label: 'Người mua', minWidth: 180, render: (row) => <span className="font-semibold text-slate-800">{row.buyerName}</span> },
    { id: 'buyerPhone', label: 'Số điện thoại', minWidth: 130, render: (row) => <span className="font-mono text-xs text-slate-600">{row.buyerPhone || '—'}</span> },
    { id: 'totalAmount', label: 'Tổng tiền', align: 'right', minWidth: 140, render: (row) => <span className="font-bold tabular-nums text-slate-900">{money(row.totalAmount)}</span> },
    { id: 'items', label: 'Số dòng hàng', align: 'center', minWidth: 110, render: (row) => <span className="text-xs font-semibold text-slate-600">{row.items?.length || 0}</span> },
    { id: 'createdAt', label: 'Ngày tạo', minWidth: 140, render: (row) => <span className="text-xs tabular-nums text-slate-500">{dayjs(row.createdAt).format('HH:mm DD/MM/YYYY')}</span> },
    { id: 'actions', label: 'Thao tác', align: 'right', minWidth: 110, render: (row) => <div className="flex justify-end gap-1"><Tooltip title="Xem chi tiết"><IconButton size="small" onClick={() => navigate(`/invoices/${row.id}`)} className="text-slate-500 hover:text-sky-600"><VisibilityOutlinedIcon fontSize="small" /></IconButton></Tooltip><Tooltip title="Xuất Excel"><IconButton size="small" onClick={() => download(row.id)} className="text-slate-500 hover:text-emerald-600"><DownloadOutlinedIcon fontSize="small" /></IconButton></Tooltip></div> },
  ];

  return <div className="space-y-4">
    <PageHeader title="Quản lý Hóa đơn" subtitle="Tạo, tra cứu và xuất hóa đơn thanh toán tại phòng khám" breadcrumbs={[{ label: 'Trang chủ', href: '/dashboard' }, { label: 'Hóa đơn' }]} action={<div className="flex flex-wrap gap-2"><Button variant="outlined" startIcon={<UploadFileOutlinedIcon />} onClick={() => setImportOpen(true)}>Import Excel</Button><Button variant="outlined" startIcon={<DownloadOutlinedIcon />} onClick={() => download()}>Export Excel</Button><Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/invoices/new')}>Tạo hóa đơn</Button></div>} />
    <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"><SearchInput placeholder="Tìm theo mã hóa đơn hoặc tên người mua..." value={search} onChange={(value) => { setSearch(value); setPage(1); }} className="w-full sm:w-96" /><div className="text-xs text-slate-500 tabular-nums">Tổng số: <strong className="text-slate-800">{data?.pagination?.total || 0}</strong> hóa đơn</div></div>
    {isError && <Alert severity="error">{(error as any)?.response?.data?.message || 'Không thể tải danh sách hóa đơn.'}</Alert>}
    <DataTable columns={columns} rows={data?.data || []} loading={isLoading} pagination={data?.pagination} onPageChange={setPage} onLimitChange={(value) => { setLimit(value); setPage(1); }} emptyTitle="Chưa có hóa đơn nào" emptyDescription="Tạo hóa đơn đầu tiên hoặc import dữ liệu từ Excel." emptyActionText="Tạo hóa đơn" onEmptyAction={() => navigate('/invoices/new')} />
    <ImportInvoiceModal open={importOpen} onClose={() => setImportOpen(false)} />
  </div>;
};