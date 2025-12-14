import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';

const rtlCache = createCache({
  key: 'muirtl',
  stylisPlugins: [rtlPlugin]
});

const RTLLayout = ({ children }) => (
  <CacheProvider value={rtlCache}>
    {children}
  </CacheProvider>
);

export default RTLLayout;
