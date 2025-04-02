import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const ProtectedVerifyRoute = ({ children }) => {
    const isVerified = useAuthStore((state) => state.isVerified);

    return isVerified ? <Navigate to="/dashboard" /> : children;
};

export default ProtectedVerifyRoute;
