import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import './print.css';

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import store from './redux/store.ts';
import { ThemeContextProvider } from './theme/ThemeContextProvider.tsx';
import { apiClient } from './services/apiClient.ts';
import { sessionExpired } from './redux/slices/authSlice.ts';

// Registered here rather than inside apiClient to avoid an import cycle.
apiClient.setOnUnauthorized(() => {
  store.dispatch(sessionExpired());
});

// A data router, because the unsaved-work guard's useBlocker needs one. App keeps
// its own routes, so they can depend on the auth state.
const router = createBrowserRouter([{ path: '*', element: <App /> }]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeContextProvider>
      <Provider store={store}>
        <RouterProvider router={router} />
        <ToastContainer autoClose={3000} />
      </Provider>
    </ThemeContextProvider>
  </StrictMode>
);
