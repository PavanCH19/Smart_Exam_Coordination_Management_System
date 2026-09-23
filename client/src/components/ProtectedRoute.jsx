import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ roles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated)
    return <Navigate to="/login" replace state={{ from: location }} />;

  if (roles?.length && !roles.includes(user?.role?.toUpperCase()))
    return <Navigate to="/unauthorized" replace />;
  
  return <Outlet />;
};
export default ProtectedRoute;
