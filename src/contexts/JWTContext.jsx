import { createContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';

// project import
import axiosServices, { setAuthLogout } from 'utils/axios';

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //

const initialState = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'INIT': {
      const { isLoggedIn, user } = action.payload;
      return {
        ...state,
        isLoggedIn,
        isInitialized: true,
        user
      };
    }
    case 'LOGIN': {
      const { user } = action.payload;
      return {
        ...state,
        isLoggedIn: true,
        user
      };
    }
    case 'LOGOUT': {
      return {
        ...state,
        isLoggedIn: false,
        user: null
      };
    }
    case 'REGISTER': {
      const { user } = action.payload;
      return {
        ...state,
        isLoggedIn: true,
        user
      };
    }
    default: {
      return { ...state };
    }
  }
};

const JWTContext = createContext(null);

export const JWTProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // ensure axios uses the stored token
          axiosServices.defaults.headers.common.Authorization = `Bearer ${token}`;

          // Verify token by getting user info from backend /users/me/
          const response = await axiosServices.get('/users/me/');
          const user = response.data;

          dispatch({
            type: 'INIT',
            payload: {
              isLoggedIn: true,
              user
            }
          });
        } else {
          dispatch({
            type: 'INIT',
            payload: {
              isLoggedIn: false,
              user: null
            }
          });
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        localStorage.removeItem('authToken');
        delete axiosServices.defaults.headers.common.Authorization;
        dispatch({
          type: 'INIT',
          payload: {
            isLoggedIn: false,
            user: null
          }
        });
      }
    };

    init();
  }, []);

  const login = async (email, password) => {
    try {
      // SimpleJWT token endpoint on backend: /users/token/
      const tokenRes = await axiosServices.post('/users/token/', {
        // backend may expect 'username' or email depending on CustomUser configuration
        username: email,
        password
      });

      // SimpleJWT returns { access, refresh } by default
      const access = tokenRes.data.access || tokenRes.data.token;
      if (!access) throw new Error('No access token returned');

      localStorage.setItem('authToken', access);
      axiosServices.defaults.headers.common.Authorization = `Bearer ${access}`;

      // Fetch current user
      const meRes = await axiosServices.get('/users/me/');
      const user = meRes.data;

      dispatch({
        type: 'LOGIN',
        payload: { user }
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Login failed'
      };
    }
  };

  const register = async (email, password, firstName, lastName) => {
    try {
      // Register at backend /users/register/
      await axiosServices.post('/users/register/', {
        username: email,
        password,
        password2: password, // <-- include password2 to satisfy serializer validation
        first_name: firstName,
        last_name: lastName
      });

      // After registration, obtain tokens from /users/token/
      const tokenRes = await axiosServices.post('/users/token/', {
        username: email,
        password
      });

      const access = tokenRes.data.access || tokenRes.data.token;
      if (!access) throw new Error('No access token returned after register');

      localStorage.setItem('authToken', access);
      axiosServices.defaults.headers.common.Authorization = `Bearer ${access}`;

      // Fetch user profile
      const meRes = await axiosServices.get('/users/me/');
      const user = meRes.data;

      dispatch({
        type: 'REGISTER',
        payload: { user }
      });

      return { success: true };
    } catch (error) {
      // Log response body so you can inspect serializer validation messages
      console.error('Register error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message || 'Registration failed'
      };
    }
  };

  const logout = async () => {
    try {
      // No backend logout endpoint defined; just clear local state/tokens.
      // If you implement token blacklist on backend, call it here.
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      delete axiosServices.defaults.headers.common.Authorization;
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Register logout handler so axios can trigger context logout on 401
  setAuthLogout(logout);

  return (
    <JWTContext.Provider
      value={{
        ...state,
        login,
        logout,
        register
      }}
    >
      {children}
    </JWTContext.Provider>
  );
};

JWTProvider.propTypes = {
  children: PropTypes.node
};

export default JWTContext;