import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { Toaster } from "sonner";

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: { 
            zIndex: 99999,
            background: '#12121A',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            backdropFilter: 'blur(16px)',
          },
          classNames: {
            toast: "rounded-xl font-medium",
            title: "text-white font-semibold text-[15px]",
            description: "text-white/60",
            success: "text-[#C8FF00]",
            error: "text-[#FF6B6B]",
          }
        }}
      />
    </>
  );
}
