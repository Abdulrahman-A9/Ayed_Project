import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";
const ACCESS_TOKEN_KEY = "portfolio_admin_access_token";

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export const adminApi = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

adminApi.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await axios.post(`${API_BASE}/auth/refresh/`, {}, { withCredentials: true });
        setAccessToken(refreshResponse.data.access);
        originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access}`;
        return adminApi(originalRequest);
      } catch {
        clearAccessToken();
      }
    }
    return Promise.reject(error);
  },
);

export async function login(credentials: { username: string; password: string }) {
  const response = await adminApi.post("/auth/login/", credentials);
  setAccessToken(response.data.access);
  return response.data;
}

export async function logout() {
  try {
    await adminApi.post("/auth/logout/");
  } finally {
    clearAccessToken();
  }
}

export async function getCurrentUser() {
  const response = await adminApi.get("/auth/me/");
  return response.data;
}