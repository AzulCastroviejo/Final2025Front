import axios from 'axios'

// IMPORTANTE: Cambia esta URL a tu backend real
const URL_BASE = 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: URL_BASE,
  headers: { 
    'Content-Type': 'application/json'
  },
  timeout: 10000, // 10 segundos
})

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  response => response,
  error => {
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    
    // Mostrar mensaje de error amigable
    const message = error.response?.data?.detail || 
                   error.response?.data?.message || 
                   'Error en la conexión con el servidor'
    
    console.error('API Error:', message)
    return Promise.reject(error)
  }
)

export default api