import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import dayjs from "dayjs";
import { PageHeader } from "@/components/common/PageHeader";
import { usePatientAccountDetail } from "../hooks/usePatientAccounts";
import {
  accessLabels,
  accountError,
  loginLabels,
  profileStatusLabels,
  relationshipLabels,
} from "../account-presentation";

const date = (value: string | null) =>
  value ? dayjs(value).format("DD/MM/YYYY HH:mm") : "Chưa xác minh";
export function PatientAccountDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const query = usePatientAccountDetail(id);
  const account = query.data;
  return (
    <div className="space-y-4">
      <PageHeader
        title="Chi tiết Tài khoản bệnh nhân"
        breadcrumbs={[
          { label: "Trang chủ", href: "/dashboard" },
          { label: "Tài khoản bệnh nhân", href: "/patient-accounts" },
          { label: account?.fullName ?? "Chi tiết" },
        ]}
        action={
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/patient-accounts")}
          >
            Quay lại
          </Button>
        }
      />
      {query.isLoading ? (
        <Skeleton variant="rounded" height={260} />
      ) : query.isError ? (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                void query.refetch();
              }}
            >
              Thử lại
            </Button>
          }
        >
          {accountError(query.error)}
        </Alert>
      ) : account ? (
        <>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                <Typography variant="h6">{account.fullName}</Typography>
                <Chip
                  size="small"
                  label={account.isActive ? "Hoạt động" : "Tạm khóa"}
                  color={account.isActive ? "success" : "default"}
                  variant="outlined"
                />
              </Stack>
              <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Typography variant="caption" color="text.secondary">
                    Mã tài khoản
                  </Typography>
                  <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>
                    {account.id}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="text.secondary">
                    Ngày đăng ký
                  </Typography>
                  <Typography variant="body2">
                    {date(account.createdAt)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body2">
                    {account.email || "Chưa có email"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="text.secondary">
                    Số điện thoại tài khoản
                  </Typography>
                  <Typography variant="body2">
                    {account.phone || "Chưa có số điện thoại"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="text.secondary">
                    Xác minh email
                  </Typography>
                  <Typography variant="body2">
                    {date(account.emailVerifiedAt)}
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption" color="text.secondary">
                    Xác minh số điện thoại tài khoản
                  </Typography>
                  <Typography variant="body2">
                    {date(account.phoneVerifiedAt)}
                  </Typography>
                </div>
              </Box>
              <Typography variant="subtitle2">Phương thức đăng nhập</Typography>
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                sx={{ flexWrap: "wrap" }}
              >
                {account.loginMethods.map((method) => (
                  <Chip
                    key={method}
                    label={loginLabels[method]}
                    variant="outlined"
                    size="small"
                  />
                ))}
                {!account.loginMethods.length && (
                  <Typography variant="body2">
                    Chưa có phương thức đăng nhập
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Paper>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Hồ sơ đã liên kết
            </Typography>
            <Stack spacing={2}>
              {!account.profiles.length && (
                <Typography variant="body2" color="text.secondary">
                  Tài khoản chưa có liên kết hồ sơ bệnh nhân.
                </Typography>
              )}
              {account.profiles.map((profile) => (
                <Box
                  key={profile.id}
                  sx={{
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    pb: 2,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <Typography variant="subtitle2">
                        {profile.patient?.fullName ?? "Hồ sơ bệnh nhân"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {profile.patient?.patientCode || profile.patientId}
                      </Typography>
                    </div>
                    <Button
                      size="small"
                      onClick={() => navigate(`/patients/${profile.patientId}`)}
                    >
                      Xem hồ sơ
                    </Button>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    sx={{ mt: 1, flexWrap: "wrap" }}
                  >
                    <Chip
                      size="small"
                      label={
                        relationshipLabels[profile.relationship] ??
                        profile.relationship
                      }
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={
                        accessLabels[profile.accessLevel] ?? profile.accessLevel
                      }
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      color={
                        profile.isActive && profile.status === "ACTIVE"
                          ? "success"
                          : "default"
                      }
                      label={
                        !profile.isActive
                          ? "Đã vô hiệu hóa quyền"
                          : (profileStatusLabels[profile.status] ??
                            profile.status)
                      }
                    />
                    {profile.patient?.isActive === false && (
                      <Chip size="small" label="Hồ sơ đã vô hiệu hóa" />
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Xác minh: {date(profile.verifiedAt)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </>
      ) : null}
    </div>
  );
}
