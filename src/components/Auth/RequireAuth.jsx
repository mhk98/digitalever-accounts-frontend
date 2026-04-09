import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import {
  canAccessPath,
  subscribeToPermissionChanges,
} from "../../utils/navigationPermissions";

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const [permissionVersion, setPermissionVersion] = useState(0);
  let token;

  useEffect(() => {
    return subscribeToPermissionChanges(() =>
      setPermissionVersion((prev) => prev + 1),
    );
  }, []);

  try {
    token = localStorage.getItem("token");

    if (!token) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Decode the token to check if it is valid and not expired
    const decoded = jwtDecode(token);

    // Check if the token is expired
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      localStorage.clear();
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const userRole = localStorage.getItem("role") || "user";
    const hasMenuAccess = canAccessPath(userRole, location.pathname);

    if (!hasMenuAccess) {
      return <Navigate to="/" replace state={{ from: location, permissionVersion }} />;
    }

    // Proceed to render the children if token is valid
    return children;
  } catch (error) {
    console.error("Token validation error:", error);
    localStorage.removeItem("token");
    localStorage.clear();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

};

export default RequireAuth;
