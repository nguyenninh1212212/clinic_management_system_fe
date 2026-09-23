// src/components/common/SearchInput.tsx
import React, { useState, useEffect } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  debounceMs?: number;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Tìm kiếm...',
  value: initialValue = '',
  onChange,
  debounceMs = 300,
  className,
}) => {
  const [innerValue, setInnerValue] = useState(initialValue);

  useEffect(() => {
    setInnerValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (innerValue !== initialValue) {
        onChange(innerValue);
      }
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [innerValue, debounceMs, onChange, initialValue]);

  return (
    <TextField
      size="small"
      value={innerValue}
      onChange={(e) => setInnerValue(e.target.value)}
      placeholder={placeholder}
      className={className}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" className="text-slate-400" />
            </InputAdornment>
          ),
          endAdornment: innerValue ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => {
                  setInnerValue('');
                  onChange('');
                }}
              >
                <ClearIcon fontSize="small" className="text-slate-400" />
              </IconButton>
            </InputAdornment>
          ) : null,
        },
      }}
    />
  );
};
