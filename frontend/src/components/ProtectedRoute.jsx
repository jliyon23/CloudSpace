import { Navigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = useAuthStore((state) => state.token);

    return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
