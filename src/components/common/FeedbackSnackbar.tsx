// src/components/common/FeedbackSnackbar.tsx
import React, { useState, useEffect } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';
import { registerApiErrorListener } from '@/api/axios';

export const FeedbackSnackbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('error');

  useEffect(() => {
    const unregister = registerApiErrorListener((msg, sev = 'error') => {
      setMessage(msg);
      setSeverity(sev);
      setOpen(true);
    });
    return unregister;
  }, []);

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={handleClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};
