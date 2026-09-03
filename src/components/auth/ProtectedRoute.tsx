import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';
import { routes } from '../../config/routes';

const ProtectedRoute = () => {
  const status = useSelector((state: RootState) => state.auth.status);

  if (status === 'authenticated') {
    return <Outlet />;
  }

  return <Navigate to={routes.auth.login} replace />;
};

export default ProtectedRoute;
