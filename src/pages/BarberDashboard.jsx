"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { CutForm } from "../components/CutForm"
import { CutsList } from "../components/CutsList"
import apiClient from "../api/apiClient"
import { DashboardLayout } from "../layouts/DashboardLayout"
import { Scissors, DollarSign, Clock } from "lucide-react"

export const BarberDashboard = () => {
  const navigate = useNavigate()
  const [cuts, setCuts] = useState([])
  const [loading, setLoading] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  // Daily quick stats
  const [dailyTotal, setDailyTotal] = useState(0)
  const [dailyCount, setDailyCount] = useState(0)

  useEffect(() => {
    fetchCuts()
  }, [selectedDate, refreshTrigger])

  const fetchCuts = async () => {
    setLoading(true)
    try {
      const startOfDay = new Date(selectedDate)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(selectedDate)
      endOfDay.setHours(23, 59, 59, 999)

      const response = await apiClient.get("/cuts", {
        params: {
          startDate: startOfDay.toISOString(),
          endDate: endOfDay.toISOString(),
        },
      })
      const data = response.data
      setCuts(data)

      // Calculate quick stats locally for immediate feedback
      const total = data.reduce((sum, cut) => sum + cut.amount, 0)
      setDailyTotal(total)
      setDailyCount(data.length)

    } catch (err) {
      console.error("Error al cargar cortes:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleCutAdded = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  // Format currency to COP
  const formatCOP = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <DashboardLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 w-full max-w-7xl mx-auto">
        {/* Left Column: Action (Register Cut) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#333] shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#d4a574] rounded-lg text-black">
                <Scissors size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Nuevo Corte</h2>
                <p className="text-sm text-gray-400">Registra un servicio</p>
              </div>
            </div>

            {/* Pass formatCOP if CutForm needs it, or handle inside */}
            <CutForm onCutAdded={handleCutAdded} />
          </div>

          {/* Quick Daily Summary Card */}
          <div className="bg-gradient-to-br from-[#d4a574] to-[#b08d55] p-6 rounded-xl shadow-lg text-black">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Clock size={20} /> Resumen de Hoy
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium opacity-80">Cortes</p>
                <p className="text-3xl font-bold">{dailyCount}</p>
              </div>
              <div>
                <p className="text-sm font-medium opacity-80">Ingresos</p>
                <p className="text-3xl font-bold">{formatCOP(dailyTotal)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: List (History) */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <div className="bg-[#1a1a1a] rounded-xl border border-[#333] shadow-xl flex-1 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-[#333] flex justify-between items-center bg-[#222]">
              <h2 className="text-xl font-bold text-white">Cortes Realizados</h2>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-[#333] text-white px-4 py-2 rounded-lg border border-[#444] focus:outline-none focus:border-[#d4a574]"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {loading ? (
                <div className="flex justify-center items-center h-full text-gray-500">
                  Cargando...
                </div>
              ) : cuts.length === 0 ? (
                <div className="flex flex-col justify-center items-center h-full text-gray-500 opacity-50">
                  <Scissors size={48} className="mb-2" />
                  <p>No hay cortes registrados hoy</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cuts.map((cut) => (
                    <div key={cut._id} className="bg-[#252525] p-4 rounded-lg border border-[#333] flex justify-between items-center hover:border-[#d4a574] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center text-[#d4a574] font-bold">
                          {cut.clientName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-bold">{cut.clientName} {cut.clientLastName}</p>
                          <p className="text-xs text-gray-400 capitalize">{cut.service || "Corte Regular"} • {cut.paymentMethod}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[#d4a574] font-bold text-lg">{formatCOP(cut.amount)}</p>
                        <p className="text-xs text-gray-500">{new Date(cut.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
