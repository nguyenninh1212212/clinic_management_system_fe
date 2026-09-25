import React, { useRef, useState } from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
} from '@mui/material';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { useImportInvoices } from '../hooks/useInvoices';

interface ImportInvoiceModalProps {
  open: boolean;
  onClose: () => void;
}

export const ImportInvoiceModal: React.FC<ImportInvoiceModalProps> = ({ open, onClose }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const importMutation = useImportInvoices();

  const handleClose = () => {
    if (!importMutation.isPending) {
      setFile(null);
      setError('');
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setError('');
    try {
      await importMutation.mutateAsync(file);
      handleClose();
    } catch (requestError: any) {
      const message = requestError?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(', ') : message || 'File không đúng cấu trúc hoặc không thể import.');
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle className="font-bold text-slate-900">Import hóa đơn từ Excel</DialogTitle>
      <DialogContent className="space-y-4 pt-2">
        {error && <Alert severity="error">{error}</Alert>}
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={(event) => {
            const selected = event.target.files?.[0];
            if (!selected) return;
            if (!selected.name.toLowerCase().endsWith('.xlsx')) {
              setError('Chỉ hỗ trợ file .xlsx.');
              setFile(null);
              return;
            }
            setError('');
            setFile(selected);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center hover:border-sky-400 hover:bg-sky-50 transition-colors"
        >
          <UploadFileOutlinedIcon className="text-sky-600" />
          <div className="mt-2 text-sm font-semibold text-slate-800">{file ? file.name : 'Chọn file Excel .xlsx'}</div>
          {file && <div className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</div>}
        </button>
        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
          Cột hỗ trợ: <span className="font-mono">invoiceNumber, buyerName, buyerPhone, buyerEmail, buyerAddress, buyerTaxCode, patientId, notes, itemType, medicineName, description, quantity, unitPrice</span>
        </div>
        {importMutation.isPending && <LinearProgress />}
      </DialogContent>
      <DialogActions className="px-6 pb-4">
        <Button onClick={handleClose} color="inherit">Hủy</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={!file || importMutation.isPending} startIcon={<UploadFileOutlinedIcon />}>
          {importMutation.isPending ? 'Đang import...' : 'Import hóa đơn'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};