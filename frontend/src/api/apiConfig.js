import axios from "axios";

// Base URL configuration
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const apiClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
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
                
                // CRITICAL FIX: Loop se bachne ke liye plain axios ka use karein, apiClient ka nahi!
                await axios.post(`${BASE_URL}/users/refresh-token`, {}, {
                    withCredentials: true // Vercel par cookie send karne ke liye zaroori h
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

export default apiClient;