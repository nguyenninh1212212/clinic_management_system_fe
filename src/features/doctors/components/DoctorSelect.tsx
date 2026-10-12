import React, { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  Autocomplete,
  Avatar,
  CircularProgress,
  TextField,
} from '@mui/material';
import { queryKeys } from '@/api/queryKeys';
import { doctorsApi } from '@/api/endpoints/doctors.api';
import { useDoctor } from '@/features/doctors/hooks/useDoctors';
import type { Doctor } from '@/types';

const PAGE_SIZE = 5;

interface DoctorSelectProps {
  value: string;
  onChange: (doctorId: string) => void;
  label?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  size?: 'small' | 'medium';
}

export const DoctorSelect: React.FC<DoctorSelectProps> = ({
  value,
  onChange,
  label = 'Bác sĩ',
  error = false,
  helperText,
  disabled = false,
  size = 'small',
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 250);
    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  const query = useInfiniteQuery({
    queryKey: [
      ...queryKeys.doctors.lists(),
      'select',
      { search: search  },
    ],
    queryFn: ({ pageParam }) =>
      doctorsApi.findAll({
        page: pageParam,
        limit: PAGE_SIZE,
        search: search || undefined,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
    enabled: open,
    staleTime: 60_000,
  });

  const doctors = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data],
  );
  const selectedInResults = doctors.find((doctor) => doctor.id === value);
  const { data: selectedDoctorData } = useDoctor(
    value,
    Boolean(value && !selectedInResults),
  );
  const selectedDoctor = selectedInResults ?? selectedDoctorData?.data ?? null;
  const options = useMemo(() => {
    if (selectedDoctor && !doctors.some((doctor) => doctor.id === selectedDoctor.id)) {
      return [selectedDoctor, ...doctors];
    }
    return doctors;
  }, [doctors, selectedDoctor]);

  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    const list = event.currentTarget;
    if (
      list.scrollTop + list.clientHeight >= list.scrollHeight - 24 &&
      query.hasNextPage &&
      !query.isFetchingNextPage
    ) {
      void query.fetchNextPage();
    }
  };

  const getDoctorLabel = (doctor: Doctor) =>
    `${doctor.user?.fullName || 'Bác sĩ'} · ${doctor.specialty?.name || 'Đa khoa'}`;

  return (
    <Autocomplete
      fullWidth
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      value={selectedDoctor}
      inputValue={inputValue}
      onInputChange={(_, nextInput, reason) => {
        setInputValue(nextInput);
        if (reason === 'input' || reason === 'clear') {
          setSearchInput(nextInput);
        } else if (reason === 'reset') {
          setSearchInput('');
        }
      }}
      onChange={(_, doctor) => {
        onChange(doctor?.id ?? '');
        setSearchInput('');
      }}
      getOptionLabel={getDoctorLabel}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      filterOptions={(availableDoctors) => availableDoctors}
      loading={query.isLoading}
      loadingText="Đang tải danh sách bác sĩ..."
      noOptionsText={
        query.isError ? 'Không thể tải danh sách bác sĩ.' : 'Không tìm thấy bác sĩ phù hợp.'
      }
      disabled={disabled}
      size={size}
      slotProps={{ listbox: { onScroll: handleScroll } }}
      renderOption={(props, doctor) => (
        <li {...props} key={doctor.id}>
          <Avatar
            src={doctor.user?.avatar}
            alt=""
            sx={{ width: 36, height: 36, mr: 1.5, bgcolor: '#0284c7' }}
          >
            {doctor.user?.fullName?.charAt(0) || 'B'}
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-slate-900">
              {doctor.user?.fullName || 'Bác sĩ'}
            </div>
            <div className="truncate text-xs text-slate-500">
              {doctor.specialty?.name || 'Đa khoa'}
              {doctor.licenseNumber ? ` · ${doctor.licenseNumber}` : ''}
            </div>
          </div>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          error={error || query.isError}
          helperText={
            query.isError
              ? 'Không thể tải danh sách bác sĩ.'
              : helperText
          }
          slotProps={{
            ...params.slotProps,
            input: {
              ...params.slotProps?.input,
              endAdornment: (
                <>
                  {query.isFetchingNextPage && (
                    <CircularProgress color="inherit" size={18} />
                  )}
                  {params.slotProps?.input?.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
};
