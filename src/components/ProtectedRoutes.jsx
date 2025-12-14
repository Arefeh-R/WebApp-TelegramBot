// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const user = useAuth(); 
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (requireAdmin && !user.is_staff) {
    return <Navigate to="/" />;
  }
  
  return children;
};
export default ProtectedRoute;