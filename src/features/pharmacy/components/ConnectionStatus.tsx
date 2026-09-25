import React from 'react';
import WifiOutlinedIcon from '@mui/icons-material/WifiOutlined';
import WifiOffOutlinedIcon from '@mui/icons-material/WifiOffOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import { PharmacySocketStatus } from '@/types';

export const ConnectionStatus: React.FC<{ status: PharmacySocketStatus }> = ({ status }) => {
  const connected = status === 'connected';
  const connecting = status === 'connecting';
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${connected ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : connecting ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
    {connected ? <WifiOutlinedIcon fontSize="inherit" /> : connecting ? <SyncOutlinedIcon fontSize="inherit" className="animate-spin" /> : <WifiOffOutlinedIcon fontSize="inherit" />}
    {connected ? 'Đã kết nối' : connecting ? 'Đang kết nối' : 'Mất kết nối'}
  </span>;
};