import axios from "axios";

// 1. 🟢 UNIVERSAL BASE_URL LOGIC FOR LOCAL & PRODUCTION:
// Local machine par backend port 8000 target karega, production deployment par aapka dynamic Render cluster hit hoga!
const BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000/api/v1" 
    : "https://divyansh-tube-api.onrender.com/api/v1"; 
    
const apiClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // 🍪 Cross-Origin Cookie delivery mechanism support active!
});

let navigateRef = null;

// Interceptor routing helper to inject react-router-dom navigation dynamically
export const setupInterceptor = (navigate) => {
    navigateRef = navigate; 
};

// Centralized Redirect handler to prevent cyclic rendering crashes
const redirectToLogin = () => {
    if (navigateRef) {
        navigateRef("/login");
    } else {
        window.location.href = "/login";
    }
};

// 2. ⚡ SILENT JWT ACCESS-TOKEN REFRESH INTERCEPTOR ARCHITECTURE:
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Trace Exception 1: Agar refresh token api endpoint khud hi break/fail ho jaye -> Force Exit!
        if (originalRequest?.url && originalRequest.url.includes("/users/refresh-token")) {
            console.error("⛔ [Auth Error]: Refresh token hierarchy expired. Evicting user context.");
            redirectToLogin();
            return Promise.reject(error);
        }

        // Trace Exception 2: Catching 401 Unauthorized errors and retrying on first handshake drop
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Flagging to secure against recursive infinite network loops

            try {
                console.log("🔄 [Auth Buffer]: Securely refreshing access token node streams...");
                
                // Pure independent baseline axios instance call to trigger secure cookie extraction
                await axios.post(`${BASE_URL}/users/refresh-token`, {}, {
                    withCredentials: true 
                });
                
                console.log("✨ [Auth Buffer]: Tokens refreshed successfully! Resending original pipeline request...");
                return apiClient(originalRequest); // Retrying original payload with fresh cookies authorization
            } catch (refreshError) {
                console.error("❌ [Auth Buffer]: Secondary authentication handshake failed. Redirecting to login.");
                redirectToLogin();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// 3. 🛡️ PERMANENT SAFEGUARD MULTI-EXPORT PATTERN:
// Default aur Named exports ek sath de diye hain taaki project me 'import apiClient' ya '{ apiClient }' kuch bhi use ho, server crash na ho!
export { apiClient };
export default apiClient;