import axios from "axios";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1",
    withCredentials: true,
});

let navigateRef = null;

export const setupInterceptor = (navigate) => {
    navigateRef = navigate; 
};


apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (originalRequest?.url && originalRequest.url.includes("/users/refresh-token")) {
            console.log("Refresh token request failed. Redirecting to login.");
            if (navigateRef) {
                navigateRef("/login");
            } else {
                window.location.href = "/login";
            }
            return Promise.reject(error);
        }

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                console.log("Refreshing token...");
                await apiClient.post("/users/refresh-token");
                
                console.log("Token refreshed successfully! Retrying original request...");
                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error("Refresh token expired. Redirecting to login.");

                if (navigateRef) {
                    navigateRef("/login");
                } else {
                    window.location.href = "/login";
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;