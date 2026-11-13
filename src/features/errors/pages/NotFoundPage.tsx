import { Box, Button, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { getDefaultRoute } from "@/routes/access-control";

export const NotFoundPage = () => {
  const { user, isAuthenticated } = useAuthStore();

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 3, bgcolor: "background.default" }}>
      <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center", maxWidth: 480 }}>
        <Typography variant="h1" color="primary" sx={{ fontWeight: 800 }}>404</Typography>
        <Typography variant="h5" component="h1">Không tìm thấy trang</Typography>
        <Typography color="text.secondary">
          Trang bạn đang tìm không tồn tại hoặc đã được di chuyển. Vui lòng kiểm tra lại đường dẫn.
        </Typography>
        <Button component={Link} to={isAuthenticated ? getDefaultRoute(user) : "/login"} variant="contained" replace>
          {isAuthenticated ? "Về trang chủ" : "Đến trang đăng nhập"}
        </Button>
      </Stack>
    </Box>
  );
};
