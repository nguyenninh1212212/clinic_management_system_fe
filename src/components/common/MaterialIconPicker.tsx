// src/components/common/MaterialIconPicker.tsx
import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Tooltip,
  Box,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import * as MuiIcons from '@mui/icons-material';
import { SvgIconComponent } from '@mui/icons-material';

// Danh sách các icon phù hợp cho chuyên khoa y tế & phòng khám
const ICON_LIST: string[] = [
  // Y tế tổng quát
  'LocalHospital', 'MedicalServices', 'Healing', 'HealthAndSafety',
  'MonitorHeart', 'Vaccines', 'Bloodtype', 'Biotech',
  'Science', 'Psychology', 'SentimentVerySatisfied',
  // Tim mạch
  'Favorite', 'FavoriteBorder', 'FitnessCenter',
  // Nhi khoa
  'ChildCare', 'ChildFriendly', 'FamilyRestroom',
  // Mắt
  'Visibility', 'RemoveRedEye',
  // Tai mũi họng
  'HearingDisabled', 'Hearing', 'VolumeUp',
  // Thần kinh / Não
  'PsychologyAlt', 'EmojiObjects', 'Hub',
  // Xương khớp / Phục hồi
  'DirectionsRun', 'AccessibilityNew', 'Accessibility',
  // Da liễu
  'PanTool', 'Spa',
  // Sản phụ khoa
  'PregnantWoman', 'WomanOutlined', 'Wc',
  // Dinh dưỡng / Tiêu hóa
  'Restaurant', 'LocalDining', 'Water',
  // Răng hàm mặt
  'Face', 'Face2', 'Face3', 'TagFaces',
  // Ung bướu / Xét nghiệm
  'BiotechOutlined', 'Science', 'BarChart', 'Analytics',
  // Cấp cứu
  'LocalFireDepartment', 'Warning', 'Emergency', 'CrisisAlert',
  // Dược
  'Medication', 'MedicationLiquid', 'Pill',
  // Hô hấp
  'Air', 'FilterDrama', 'Cloud',
  // Thận / Tiết niệu
  'WaterDrop', 'Opacity',
  // Nội tiết / Đái tháo đường
  'BloodtypeOutlined', 'DeviceThermostat',
  // Tổng hợp / Chung
  'Star', 'StarOutline', 'Category', 'LocalPharmacy',
  'DirectionsWalk', 'Elderly', 'ElderlyWoman', 'PersonOutline',
  'Person', 'Groups', 'Group', 'SupervisedUserCircle',
  'NightShelter', 'BeachAccess', 'HotTub', 'Pool',
  'SportsMartialArts', 'SportsGymnastics', 'SelfImprovement',
  'Yoga', 'Diversity1', 'Diversity2', 'Diversity3',
  'MedicalInformation', 'VolunteerActivism', 'EscalatorWarning',
];

// Loại bỏ trùng và kiểm tra tồn tại
const VALID_ICONS: string[] = [...new Set(ICON_LIST)].filter(
  (name) => name in MuiIcons
);

interface MaterialIconPickerProps {
  value?: string; // tên icon, e.g. "Favorite"
  onChange: (iconName: string) => void;
}

export const renderMaterialIcon = (iconName?: string, fontSize: 'small' | 'medium' | 'inherit' = 'small') => {
  if (!iconName || !(iconName in MuiIcons)) return null;
  const IconComp = (MuiIcons as Record<string, SvgIconComponent>)[iconName];
  return <IconComp fontSize={fontSize} />;
};

export const MaterialIconPicker: React.FC<MaterialIconPickerProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().replace(/\s+/g, '');
    return VALID_ICONS.filter((name) => name.toLowerCase().includes(q));
  }, [search]);

  const CurrentIcon = value && value in MuiIcons
    ? (MuiIcons as Record<string, SvgIconComponent>)[value]
    : null;

  const handleSelect = (name: string) => {
    onChange(name);
    setOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    onChange('');
    setOpen(false);
  };

  return (
    <>
      {/* Trigger button */}
      <Box
        onClick={() => setOpen(true)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          p: '10px 14px',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          cursor: 'pointer',
          bgcolor: 'action.hover',
          transition: 'border-color 0.2s',
          '&:hover': { borderColor: 'primary.main' },
          minHeight: 48,
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            bgcolor: 'primary.50',
            border: '1px solid',
            borderColor: 'primary.100',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.main',
            flexShrink: 0,
          }}
        >
          {CurrentIcon ? (
            <CurrentIcon fontSize="small" />
          ) : (
            <MuiIcons.LocalHospital fontSize="small" sx={{ color: 'text.disabled' }} />
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Biểu tượng (Icon)
          </Typography>
          <Typography variant="body2" color={value ? 'text.primary' : 'text.disabled'} noWrap>
            {value || 'Chưa chọn — nhấn để chọn icon'}
          </Typography>
        </Box>
        <MuiIcons.KeyboardArrowDown fontSize="small" sx={{ color: 'text.secondary', flexShrink: 0 }} />
      </Box>

      {/* Picker Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography fontWeight={700}>Chọn biểu tượng Material Icons</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Chọn icon phù hợp với chuyên khoa của bạn
          </Typography>
        </DialogTitle>

        <Box sx={{ px: 3, pb: 1 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm icon... (VD: heart, hospital, child...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <DialogContent sx={{ pt: 1 }}>
          {filtered.length === 0 ? (
            <Box textAlign="center" py={6} color="text.disabled">
              <MuiIcons.SearchOff sx={{ fontSize: 48, mb: 1 }} />
              <Typography>Không tìm thấy icon phù hợp</Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                gap: 0.5,
              }}
            >
              {filtered.map((name) => {
                const IconComp = (MuiIcons as Record<string, SvgIconComponent>)[name];
                const isSelected = value === name;
                return (
                  <Tooltip key={name} title={name} placement="top" arrow>
                    <Box
                      onClick={() => handleSelect(name)}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5,
                        p: 1,
                        borderRadius: 2,
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: isSelected ? 'primary.main' : 'transparent',
                        bgcolor: isSelected ? 'primary.50' : 'transparent',
                        color: isSelected ? 'primary.main' : 'text.secondary',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          bgcolor: isSelected ? 'primary.100' : 'action.hover',
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          color: 'primary.main',
                          transform: 'scale(1.05)',
                        },
                      }}
                    >
                      <IconComp />
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: '0.6rem',
                          textAlign: 'center',
                          lineHeight: 1.2,
                          wordBreak: 'break-word',
                          maxWidth: '100%',
                        }}
                      >
                        {name}
                      </Typography>
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          {value && (
            <Button onClick={handleClear} color="inherit" sx={{ mr: 'auto' }}>
              Xóa icon
            </Button>
          )}
          <Button onClick={() => setOpen(false)} color="inherit">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
