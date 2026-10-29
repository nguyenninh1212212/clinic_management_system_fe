import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Avatar,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { usersApi } from "@/api/endpoints/users.api";
import { queryKeys } from "@/api/queryKeys";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusChip } from "@/components/common/StatusChip";
import { ProfileTabs } from "@/features/profiles/components/ProfileTabs";
import { StaffAppointmentsTab } from "@/features/profiles/components/ProfileRecords";

export function UserDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const query = useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersApi.findById(id),
    enabled: !!id,
  });
  if (query.isLoading)
    return (
      <div className="flex justify-center py-20">
        <CircularProgress />
      </div>
    );
  const user = query.data;
  if (query.isError || !user)
    return (
      <Alert
        severity="error"
        action={<Button onClick={() => query.refetch()}>Thử lại</Button>}
      >
        Không tải được hồ sơ nhân viên.{" "}
        <Button onClick={() => navigate("/users")}>Về danh sách</Button>
      </Alert>
    );
  const field = (label: string, value: React.ReactNode) => (
    <div>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography component="div">{value || "Chưa cập nhật"}</Typography>
    </div>
  );
  return (
    <div className="space-y-6">
      <PageHeader
        title={user.fullName || "Chi tiết nhân viên y tế"}
        subtitle="Hồ sơ nhân viên và thông tin công tác"
        breadcrumbs={[
          { label: "Trang chủ", href: "/dashboard" },
          { label: "Người dùng", href: "/users" },
          { label: user.fullName },
        ]}
        action={
          <Button variant="outlined" onClick={() => navigate("/users")}>
            Về danh sách
          </Button>
        }
      />
      <Card>
        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar src={user.avatar} sx={{ width: 64, height: 64 }}>
              {user.fullName?.charAt(0)}
            </Avatar>
            <div>
              <Typography variant="h6">{user.fullName}</Typography>
              <Typography color="text.secondary">{user.email}</Typography>
              <StatusChip status={user.role} type="role" />
            </div>
          </div>
        </CardContent>
      </Card>
      <ProfileTabs
        tabs={[
          {
            id: "overview",
            label: "Thông tin công tác",
            content: (
              <Card>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {field("Mã nhân viên", user.id)}
                    {field("Họ và tên", user.fullName)}
                    {field("Chức vụ", user.position?.positionTitle)}
                    {field("Mã chức vụ", user.position?.positionCode)}
                    {field(
                      "Mã phòng ban",
                      user.departmentId ?? user.position?.departmentId,
                    )}
                    {field("Mô tả công việc", user.position?.description)}
                  </div>
                </CardContent>
              </Card>
            ),
          },
          {
            id: "appointments",
            label: "Lịch hẹn đã đặt",
            content: <StaffAppointmentsTab userId={user.id} />,
          },
          {
            id: "account",
            label: "Tài khoản & vai trò",
            content: (
              <Card>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {field("Email đăng nhập", user.email)}
                    {field(
                      "Vai trò",
                      <StatusChip status={user.role} type="role" />,
                    )}
                    {field(
                      "Trạng thái",
                      user.isActive ? "Đang hoạt động" : "Tạm khóa",
                    )}
                    {field(
                      "Ngày tạo",
                      dayjs(user.createdAt).format("DD/MM/YYYY"),
                    )}
                    {field(
                      "Cập nhật lần cuối",
                      dayjs(user.updatedAt).format("DD/MM/YYYY"),
                    )}
                  </div>
                </CardContent>
              </Card>
            ),
          },
        ]}
      />
    </div>
  );
}
