import axios from "axios";

const apiBaseUrl =
  process.env.REACT_APP_API_BASE_URL?.trim() || "/api";

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
