import { useContext } from 'react';
import JWTContext from 'contexts/JWTContext';

// ==============================|| AUTH HOOKS ||============================== //

const useAuth = () => {
  const context = useContext(JWTContext);

  if (!context) throw new Error('useAuth must be used within JWTProvider');

  return context;
};

export default useAuth;