import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getTokenExpiration, isAccessTokenValid, logout } from "../redux/slices/authSlice";

const ProtectedRoute = ({ roles }) => {
  const { accessToken, isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const location = useLocation();
  const tokenIsValid = isAuthenticated && isAccessTokenValid(accessToken);

  useEffect(() => {
    if (!tokenIsValid) {
      dispatch(logout());
      return undefined;
    }

    const expiration = getTokenExpiration(accessToken) * 1000;
    const timeout = window.setTimeout(
      () => dispatch(logout()),
      Math.max(expiration - Date.now(), 0),
    );

    return () => window.clearTimeout(timeout);
  }, [accessToken, dispatch, tokenIsValid]);

  if (!tokenIsValid)
    return <Navigate to="/login" replace state={{ from: location }} />;

  if (roles?.length && !roles.includes(user?.role?.toUpperCase()))
    return <Navigate to="/unauthorized" replace />;
  
  return <Outlet />;
};
export default ProtectedRoute;
