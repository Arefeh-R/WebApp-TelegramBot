import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// project import
import useAuth from 'hooks/useAuth';

// ==============================|| ADMIN GUARD ||============================== //

const AdminGuard = ({ children }) => {
  const { isLoggedIn, isInitialized, user } = useAuth();
  const navigate = useNavigate();

  // Check if user is admin (Site Admin)
  const isAdmin = user?.user_type === 'SA';

  useEffect(() => {
    if (isInitialized) {
      if (!isLoggedIn) {
        // Not logged in - redirect to login
        navigate('/login', { replace: true });
      } else if (!isAdmin) {
        // Logged in but not admin - redirect to home
        navigate('/', { replace: true });
      }
    }
  }, [isInitialized, isLoggedIn, isAdmin, navigate]);

  // Wait until initialized
  if (!isInitialized) return null;

  // Only render children if logged in AND is admin
  if (!isLoggedIn || !isAdmin) return null;

  return children;
};

AdminGuard.propTypes = {
  children: PropTypes.node
};

export default AdminGuard;