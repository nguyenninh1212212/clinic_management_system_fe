// src/components/common/ConfirmDialog.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  content: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'error' | 'primary' | 'warning';
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  content,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  confirmColor = 'error',
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle className="font-semibold text-slate-900">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText className="text-slate-600 text-sm">{content}</DialogContentText>
      </DialogContent>
      <DialogActions className="px-6 pb-4">
        <Button onClick={onClose} disabled={isLoading} color="inherit">
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          variant="contained"
          color={confirmColor}
          autoFocus
        >
          {isLoading ? 'Đang xử lý...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
