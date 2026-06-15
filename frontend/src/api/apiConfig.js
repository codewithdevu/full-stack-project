import axios from "axios";

// 1. 🟢 UNIVERSAL BASE_URL LOGIC FOR LOCAL & PRODUCTION:
const BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:8000/api/v1" 
    : "https://divyansh-tube-api.onrender.com/api/v1"; 
    
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
});

let navigateRef = null;

// Interceptor routing helper to inject react-router-dom navigation dynamically
export const setupInterceptor = (navigate) => {
    navigateRef = navigate; 
};

// Centralized Redirect handler to prevent cyclic rendering crashes
const redirectToLogin = () => {
    // Evict expired or broken tokens on systemic failure
    localStorage.removeItem("accessToken");
    if (navigateRef) {
        navigateRef("/login");
    } else {
        window.location.href = "/login";
    }
};

// 2. 🛡️ REQUEST INTERCEPTOR: Automatically injects bearer tokens directly through authorization headers
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            // Header parsing syntax matching backend regex replacement schema
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. ⚡ SILENT JWT ACCESS-TOKEN REFRESH INTERCEPTOR ARCHITECTURE (HEADER BASED):
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // 🔥 Check both patterns to ensure it doesn't loop infinitely on refresh endpoint
        if (originalRequest?.url && (originalRequest.url.includes("/users/refresh-token") || originalRequest.url.includes("/refresh-token"))) {
            console.error("⛔ [Auth Error]: Refresh token hierarchy expired. Evicting user context.");
            redirectToLogin();
            return Promise.reject(error);
        }

        // Trace Exception 2: Catching 401 Unauthorized errors and retrying on first handshake drop
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Flagging to secure against recursive infinite network loops

            try {
                console.log("🔄 [Auth Buffer]: Securely refreshing access token node streams via custom api packets...");
                
                // Get old access token to present for validation if backend schema demands it
                const oldToken = localStorage.getItem("accessToken");
                
                // Pure independent baseline axios instance call to trigger refresh token response payload
                const response = await axios.post(`${BASE_URL}/users/refresh-token`, {}, {
                    headers: {
                        Authorization: `Bearer ${oldToken}`
                    }
                });
                
                // Extract fresh token parameters from JSON payload mapping
                const newAccessToken = response.data?.data?.accessToken || response.data?.accessToken;
                
                if (newAccessToken) {
                    console.log("✨ [Auth Buffer]: Tokens refreshed successfully! Updating localStorage nodes...");
                    localStorage.setItem("accessToken", newAccessToken);
                    
                    // Rewrite original request headers configuration parameters block on the fly
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return apiClient(originalRequest); // Retrying original payload with fresh authorization headers
                } else {
                    throw new Error("Access token could not be fetched from validation response schema.");
                }
            } catch (refreshError) {
                console.error("❌ [Auth Buffer]: Secondary authentication handshake failed. Redirecting to login.");
                redirectToLogin();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// 4. 🛡️ PERMANENT SAFEGUARD MULTI-EXPORT PATTERN:
export { apiClient };
export default apiClient;