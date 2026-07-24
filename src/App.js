import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Routes from "./Routes/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./assets/scss/theme.scss";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUserStore } from "./store/useUserStore";
import ModalLogout from "./helpers/ModalLogout";
// import DisableActions from "./components/DisableActions";
import ScreenLoader from "./constants/ScreenLoader";
import FloatingChatWidget from "./Pages/Activity/FloatingChatWidget";

export const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const empCode = useUserStore((state) => state?.user?.empCode);
  // Add other routes here if needed
  const hideChatWidget = ["/login"].includes(location.pathname);

  return (
    <>
      {/* <DisableActions /> */}
      <Routes />
      {empCode && !hideChatWidget && <FloatingChatWidget />}
    </>
  );
}

function App() {
  const isLogoutModal = useUserStore((state) => state.user.isLogoutModal);
  const isInitialized = useUserStore((state) => state.user.isInitialized);
  const initializeUser = useUserStore((state) => state.initializeUser);

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  if (!isInitialized) {
    return <ScreenLoader />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      {isLogoutModal && <ModalLogout />}

      <AppContent />

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
        pauseOnFocusLoss
        rtl={false}
      />
    </QueryClientProvider>
  );
}

export default App;