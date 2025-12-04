import axios, { type AxiosInstance } from "axios"

const api: AxiosInstance = axios.create({
  baseURL: "/api",
  withCredentials: true,
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("authToken")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export const authApi = {
  signup: (data: {
    name: string
    email: string
    password: string
    role: "user" | "provider"
    phone: string
  }) => api.post("/auth/signup", data),

  login: (email: string, password: string) => api.post("/auth/login", { email, password }),

  getMe: () => api.get("/auth/me"),
}

export default api
