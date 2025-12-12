import { RouterProvider } from 'react-router-dom';

// project imports
import router from 'routes';
import ThemeCustomization from 'themes';

import ScrollTop from 'components/ScrollTop';
import { JWTProvider } from 'contexts/JWTContext'; // added

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {
  return (
      <ThemeCustomization>
        <ScrollTop>
          <JWTProvider>
          <RouterProvider router={router} />
          </JWTProvider>
        </ScrollTop>
      </ThemeCustomization>
    
  );
}
