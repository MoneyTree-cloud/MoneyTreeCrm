import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools } from "zustand/middleware";
import { decryptLocalStorageItem, encryptAndStore } from "../components/Common/CryptoUtils";

// Utility to shuffle an array in place
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// 🔄 Async version of initial state loader
const getInitialUserState = async () => {
  const accessToken = await decryptLocalStorageItem("accessToken");
  const role = await decryptLocalStorageItem("role");
  const userId = await decryptLocalStorageItem("userId");
  const userName = await decryptLocalStorageItem("userName");
  const isNew = await decryptLocalStorageItem("isNew");
  const profileImage = await decryptLocalStorageItem("profileImage");
  const mobileNo = await decryptLocalStorageItem("mobileNo");
  const showRevanueLink = await decryptLocalStorageItem("showRevanueLink");
  const emailId = await decryptLocalStorageItem("emailId");
  const empCode = await decryptLocalStorageItem("empCode");
  const reporingTo = await decryptLocalStorageItem("reporingTo");
  const mainTlName = await decryptLocalStorageItem("mainTlName");
  const mainTeam = await decryptLocalStorageItem("mainTeam");
  const subTlName = await decryptLocalStorageItem("subTlName");
  const subTeam = await decryptLocalStorageItem("subTeam");
  const level = await decryptLocalStorageItem("level");
  const branchManager = await decryptLocalStorageItem("branchManager");
  const mainTl = await decryptLocalStorageItem("mainTl");
  const subTl = await decryptLocalStorageItem("subTl");
  const firstTimeLogin = await decryptLocalStorageItem("firstTimeLogin");
  const ivrCallStatus = await decryptLocalStorageItem("ivrCallStatus");
  const locationName = await decryptLocalStorageItem("locationName");
  const parentUserId = await decryptLocalStorageItem("parentUserId");
  const departmentName = await decryptLocalStorageItem("departmentName");
  const parentId = await decryptLocalStorageItem("parentId");

  return {
    isAuthenticated: Boolean(accessToken),
    userId,
    userName,
    profileImage,
    mobileNo,
    sidebar: {},
    isLogoutModal: false,
    showRevanueLink,
    emailId,
    empCode,
    reporingTo,
    mainTlName,
    mainTeam,
    subTlName,
    subTeam,
    level,
    branchManager,
    mainTl,
    subTl,
    role,
    isNew: isNew === "false" ? false : undefined,
    firstTimeLogin,
    ivrCallStatus,
    locationName,
    parentUserId,
    departmentName,
    parentId
  };
};

export const useUserStore = create(
  devtools(
    immer((set) => ({
      user: {
        isAuthenticated: false,
        sidebar: {},
        isInitialized: false,
        isLogoutModal: false,
      },

      // 🔁 Call this during app load
      initializeUser: async () => {
        const user = await getInitialUserState();
        set((state) => {
          state.user = {
            ...user,
            isInitialized: true,
          };
        });
      },

      login: async (token) => {
        // Prepare keys and values
        const entries = Object.entries(token).filter(([k, v]) => v != null);

        // Shuffle entries array
        const shuffledEntries = shuffleArray(entries);

        for (const [key, value] of shuffledEntries) {
          // Skip "isNew" if false (your original logic)
          if (key === "isNew" && value === false) continue;
          await encryptAndStore(key, value);
        }

        set((state) => {
          state.user = {
            ...state.user,
            isAuthenticated: true,
            isNew: token.isNew === false ? false : undefined,
            isInitialized: true,
          };
        });
      },

      logout: () =>
        set((state) => {
          localStorage.clear();
          sessionStorage.removeItem("hasLoaded");
          state.user = {
            isAuthenticated: false,
            sidebar: {},
            isInitialized: false,
            isLogoutModal: false,
          };
          window.location.href = "/login";
        }),

      selfPasswordChangeSuccess: () =>
        set((state) => {
          localStorage.removeItem("isNew");
          state.user = {
            sidebar: {},
            isAuthenticated: false,
            isNew: false,
          };
        }),

      setUser: async (user) => {
        // Get keys with non-null values, shuffle them
        const keys = Object.keys(user).filter((k) => user[k] != null);
        const shuffledKeys = shuffleArray(keys);

        for (const key of shuffledKeys) {
          await encryptAndStore(key, user[key]);
        }

        set((state) => {
          state.user = {
            ...state.user,
            ...user,
          };
        });
      },

      logoutUserModal: (isOpen = true) =>
        set((state) => {
          state.user.isLogoutModal = isOpen;
        }),
    })),
    { name: "user" }
  )
);
