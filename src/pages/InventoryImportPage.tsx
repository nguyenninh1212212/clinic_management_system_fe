import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert, Snackbar } from '@mui/material';
import { AxiosError } from 'axios';
import { Download, LoaderCircle, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { PageHeader } from '@/components/common/PageHeader';
import { UploadExcel } from '@/components/UploadExcel';
import { notifyApiFeedback } from '@/api/axios';
import { queryKeys } from '@/api/queryKeys';
import { inventoryService } from '@/services/inventoryService';
import { inventoryImportColumns, inventoryImportHeaders } from '@/types/inventory';
import type { InventoryImportResponse } from '@/types/inventory';

interface ImportErrorResponse {
  message?: string | string[];
}

const getResponseMessage = (response: InventoryImportResponse) =>
  response.message ?? response.data?.message;

const getImportedCount = (response: InventoryImportResponse) =>
  response.importedCount ?? response.count ?? response.data?.importedCount ?? response.data?.count;

export function InventoryImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: (selectedFile: File) => inventoryService.importExcel(selectedFile),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      const count = getImportedCount(response);
      const message = getResponseMessage(response) ?? 'Nhập dữ liệu kho thành công';
      const notification = count === undefined ? message : `${message} (${count} mặt hàng)`;
      setSuccessMessage(notification);
      setFile(null);
    },
    onError: (error: AxiosError<ImportErrorResponse>) => {
      const responseMessage = error.response?.data?.message;
      const message = Array.isArray(responseMessage)
        ? responseMessage.join(', ')
        : responseMessage;

      if (!error.response) {
        notifyApiFeedback(message ?? 'Không thể kết nối máy chủ. Vui lòng thử lại.', 'error');
      }
    },
  });

  const downloadTemplate = () => {
    const sheet = XLSX.utils.aoa_to_sheet([
      inventoryImportHeaders,
      ['', 'Paracetamol 500mg', 'Kho A - Kệ 01', 'LO-2026-001', '2027-12-31', 100, 2500],
    ]);
    sheet['!cols'] = [
      { wch: 22 }, { wch: 24 }, { wch: 24 }, { wch: 20 },
      { wch: 18 }, { wch: 14 }, { wch: 14 },
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, 'Nhap kho');
    XLSX.writeFile(workbook, 'mau-nhap-du-lieu-kho.xlsx');
  };

  return (
    <div className="pb-8">
      <PageHeader
        title="Nhập dữ liệu kho"
        subtitle="Cập nhật thuốc và số lượng tồn kho từ tệp Excel."
        breadcrumbs={[
          { label: 'Tồn kho dược', href: '/inventory' },
          { label: 'Nhập dữ liệu' },
        ]}
      />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.85fr)]">
        <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-slate-900">Tải tệp Excel lên</h2>
            <p className="mt-1 text-sm text-slate-500">Chọn tệp .xlsx đã chuẩn bị theo mẫu cột bên cạnh.</p>
          </div>
          <div className="space-y-5 p-5 sm:p-6">
            <UploadExcel
              file={file}
              onFileChange={setFile}
              disabled={importMutation.isPending}
            />
            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center gap-2 rounded border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                onClick={downloadTemplate}
              >
                <Download size={16} aria-hidden="true" />
                Tải tệp mẫu
              </button>
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center gap-2 rounded bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={!file || importMutation.isPending}
                onClick={() => file && importMutation.mutate(file)}
              >
                {importMutation.isPending ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
                    Đang nhập dữ liệu...
                  </>
                ) : (
                  <>
                    <Upload size={16} aria-hidden="true" />
                    Nhập dữ liệu
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900">Cấu trúc tệp Excel</h2>
            <p className="mt-1 text-sm text-slate-500">Tên cột trong hàng đầu tiên của tệp.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Tên cột</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Mô tả</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inventoryImportColumns.map((column) => (
                  <tr key={column.name}>
                    <td className="whitespace-nowrap px-4 py-3 align-top">
                      <code className="text-xs font-medium text-slate-800">{column.name}</code>
                      {column.required && <span className="ml-1 text-rose-600" aria-label="Bắt buộc">*</span>}
                    </td>
                    <td className="px-4 py-3 text-xs leading-5 text-slate-500">{column.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="border-t border-slate-100 px-4 py-3 text-xs leading-5 text-slate-500">
            * Cần có mã thuốc hoặc tên thuốc. Ngày hết hạn dùng định dạng YYYY-MM-DD.
          </p>
        </section>
      </div>

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={5000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={() => setSuccessMessage('')}
      >
        <Alert severity="success" variant="filled" onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}