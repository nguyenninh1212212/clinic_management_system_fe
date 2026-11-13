import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth.store";
import { getDefaultRoute } from "./access-control";

export const HomeRedirect = () => {
  const user = useAuthStore((state) => state.user);
  return <Navigate to={getDefaultRoute(user)} replace />;
};
