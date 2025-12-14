import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// project import
import useAuth from 'hooks/useAuth';

// ==============================|| ADMIN GUARD ||============================== //

const AdminGuard = ({ children }) => {
  const { isLoggedIn, isInitialized, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitialized) {
      if (!isLoggedIn) {
        // Not logged in - redirect to login
        navigate('/login', { replace: true });
      } else if (!user?.is_staff) {
        // Logged in but not admin - redirect to home
        navigate('/', { replace: true });
      }
    }
  }, [isInitialized, isLoggedIn, user, navigate]);

  // Wait until initialized
  if (!isInitialized) return null;

  // Only render children if logged in AND is staff
  if (!isLoggedIn || !user?.is_staff) return null;

  return children;
};

AdminGuard.propTypes = {
  children: PropTypes.node
};

export default AdminGuard;