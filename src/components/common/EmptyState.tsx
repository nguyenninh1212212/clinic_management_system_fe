// src/components/common/EmptyState.tsx
import React, { ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Không có dữ liệu',
  description = 'Chưa có thông tin hoặc không tìm thấy kết quả phù hợp.',
  icon,
  actionText,
  onAction,
}) => {
  return (
    <Box className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        {icon || <InboxOutlinedIcon sx={{ fontSize: 26 }} />}
      </div>
      <Typography variant="subtitle1" className="font-semibold text-slate-800">
        {title}
      </Typography>
      <Typography variant="body2" className="text-slate-500 max-w-sm mt-1 mb-4">
        {description}
      </Typography>
      {actionText && onAction && (
        <Button variant="contained" size="small" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </Box>
  );
};
