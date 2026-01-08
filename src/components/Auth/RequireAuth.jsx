import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


const RequireAuth = ({ children }) => {
  const location = useLocation();
  let token;

  // try {
    token = localStorage.getItem("token");

    if (!token) {
      return <Navigate to="/login" state={{ from: location }} replace />;

    }

    // // Decode the token to check if it is valid and not expired
    const decoded  = jwtDecode(token);

    // Check if the token is expired
    if (decoded .exp * 1000 < Date.now()) {
      localStorage.removeItem("token");

      // Redirect to the login page
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Proceed to render the children if token is valid
    return children;
  
};

export default RequireAuth;

