import axios from "axios";
import { API_BASE_URL } from "../config/api";

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("API error:", error?.response?.data || error.message);
    return Promise.reject(error);
  }
);