export const statusMessages = ({
  status,
  formattedMsg,
}: {
  status: number;
  formattedMsg?: string;
}) => {
  const messages: Record<number, [string, "error" | "warning"]> = {
    403: ["Không có quyền thực hiện thao tác này", "error"],
    404: [formattedMsg || "Không tìm thấy dữ liệu", "warning"],
    409: [formattedMsg || "Dữ liệu xung đột hoặc đã tồn tại", "error"],
    500: [formattedMsg || "Lỗi hệ thống", "error"],
  };

  return messages[status];
};