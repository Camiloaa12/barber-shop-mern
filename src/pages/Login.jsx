"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import apiClient from "../api/apiClient"
import { Scissors } from "lucide-react"

export const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await apiClient.post("/auth/login", { email, password })
      login(response.data.user, response.data.token)

      if (response.data.user.role === "admin") {
        navigate("/admin/dashboard")
      } else {
        navigate("/barber/dashboard")
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] p-4">
      <div className="w-full max-w-md bg-[#1a1a1a] rounded-2xl shadow-2xl border border-[#333] overflow-hidden">
        <div className="p-8 text-center border-b border-[#333]">
          <div className="w-16 h-16 bg-[#d4a574] rounded-full flex items-center justify-center mx-auto mb-4 text-black shadow-lg shadow-[#d4a574]/20">
            <Scissors size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wide">BARBER SHOP</h1>
          <p className="text-[#d4a574] text-sm tracking-widest uppercase mt-1">Professional Management</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 text-red-400 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#333] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#d4a574] focus:ring-1 focus:ring-[#d4a574] transition-all"
                placeholder="barbero@ejemplo.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#2a2a2a] border border-[#333] rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-[#d4a574] focus:ring-1 focus:ring-[#d4a574] transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d4a574] hover:bg-[#c19a5e] text-black font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#d4a574]/20"
            >
              {loading ? "Iniciando..." : "INGRESAR"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              ¿No tienes cuenta?{" "}
              <a href="/register" className="text-[#d4a574] font-medium hover:underline">
                Regístrate aquí
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
