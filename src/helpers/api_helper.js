import axios from "axios";
import { useUserStore } from "../store/useUserStore";
import { decryptLocalStorageItem } from "../components/Common/CryptoUtils";
// axios.defaults.headers.common["ngrok-skip-browser-warning"] ="skip-browser-warning";

export const getLoggedinUser = () => {
  const user = localStorage.getItem("accessToken");
  if (!user) {
    return null;
  } else {
    return JSON.parse(user);
  }
};

// *************UAT***************
// export const imageBaseUrl = "https://frontenduat.moneytreerealty.com/attachment/";

// export const hrImageBaseUrl = 'https://frontenduat.moneytreerealty.com/hrattachment/';

// const baseURL = "https://backenduat.moneytreerealty.com/";

// export const htmlBaseURL = "https://frontenduat.moneytreerealty.com/events";

// *************LIVE***************
// export const imageBaseUrl = "https://sap.moneytreerealty.com/attachment/";

// export const hrImageBaseUrl = 'https://sap.moneytreerealty.com/hrattachment/';

// const baseURL = "https://backend.moneytreerealty.com/";

// export const htmlBaseURL = "https://sap.moneytreerealty.com/events";

//CRM
// export const imageBaseUrl = "https://crm.moneytreerealty.com/attachment/";

// export const hrImageBaseUrl = 'https://crm.moneytreerealty.com/hrattachment/';

const baseURL = "https://backendcrm.moneytreerealty.com/";

export const htmlBaseURL = "https://crm.moneytreerealty.com/events";

// *************LIVE 2025***************
// export const imageBaseUrl = "https://sap2025.moneytreerealty.com/attachment/";

// export const hrImageBaseUrl = 'https://sap2025.moneytreerealty.com/hrattachment/';

// const baseURL = "https://backend2025.moneytreerealty.com/";

//LOCAL
// export const imageBaseUrl = "https://lsap.moneytreerealty.com/attachment/";

// export const hrImageBaseUrl = 'https://lsap.moneytreerealty.com/hrattachment/';

// const baseURL = "https://lsapbackend.moneytreerealty.com/";

//AWS
export const imageBaseUrl = "https://assetstorage.moneytreerealty.com/media/";

export const hrImageBaseUrl = 'https://assetstorage.moneytreerealty.com/hrfiles/';

// const baseURL = "https://backend.moneytreerealty.com/";

// export const htmlBaseURL = "https://assetstorage.moneytreerealty.com/media";

export const assetImageBaseUrl = 'https://assetstorage.moneytreerealty.com/media/';

// export const assetImageBaseUrl = 'https://asset.moneytreerealty.com/';

//*************Bank and PAN Verification*************
// const verificationApiUrl = 'https://complianceapi.balajimariline.com/v1/utility/'

const facebookApiUrl = 'https://leads.moneytreerealty.com/'

// Create an axios instance
export const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// export const verificationApiClient = axios.create({
//   baseURL: verificationApiUrl,
//   headers: {
//     "Content-Type": "application/json",
//     "x-auth-token": "96f5bca294b3281b6761a2c0aa952b6b01d80b8b163eb905f4e0d54fd26f0d60",
//   },
// });

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
