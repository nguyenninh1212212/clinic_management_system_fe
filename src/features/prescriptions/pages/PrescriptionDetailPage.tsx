// src/features/prescriptions/pages/PrescriptionDetailPage.tsx
import React, { useRef } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PrintIcon from "@mui/icons-material/Print";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { PageHeader } from "@/components/common/PageHeader";
import { usePrescription } from "../hooks/usePrescriptions";
import dayjs from "dayjs";

export const PrescriptionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  if (!id) {
    return <Navigate to="/examinations" replace />;
  }
  const { data: prescription, isLoading, isError } = usePrescription(id);

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <CircularProgress />
      </div>
    );
  }

  if (isError || !prescription) {
    return (
      <div className="py-12 text-center space-y-4">
        <Typography variant="h6" className="text-slate-800">
          Không tìm thấy đơn thuốc
        </Typography>
        <Button variant="outlined" onClick={() => navigate("/prescriptions")}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }
  const printRef = useRef<HTMLDivElement>(null);
  const patient = prescription.examination?.appointment?.patient;
  const doctor = prescription.examination?.doctor;
  const exam = prescription.examination;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="print:hidden">
        <PageHeader
          title={`Đơn thuốc #${prescription.id}`}
          subtitle={`Bệnh nhân: ${patient?.fullName || "—"} · Kê ngày ${dayjs(prescription.createdAt).format("DD/MM/YYYY")}`}
          breadcrumbs={[
            { label: "Trang chủ", href: "/dashboard" },
            { label: "Đơn thuốc", href: "/prescriptions" },
            { label: `#${prescription.id}` },
          ]}
          action={
            <div className="flex items-center gap-2">
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/prescriptions")}
                size="small"
              >
                Danh sách
              </Button>
              <Button
                variant="contained"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                size="small"
              >
                In đơn thuốc
              </Button>
            </div>
          }
        />
      </div>

      <Card className="print:shadow-none print:border-none" ref={printRef}>
        <CardContent className="p-8 sm:p-12 space-y-6 font-serif">
          {/* Clinic Header */}
          <div className="flex items-start justify-between border-b pb-4 border-slate-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-sky-600 text-white flex items-center justify-center">
                <LocalHospitalIcon fontSize="large" />
              </div>
              <div>
                <h1 className="text-base font-bold tracking-tight text-slate-900 uppercase">
                  Phòng khám Đa khoa Quốc tế Medi Clinic
                </h1>
                <p className="text-xs text-slate-500 font-sans">
                  Địa chỉ: _______________________________________
                </p>
                <p className="text-xs text-slate-500 font-sans">
                  Hotline cấp cứu: ________ · Giấy phép hoạt động: ________
                </p>
              </div>
            </div>
            <div className="text-right text-xs font-sans text-slate-500">
              <div>
                Mã đơn:{" "}
                <strong className="font-mono text-slate-900">
                  #{prescription.id}
                </strong>
              </div>
              <div className="tabular-nums">
                Ngày: {dayjs(prescription.createdAt).format("DD/MM/YYYY")}
              </div>
            </div>
          </div>

          <div className="text-center py-2">
            <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900">
              ĐƠN THUỐC
            </h2>
            <p className="text-xs text-slate-500 font-sans">
              (Dùng cho bệnh nhân điều trị ngoại trú)
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-sans p-4 bg-slate-50 rounded-lg">
            <div>
              <span className="text-slate-500">Họ và tên:</span>
              <div className="font-bold text-slate-900 text-sm mt-0.5">
                {patient?.fullName}
              </div>
            </div>
            <div>
              <span className="text-slate-500">Giới tính / Tuổi:</span>
              <div className="font-semibold text-slate-800 mt-0.5">
                {patient?.gender} ·{" "}
                {patient?.dateOfBirth
                  ? `${dayjs().diff(patient.dateOfBirth, "year")} tuổi`
                  : "—"}
              </div>
            </div>
            <div>
              <span className="text-slate-500">Điện thoại:</span>
              <div className="font-semibold text-slate-800 mt-0.5 font-mono">
                {patient?.phone || "—"}
              </div>
            </div>
            <div>
              <span className="text-slate-500">Số CCCD/BHYT:</span>
              <div className="font-semibold text-slate-800 mt-0.5 font-mono">
                {patient?.identityNumber || "—"}
              </div>
            </div>
            <div className="col-span-2 sm:col-span-4">
              <span className="text-slate-500">Địa chỉ:</span>
              <span className="text-slate-800 ml-2">
                {patient?.address || "—"}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-4 pt-1 border-t border-slate-200">
              <span className="text-slate-500 font-semibold">Chẩn đoán:</span>
              <span className="text-slate-900 font-bold ml-2">
                {exam?.diagnosis}{" "}
                {exam?.icd10Code && `(Mã ICD-10: ${exam.icd10Code})`}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="border-b-2 border-slate-800 text-slate-700">
                  <th className="py-2 w-10 text-center">STT</th>
                  <th className="py-2">Tên thuốc / Biệt dược & Hàm lượng</th>
                  <th className="py-2 w-28 text-center">Số lượng</th>
                  <th className="py-2">Hướng dẫn sử dụng & Liều dùng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {prescription.items?.map((item, idx) => (
                  <tr key={item.id} className="align-top">
                    <td className="py-3 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="py-3 pr-2">
                      <div className="font-bold text-slate-900 text-sm">
                        {item.medicine?.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {item.medicine?.genericName &&
                          `Hoạt chất: ${item.medicine.genericName}`}
                      </div>
                    </td>
                    <td className="py-3 text-center font-bold text-slate-900 tabular-nums">
                      {item.quantity} {item.medicine?.unit || "viên"}
                    </td>
                    <td className="py-3">
                      <div className="font-semibold text-slate-800">
                        {item.dosage} · {item.frequency}
                        {item.durationDays
                          ? ` · Dùng ${item.durationDays} ngày`
                          : ""}
                      </div>
                      {item.instructions && (
                        <div className="text-slate-600 text-[11px] mt-0.5 italic">
                          Lời dặn: {item.instructions}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {prescription.notes && (
            <div className="p-3 bg-amber-50/60 rounded border border-amber-200 text-xs font-sans text-amber-900">
              <strong>Lời dặn của bác sĩ:</strong> {prescription.notes}
            </div>
          )}

          {exam?.followUpDate && (
            <div className="text-xs font-sans text-slate-700">
              * Hẹn khám lại vào ngày:{" "}
              <strong className="underline">
                {dayjs(exam.followUpDate).format("DD/MM/YYYY")}
              </strong>
            </div>
          )}

          <div className="grid grid-cols-2 pt-8 text-center text-xs font-sans text-slate-700">
            <div>
              <p className="font-medium text-slate-500">
                Bệnh nhân / Người nhà
              </p>
              <p className="italic text-[10px] text-slate-400">
                (Ký và ghi rõ họ tên)
              </p>
              <div className="h-20" />
              <p className="font-semibold">{patient?.fullName}</p>
            </div>

            <div>
              <p className="text-slate-500">
                Ngày {dayjs(prescription.createdAt).format("DD")} tháng{" "}
                {dayjs(prescription.createdAt).format("MM")} năm{" "}
                {dayjs(prescription.createdAt).format("YYYY")}
              </p>
              <p className="font-bold text-slate-900 mt-0.5">
                Bác sĩ khám bệnh
              </p>
              <p className="italic text-[10px] text-slate-400">
                (Ký và ghi rõ họ tên)
              </p>
              <div className="h-20" />
              <p className="font-bold text-slate-900">
                {doctor?.user?.fullName || "BS. Chuyên khoa"}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                CCHN: {doctor?.licenseNumber}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
