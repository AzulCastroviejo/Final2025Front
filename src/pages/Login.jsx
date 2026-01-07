import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // <-- 1. Importar el hook
import api from '../api';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await fetch(
      "https://final2025python-main.onrender.com/auth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString()
      }
    );

    if (!response.ok) {
      throw new Error("Credenciales incorrectas");
    }

    const data = await response.json();

    // 🔑 GUARDAR TOKEN
    localStorage.setItem("token", data.access_token);

    // 👤 OBTENER USUARIO
    const userRes = await fetch(
      "https://final2025python-main.onrender.com/clients/me",
      {
        headers: {
          "Authorization": `Bearer ${data.access_token}`
        }
      }
    );

    if (!userRes.ok) {
      throw new Error("No se pudo obtener el usuario");
    }

    const user = await userRes.json();

    // 🌍 Actualizar contexto global
    login(user);

    navigate('/');

  } catch (err) {
    setError('Error al iniciar sesión. Verifica tu email y contraseña.');
  } finally {
    setLoading(false);
  }
}
  
  return (
    
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-violet-500 bg-clip-text text-transparent mb-2">
            TechStore
          </h1>
          <p className="text-gray-400">Bienvenido de vuelta</p>
        </div>

        {/* Card de Login */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 border border-gray-700 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6">Iniciar Sesión</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <button 
                type="button"
                className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                'Iniciando sesión...'
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          {/* Registro */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              ¿No tienes una cuenta?{' '}
              <Link 
                to="/register" 
                className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
              >
                Regístrate
              </Link>
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}

