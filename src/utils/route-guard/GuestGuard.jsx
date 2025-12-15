import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// project import
import useAuth from 'hooks/useAuth';

// ==============================|| GUEST GUARD ||============================== //

const GuestGuard = ({ children }) => {
  const { isLoggedIn, isInitialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitialized && isLoggedIn) {
      navigate('/dashboard/books', { replace: true });
    }
  }, [isInitialized, isLoggedIn, navigate]);

  if (!isInitialized) return null;

  return children;
};

GuestGuard.propTypes = {
  children: PropTypes.node
};

export default GuestGuard;