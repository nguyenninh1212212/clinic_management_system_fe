import { isAxiosError } from "axios";
import type { PatientLoginMethod } from "@/types/patient-account.types";
export const loginLabels: Record<PatientLoginMethod, string> = {
  LOCAL: "Email / Mật khẩu",
  GOOGLE: "Google",
  FACEBOOK: "Facebook",
};
export const relationshipLabels: Record<string, string> = {
  SELF: "Chính chủ",
  PARENT: "Cha / Mẹ",
  CHILD: "Con",
  SPOUSE: "Vợ / Chồng",
  SIBLING: "Anh / Chị / Em",
  OTHER: "Người thân khác",
};
export const accessLabels: Record<string, string> = {
  FULL_ACCESS: "Toàn quyền hồ sơ",
  BOOKING_ONLY: "Chỉ đặt lịch",
  ADMINISTRATIVE: "Hành chính",
};
export const profileStatusLabels: Record<string, string> = {
  ACTIVE: "Đã xác minh",
  PENDING_APPROVAL: "Chờ xác minh",
  REVOKED: "Đã thu hồi",
};
export function accountError(error: unknown): string {
  if (isAxiosError(error)) {
    const message: unknown = error.response?.data?.message;
    if (typeof message === "string") return message;
    if (
      Array.isArray(message) &&
      message.every((item) => typeof item === "string")
    )
      return message.join(", ");
  }
  return "Không thể xử lý tài khoản bệnh nhân. Vui lòng thử lại.";
}
