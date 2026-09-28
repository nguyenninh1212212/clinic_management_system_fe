import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Divider, Paper, Skeleton, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AssignmentIcon from '@mui/icons-material/Assignment';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { examinationsApi } from '@/api/endpoints/examinations.api';
import { prescriptionsApi } from '@/api/endpoints/prescriptions.api';
import { invoicesApi } from '@/api/endpoints/invoices.api';
import { queryKeys } from '@/api/queryKeys';
import { Examination, Prescription, Invoice, PharmacyPrescriptionStatus } from '@/types';

interface TabPanelProps { children: React.ReactNode; value: number; index: number; }
const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const pharmacyStatusLabel: Record<PharmacyPrescriptionStatus, string> = {
  NEW: 'Mới',
  PROCESSING: 'Đang chuẩn bị',
  READY: 'Sẵn sàng',
  COMPLETED: 'Đã cấp phát',
  CANCELLED: 'Đã huỷ',
};
const pharmacyStatusColor: Record<PharmacyPrescriptionStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  NEW: 'default',
  PROCESSING: 'info',
  READY: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

const money = (v?: number | string) => Number(v || 0).toLocaleString('vi-VN')} ₫";

const ExaminationSection: React.FC<{ examination: Examination | null | undefined; isLoading: boolean }> = ({ examination, isLoading }) => {
  if (isLoading) return <Skeleton variant="rounded" height={320} />;
  if (!examination) return (
    <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
      <AssignmentIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
      <Typography variant="h6" color="text.secondary">Chưa có phiếu khám bệnh</Typography>
      <Typography variant="body2" color="text.disabled">Phiếu khám sẽ được bác sĩ tạo sau khi thăm khám.</Typography>
    </Paper>
  );

  const patient = examination.appointment?.patient;
  const doctor = examination.doctor;

  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ bgcolor: 'primary.main', color: 'white', px: 4, py: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <LocalHospitalIcon sx={{ fontSize: 36 }} />
        <Box>
          <Typography variant="h6" fontWeight={700} letterSpacing={1}>PHIẾU KHÁM BỆNH</Typography>
          <Typography variant="caption" sx={{ opacity: 0.85 }}>Phòng khám Đa khoa Quốc tế Medi Clinic</Typography>
        </Box>
        <Box sx={{ ml: 'auto', textAlign: 'right' }}>
          <Typography variant="caption" sx={{ opacity: 0.75 }}>Mã phiếu</Typography>
          <Typography variant="body2" fontFamily="monospace" fontWeight={700}>
            #{(examination.id || '').slice(0, 8).toUpperCase()}
          </Typography>
        </Box>
      </Box>

      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
          {[
            { label: 'Họ và tên', value: patient?.fullName || '—' },
            { label: 'Giới tính', value: patient?.gender === 'MALE' ? 'Nam' : patient?.gender === 'FEMALE' ? 'Nữ' : patient?.gender || '—' },
            { label: 'Ngày sinh', value: patient?.dateOfBirth ? dayjs(patient.dateOfBirth).format('DD/MM/YYYY') : '—' },
            { label: 'Điện thoại', value: patient?.phone || '—' },
            { label: 'Địa chỉ', value: patient?.address || '—' },
            { label: 'Ngày khám', value: examination.examinedAt ? dayjs(examination.examinedAt).format('DD/MM/YYYY HH:mm') : '—' },
          ].map((item) => (
            <Box key={item.label}>
              <Typography variant="caption" color="text.secondary" display="block">{item.label}</Typography>
              <Typography variant="body2" fontWeight={600}>{item.value}</Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>Chẩn đoán xác định</Typography>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.50', borderLeft: '4px solid', borderColor: 'primary.main', borderRadius: '0 8px 8px 0' }}>
            <Typography variant="body1" fontWeight={700}>
              {examination.diagnosis || 'Chưa có chẩn đoán'}
            </Typography>
            {examination.icd10Code && (
              <Chip label={} size="small" variant="outlined" color="primary" sx={{ mt: 1, fontFamily: 'monospace' }} />
            )}
          </Paper>
        </Box>

        {examination.clinicalNotes && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Diễn tiến lâm sàng</Typography>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{examination.clinicalNotes}</Typography>
            </Paper>
          </Box>
        )}

        {examination.followUpDate && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: 'success.50', borderRadius: 2 }}>
            <EventAvailableIcon color="success" />
            <Box>
              <Typography variant="caption" color="success.dark">Hẹn ngày tái khám</Typography>
              <Typography variant="body2" fontWeight={700} color="success.dark">
                {dayjs(examination.followUpDate).format('DD/MM/YYYY')}
              </Typography>
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">Bác sĩ khám bệnh</Typography>
            <Typography variant="body2" fontWeight={700} mt={0.5}>
              {doctor?.user?.fullName || 'BS. Chuyên khoa'}
            </Typography>
            {doctor?.licenseNumber && (
              <Typography variant="caption" fontFamily="monospace" color="text.secondary">
                CCHN: {doctor.licenseNumber}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const PrescriptionSection: React.FC<{ prescription: Prescription | null | undefined; isLoading: boolean }> = ({ prescription, isLoading }) => {
  if (isLoading) return <Skeleton variant="rounded" height={320} />;
  if (!prescription) return (
    <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
      <MedicalServicesIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
      <Typography variant="h6" color="text.secondary">Chưa có đơn thuốc</Typography>
      <Typography variant="body2" color="text.disabled">Đơn thuốc sẽ được bác sĩ kê sau khi thăm khám.</Typography>
    </Paper>
  );

  const patient = prescription.examination?.appointment?.patient;
  const exam = prescription.examination;
  const status = prescription.pharmacyStatus ?? PharmacyPrescriptionStatus.PROCESSING;

  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
      <Box sx={{ bgcolor: 'success.main', color: 'white', px: 4, py: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <MedicalServicesIcon sx={{ fontSize: 36 }} />
        <Box>
          <Typography variant="h6" fontWeight={700} letterSpacing={1}>ĐƠN THUỐC ĐIỀU TRỊ</Typography>
          <Typography variant="caption" sx={{ opacity: 0.85 }}>Dùng cho bệnh nhân điều trị ngoại trú</Typography>
        </Box>
        <Box sx={{ ml: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
          <Chip
            label={pharmacyStatusLabel[status] || status}
            color={pharmacyStatusColor[status] || 'default'}
            size="small"
            icon={status === 'COMPLETED' ? <CheckCircleOutlineIcon /> : <HourglassBottomIcon />}
            sx={{ fontWeight: 700, color: 'white', bgcolor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)' }}
          />
          <Typography variant="caption" sx={{ opacity: 0.75 }}>Ngày kê: {dayjs(prescription.issuedAt ?? prescription.createdAt).format('DD/MM/YYYY')}</Typography>
        </Box>
      </Box>

      <CardContent sx={{ p: 4 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
          {[
            { label: 'Họ và tên', value: patient?.fullName || '—' },
            { label: 'Giới tính / Tuổi', value: patient ?  : '—' },
            { label: 'Điện thoại', value: patient?.phone || '—' },
          ].map((item) => (
            <Box key={item.label}>
              <Typography variant="caption" color="text.secondary" display="block">{item.label}</Typography>
              <Typography variant="body2" fontWeight={600}>{item.value}</Typography>
            </Box>
          ))}
          {exam?.diagnosis && (
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Typography variant="caption" color="text.secondary" display="block">Chẩn đoán</Typography>
              <Typography variant="body2" fontWeight={700}>
                {exam.diagnosis} {exam.icd10Code && }
              </Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell width={40} align="center">STT</TableCell>
                <TableCell>Tên thuốc</TableCell>
                <TableCell width={90} align="center">Số lượng</TableCell>
                <TableCell>Hướng dẫn sử dụng</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {prescription.items?.map((item, idx) => (
                <TableRow key={item.id} sx={{ '&:last-child td': { border: 0 } }}>
                  <TableCell align="center" sx={{ color: 'text.disabled', fontFamily: 'monospace' }}>{idx + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>{item.medicine?.name || '—'}</Typography>
                    {item.medicine?.genericName && (
                      <Typography variant="caption" color="text.secondary">Hoạt chất: {item.medicine.genericName}</Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2" fontWeight={700}>{item.quantity} {item.medicine?.unit || 'viên'}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{item.dosage} · {item.frequency}</Typography>
                    {item.duration && <Typography variant="caption" color="text.secondary">Dùng: {item.duration}</Typography>}
                    {item.note && <Typography variant="caption" color="text.secondary" display="block" sx={{ fontStyle: 'italic' }}>Lưu ý: {item.note}</Typography>}
                  </TableCell>
                </TableRow>
              ))}
              {(!prescription.items || prescription.items.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.disabled' }}>Chưa có thuốc trong đơn</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {prescription.notes && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <strong>Lời dặn của bác sĩ:</strong> {prescription.notes}
          </Alert>
        )}

        {prescription.validUntil && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
            * Đơn thuốc có giá trị đến: <strong>{dayjs(prescription.validUntil).format('DD/MM/YYYY')}</strong>
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

const InvoiceSection: React.FC<{ invoices: Invoice[] | undefined; isLoading: boolean }> = ({ invoices, isLoading }) => {
  if (isLoading) return <Skeleton variant="rounded" height={320} />;
  if (!invoices || invoices.length === 0) return (
    <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
      <ReceiptLongIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
      <Typography variant="h6" color="text.secondary">Chưa có hóa đơn thanh toán</Typography>
      <Typography variant="body2" color="text.disabled">Hóa đơn sẽ được xuất sau khi hoàn tất điều trị.</Typography>
    </Paper>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {invoices.map((invoice) => (
        <Card key={invoice.id} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ bgcolor: 'warning.main', color: 'white', px: 4, py: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <ReceiptLongIcon sx={{ fontSize: 36 }} />
            <Box>
              <Typography variant="h6" fontWeight={700} letterSpacing={1}>HÓA ĐƠN THANH TOÁN</Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                {invoice.invoiceNumber || }
              </Typography>
            </Box>
            <Box sx={{ ml: 'auto', textAlign: 'right' }}>
              <Typography variant="caption" sx={{ opacity: 0.75 }}>Ngày tạo</Typography>
              <Typography variant="body2" fontWeight={700}>
                {dayjs(invoice.createdAt).format('DD/MM/YYYY HH:mm')}
              </Typography>
            </Box>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, 1fr)' }, gap: 2, mb: 3 }}>
              {[
                { label: 'Người thanh toán', value: invoice.buyerName },
                { label: 'Điện thoại', value: invoice.buyerPhone || '—' },
                { label: 'Email', value: invoice.buyerEmail || '—' },
                { label: 'Địa chỉ', value: invoice.buyerAddress || '—' },
                { label: 'Mã số thuế', value: invoice.buyerTaxCode || '—' },
              ].map((item) => (
                <Box key={item.label}>
                  <Typography variant="caption" color="text.secondary" display="block">{item.label}</Typography>
                  <Typography variant="body2" fontWeight={600}>{item.value}</Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 2 }} />

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell>Loại</TableCell>
                    <TableCell>Mặt hàng / Mô tả</TableCell>
                    <TableCell align="right">Số lượng</TableCell>
                    <TableCell align="right">Đơn giá</TableCell>
                    <TableCell align="right">Thành tiền</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoice.items?.map((item, idx) => (
                    <TableRow key={item.id ?? idx} sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        <Chip
                          label={item.itemType === 'MEDICINE' ? 'Thuốc' : 'Chi phí'}
                          size="small"
                          color={item.itemType === 'MEDICINE' ? 'success' : 'info'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {item.medicine?.name || item.description || '—'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{Number(item.quantity).toLocaleString('vi-VN')}</TableCell>
                      <TableCell align="right">{money(item.unitPrice)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {money(Number(item.quantity) * Number(item.unitPrice))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'warning.50', border: '2px solid', borderColor: 'warning.main', borderRadius: 2, minWidth: 220, textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">Tổng thanh toán</Typography>
                <Typography variant="h5" fontWeight={800} color="warning.dark" sx={{ fontFamily: 'monospace' }}>
                  {money(invoice.totalAmount ?? invoice.items?.reduce((s, it) => s + Number(it.quantity) * Number(it.unitPrice), 0))}
                </Typography>
              </Paper>
            </Box>

            {invoice.notes && (
              <Alert severity="info" sx={{ mt: 2 }}>Ghi chú: {invoice.notes}</Alert>
            )}
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export const MyHealthRecordsPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const patientId = searchParams.get('patientId') ?? undefined;
  const [tab, setTab] = useState(0);

  const { data: examination, isLoading: examLoading } = useQuery({
    queryKey: [...queryKeys.examinations.all, 'byAppointment', appointmentId],
    queryFn: () => examinationsApi.findByAppointmentId(appointmentId!),
    enabled: !!appointmentId,
    staleTime: 2 * 60_000,
  });

  const prescriptionId = examination?.prescription?.id;
  const { data: prescription, isLoading: prescLoading } = useQuery({
    queryKey: queryKeys.prescriptions.detail(prescriptionId ?? ''),
    queryFn: () => prescriptionsApi.findById(prescriptionId!),
    enabled: !!prescriptionId,
    staleTime: 2 * 60_000,
  });

  const resolvedPatientId = patientId ?? examination?.appointment?.patient?.id;
  const { data: invoices, isLoading: invoiceLoading } = useQuery({
    queryKey: [...queryKeys.invoices.all, 'byPatient', resolvedPatientId],
    queryFn: () => invoicesApi.findByPatientId(resolvedPatientId!),
    enabled: !!resolvedPatientId,
    staleTime: 2 * 60_000,
  });

  const hasPrescription = !!examination?.prescription;
  const hasInvoice = invoices && invoices.length > 0;

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', pb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          variant="outlined"
          size="small"
          color="inherit"
        >
          Quay lại
        </Button>
        <Box>
          <Typography variant="h5" fontWeight={800} color="text.primary">
            Hồ sơ sức khỏe
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {examination?.appointment?.patient?.fullName
              ? `Bệnh nhân: ${examination.appointment.patient.fullName}`
              : 'Xem phiếu khám, đơn thuốc và hóa đơn thanh toán'}
          </Typography>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Tabs
          value={tab}
          onChange={(_e, v) => setTab(v)}
          variant="fullWidth"
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTab-root': { py: 2, fontWeight: 600 },
          }}
        >
          <Tab icon={<AssignmentIcon />} iconPosition="start" label="Phiếu khám bệnh" />
          <Tab
            icon={<MedicalServicesIcon />}
            iconPosition="start"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Đơn thuốc
                {hasPrescription && <Chip label="1" size="small" color="success" sx={{ height: 18, fontSize: 10, fontWeight: 700 }} />}
              </Box>
            }
          />
          <Tab
            icon={<ReceiptLongIcon />}
            iconPosition="start"
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Hóa đơn
                {hasInvoice && <Chip label={invoices.length} size="small" color="warning" sx={{ height: 18, fontSize: 10, fontWeight: 700 }} />}
              </Box>
            }
          />
        </Tabs>

        <Box sx={{ p: 3 }}>
          <TabPanel value={tab} index={0}>
            <ExaminationSection examination={examination} isLoading={examLoading} />
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <PrescriptionSection
              prescription={prescription ?? examination?.prescription ?? null}
              isLoading={prescLoading && !!prescriptionId}
            />
          </TabPanel>

          <TabPanel value={tab} index={2}>
            <InvoiceSection invoices={invoices} isLoading={invoiceLoading && !!resolvedPatientId} />
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
};
