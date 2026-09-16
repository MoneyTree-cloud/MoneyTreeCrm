import axios from "axios";
import { useUserStore } from "../store/useUserStore";
import { decryptLocalStorageItem } from "../components/Common/CryptoUtils";

export const getLoggedinUser = () => {
  const user = localStorage.getItem("accessToken");
  if (!user) {
    return null;
  } else {
    return JSON.parse(user);
  }
};

// *************UAT***************
export const imageBaseUrl = "https://frontendcrmuat.moneytreerealty.com/attachment/";

export const hrImageBaseUrl = 'https://frontendcrmuat.moneytreerealty.com/hrattachment/';

const baseURL = "https://backendcrmuat.moneytreerealty.com/";

export const htmlBaseURL = "https://frontendcrmuat.moneytreerealty.com/events";


// *************LIVE***************
// export const imageBaseUrl = "https://assetstorage.moneytreerealty.com/media/";

// export const hrImageBaseUrl = 'https://assetstorage.moneytreerealty.com/hrfiles/';

// const baseURL = "https://backendcrm.moneytreerealty.com/";

// export const htmlBaseURL = "https://assetstorage.moneytreerealty.com/media";

export const assetImageBaseUrl = 'https://assetstorage.moneytreerealty.com/media/';


const facebookApiUrl = 'https://leads.moneytreerealty.com/'

// Create an axios instance
export const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const facebookApiClient = axios.create({
  baseURL: facebookApiUrl
});

export const enquiryApiClient = axios.create({
  baseURL: baseURL
});

enquiryApiClient.defaults.headers.common["api-key"] = "HfgRSgZEoZMQSBflZsDj6yUqLebCRxYigJuYik38gAM=";

const controller = new AbortController();

const ApiClient = axios.create({
  baseURL,
  signal: controller.signal,
  // withCredentials: true
});

const getAccessToken = async () => {
  const decryptedToken = await decryptLocalStorageItem("accessToken");
  return decryptedToken;
};

// Attach the access token to every request
ApiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// 🚨 Interceptor to handle expired tokens
let logoutTriggered = false; // ✅ prevent multiple alerts/logouts
// Interceptor to handle expired tokens
ApiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    if ((status === 401 || status === 403) && !logoutTriggered) {
      // useUserStore.getState().logoutUserModal();
      useUserStore.getState().logout();
      logoutTriggered = true;
      alert("Session Ended. You Have Been Logged Out. Please Log In Again to Continue.");

    }
    return Promise.reject(error);
  }
);

export default ApiClient;
