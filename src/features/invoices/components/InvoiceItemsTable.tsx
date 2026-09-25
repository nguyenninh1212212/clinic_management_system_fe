import React from 'react';
import {
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import { CreateInvoiceItemDto, InvoiceItemType, Medicine } from '@/types';

interface InvoiceItemsTableProps {
  items: CreateInvoiceItemDto[];
  medicines: Medicine[];
  onChange: (index: number, patch: Partial<CreateInvoiceItemDto>) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

const money = (value: number) => `${value.toLocaleString('vi-VN')} ₫`;

export const InvoiceItemsTable: React.FC<InvoiceItemsTableProps> = ({
  items,
  medicines,
  onChange,
  onAdd,
  onRemove,
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between gap-3">
      <div>
        <h2 className="text-sm font-bold text-slate-900">Dòng hàng hóa đơn</h2>
        <p className="text-xs text-slate-500">Chọn thuốc hoặc nhập chi phí dịch vụ.</p>
      </div>
      <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={onAdd}>
        Thêm dòng
      </Button>
    </div>
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <Table size="small" sx={{ minWidth: 760 }}>
        <TableHead>
          <TableRow>
            <TableCell>Loại</TableCell>
            <TableCell>Mặt hàng / mô tả</TableCell>
            <TableCell align="right">Số lượng</TableCell>
            <TableCell align="right">Đơn giá</TableCell>
            <TableCell align="right">Thành tiền</TableCell>
            <TableCell align="right"> </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item, index) => {
            const amount = Math.max(0, Number(item.quantity) || 0) * Math.max(0, Number(item.unitPrice) || 0);
            return (
              <TableRow key={index}>
                <TableCell sx={{ width: 140 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel id={`invoice-type-${index}`}>Loại</InputLabel>
                    <Select
                      labelId={`invoice-type-${index}`}
                      value={item.itemType}
                      label="Loại"
                      onChange={(event) => onChange(index, { itemType: event.target.value as InvoiceItemType, medicineId: '', description: '' })}
                    >
                      <MenuItem value="MEDICINE">Thuốc</MenuItem>
                      <MenuItem value="COST">Chi phí</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell sx={{ minWidth: 260 }}>
                  {item.itemType === 'MEDICINE' ? (
                    <FormControl size="small" fullWidth>
                      <InputLabel id={`invoice-medicine-${index}`}>Chọn thuốc</InputLabel>
                      <Select
                        labelId={`invoice-medicine-${index}`}
                        value={item.medicineId || ''}
                        label="Chọn thuốc"
                        onChange={(event) => onChange(index, { medicineId: event.target.value })}
                      >
                        {medicines.map((medicine) => (
                          <MenuItem key={medicine.id} value={medicine.id}>
                            {medicine.name} ({medicine.unit})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <TextField
                      size="small"
                      fullWidth
                      label="Mô tả khoản phí"
                      value={item.description || ''}
                      onChange={(event) => onChange(index, { description: event.target.value })}
                    />
                  )}
                </TableCell>
                <TableCell sx={{ width: 120 }}>
                  <TextField
                    size="small"
                    type="number"
                    fullWidth
                    slotProps={{ htmlInput: { min: 1, step: 1 } }}
                    value={item.quantity}
                    onChange={(event) => onChange(index, { quantity: Number(event.target.value) })}
                  />
                </TableCell>
                <TableCell sx={{ width: 150 }}>
                  <TextField
                    size="small"
                    type="number"
                    fullWidth
                    slotProps={{ htmlInput: { min: 0, step: 1000 } }}
                    value={item.unitPrice}
                    onChange={(event) => onChange(index, { unitPrice: Number(event.target.value) })}
                  />
                </TableCell>
                <TableCell align="right" className="font-semibold tabular-nums text-slate-800">
                  {money(amount)}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Xóa dòng">
                    <IconButton size="small" color="error" onClick={() => onRemove(index)} disabled={items.length === 1}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  </div>
);