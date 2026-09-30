import { useRef, useState } from 'react';
import { FileSpreadsheet, FileUp, Trash2 } from 'lucide-react';

interface UploadExcelProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
}

const isExcelFile = (file: File) => file.name.toLowerCase().endsWith('.xlsx');

const formatFileSize = (size: number) => {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

export function UploadExcel({ file, onFileChange, disabled = false }: UploadExcelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [validationMessage, setValidationMessage] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const selectFile = (candidate?: File) => {
    if (!candidate) return;
    if (!isExcelFile(candidate)) {
      onFileChange(null);
      setValidationMessage('Định dạng không hợp lệ. Vui lòng chọn tệp Excel .xlsx.');
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setValidationMessage('');
    onFileChange(candidate);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="sr-only"
        aria-label="Chọn tệp Excel"
        disabled={disabled}
        onChange={(event) => selectFile(event.target.files?.[0])}
      />

      {file ? (
        <div className="flex flex-col gap-4 rounded-md border border-emerald-200 bg-emerald-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-md bg-white text-emerald-700 ring-1 ring-emerald-200">
              <FileSpreadsheet size={21} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">{file.name}</p>
              <p className="mt-0.5 text-xs text-slate-500">{formatFileSize(file.size)} · Excel Workbook</p>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-9 items-center justify-center gap-2 self-start rounded border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
            disabled={disabled}
            onClick={() => {
              onFileChange(null);
              if (inputRef.current) inputRef.current.value = '';
            }}
          >
            <Trash2 size={15} aria-hidden="true" />
            Gỡ tệp
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={`flex min-h-52 w-full flex-col items-center justify-center rounded-md border border-dashed px-5 py-8 text-center transition disabled:cursor-not-allowed disabled:opacity-60 ${isDragging ? 'border-teal-600 bg-teal-50' : 'border-slate-300 bg-slate-50/70 hover:border-teal-500 hover:bg-teal-50/60'}`}
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            selectFile(event.dataTransfer.files[0]);
          }}
        >
          <span className="mb-3 grid size-12 place-items-center rounded-md bg-white text-teal-700 shadow-sm ring-1 ring-slate-200">
            <FileUp size={22} aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold text-slate-800">Kéo thả tệp Excel vào đây</span>
          <span className="mt-1.5 text-sm text-slate-500">hoặc chọn từ thiết bị của bạn</span>
          <span className="mt-4 inline-flex h-9 items-center rounded border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700">
            Chọn tệp .xlsx
          </span>
          <span className="mt-3 text-xs text-slate-400">Chỉ hỗ trợ định dạng .xlsx</span>
        </button>
      )}

      {validationMessage && (
        <p role="alert" className="mt-3 text-sm font-medium text-rose-700">
          {validationMessage}
        </p>
      )}
    </div>
  );
}