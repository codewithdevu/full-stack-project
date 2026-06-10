import axios from "axios";

// 1. 🟢 PRODUCTION-READY BASE_URL LOGIC WITH YOUR ACTUAL BACKEND URL:
// Local machine par chalte waqt local port hit karega, Vercel cloud par jaate hi aapki original backend url pakad lega!
const BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000/api/v1" 
    : "https://divyansh-tube-api.vercel.app/api/v1"; // 🚀 FIXED: Aapki actual live Vercel backend url inject kar di hai!

const apiClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Cookies read/write cross-origin support active karega
});

let navigateRef = null;

export const setupInterceptor = (navigate) => {
    navigateRef = navigate; 
};

// Redirect helper to prevent redundant code
const redirectToLogin = () => {
    if (navigateRef) {
        navigateRef("/login");
    } else {
        window.location.href = "/login";
    }
};

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 1. Agar refresh token ka route hi fail ho gaya h, toh seedha login par pheko, no retry!
        if (originalRequest?.url && originalRequest.url.includes("/users/refresh-token")) {
            console.log("Refresh token request failed. Redirecting to login.");
            redirectToLogin();
            return Promise.reject(error);
        }

        // 2. Agar 401 Unauthorized aaya h aur pehle retry nahi kiya h
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                console.log("Refreshing token securely...");
                
                // secure baseline call directly hitting core instance axios structure
                await axios.post(`${BASE_URL}/users/refresh-token`, {}, {
                    withCredentials: true // Cookies delivery support over proxy network
                });
                
                console.log("Token refreshed successfully! Retrying original request...");
                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error("Refresh token expired or failed. Redirecting to login.");
                redirectToLogin();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// 🟢 PERMANENT SAFEGUARD: Default aur Named dono exports ek sath de do!
// Isse humare kisi bhi page me curly braces { apiClient } lga ho ya na lga ho, crash nahi hoga!
export { apiClient };
export default apiClient;