import { useEffect } from "react";
import Routes from "./Routes/index";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./assets/scss/theme.scss";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useUserStore } from "./store/useUserStore";
import ModalLogout from "./helpers/ModalLogout";
import DisableActions from "./components/DisableActions";
import ScreenLoader from "./constants/ScreenLoader";

export const queryClient = new QueryClient();

function AppContent() {
  return (
    <>
      <DisableActions />
      <Routes />
      {/* {empCode &&  <FloatingChatWidget />} */}
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