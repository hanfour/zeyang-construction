import { useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Router from './router';
import { AuthProvider } from './contexts/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  useEffect(() => {
    AOS.init({
      duration: 1500,
      once: false,
      easing: 'ease-out-cubic',
      offset: 120,
    });
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <HashRouter>
          <AuthProvider>
            <Router />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: '#059669',
                  },
                },
                error: {
                  duration: 4000,
                  style: {
                    background: '#dc2626',
                  },
                },
              }}
            />
          </AuthProvider>
        </HashRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;