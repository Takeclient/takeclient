import { Toaster } from 'react-hot-toast';

export default function WhatsAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#059669',
            },
          },
          error: {
            style: {
              background: '#dc2626',
            },
          },
        }}
      />
      {children}
    </>
  );
} 