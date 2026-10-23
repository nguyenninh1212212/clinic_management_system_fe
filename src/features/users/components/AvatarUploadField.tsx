import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import { Alert, Avatar, Button, Typography } from "@mui/material";
import React, { useId, useRef, useState } from "react";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface AvatarUploadFieldProps {
  value?: string;
  name?: string;
  disabled?: boolean;
  onChange: (file: File, preview: string) => void;
}

export const AvatarUploadField: React.FC<AvatarUploadFieldProps> = ({
  value,
  name,
  disabled = false,
  onChange,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [error, setError] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("Ảnh đại diện phải có dung lượng tối đa 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onChange(file, reader.result as string);
      setError("");
    };
    reader.onerror = () => setError("Không thể đọc ảnh đã chọn. Vui lòng thử lại.");
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar
        src={value}
        alt={name || "Ảnh đại diện"}
        sx={{ width: 72, height: 72, bgcolor: "primary.main" }}
      >
        {name?.charAt(0).toUpperCase() || "?"}
      </Avatar>
      <div className="space-y-1">
        <Typography variant="body2" className="font-medium">
          Ảnh đại diện
        </Typography>
        <Typography variant="caption" color="text.secondary" className="block">
          JPG, PNG hoặc WEBP, tối đa 2 MB.
        </Typography>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />
        <Button
          size="small"
          variant="outlined"
          startIcon={<PhotoCameraOutlinedIcon />}
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          {value ? "Thay ảnh" : "Tải ảnh lên"}
        </Button>
        {error && <Alert severity="error" className="mt-2">{error}</Alert>}
      </div>
    </div>
  );
};
