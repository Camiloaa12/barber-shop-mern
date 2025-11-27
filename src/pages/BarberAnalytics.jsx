import { useState, useEffect } from "react"
import apiClient from "../api/apiClient"
import { DashboardLayout } from "../layouts/DashboardLayout"
import {
    DollarSign,
    Scissors,
    TrendingUp,
    Calendar,
    CreditCard
} from "lucide-react"

export const BarberAnalytics = () => {
    const [timeRange, setTimeRange] = useState("month")
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [timeRange])

    const fetchStats = async () => {
        setLoading(true)
        try {
            const response = await apiClient.get("/stats/me")
            setStats(response.data)
        } catch (err) {
            console.error("Error fetching stats:", err)
        } finally {
            setLoading(false)
        }
    }

    const formatCOP = (amount) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const StatCard = ({ title, value, icon: Icon, subtext }) => (
        <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#333] hover:border-[#d4a574] transition-colors group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</p>
                    <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
                </div>
                <div className="p-3 bg-[#2a2a2a] rounded-lg group-hover:bg-[#d4a574] group-hover:text-black transition-colors text-[#d4a574]">
                    <Icon size={24} />
                </div>
            </div>
            {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
        </div>
    )

    const maxIncome = stats?.history ? Math.max(...stats.history.map(d => d.income)) : 1

    return (
        <DashboardLayout>
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Mis Estadísticas</h1>
                    <p className="text-gray-400">Analiza tu rendimiento y ganancias.</p>
                </div>

                <div className="bg-[#1a1a1a] p-1 rounded-lg border border-[#333] inline-flex">
                    <button
                        onClick={() => setTimeRange("week")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${timeRange === "week" ? "bg-[#d4a574] text-black" : "text-gray-400 hover:text-white"}`}
                    >
                        Semana
                    </button>
                    <button
                        onClick={() => setTimeRange("month")}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition ${timeRange === "month" ? "bg-[#d4a574] text-black" : "text-gray-400 hover:text-white"}`}
                    >
                        Mes
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d4a574]"></div>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Ingresos Hoy"
                            value={formatCOP(stats?.today?.totalIncome || 0)}
                            icon={DollarSign}
                            subtext="Ganancias del día en curso"
                        />
                        <StatCard
                            title="Cortes Hoy"
                            value={stats?.today?.totalCuts || 0}
                            icon={Scissors}
                            subtext="Total de servicios realizados"
                        />
                        <StatCard
                            title="Ticket Promedio"
                            value={formatCOP(stats?.today?.avgTicket || 0)}
                            icon={TrendingUp}
                            subtext="Valor promedio por corte"
                        />
                        <StatCard
                            title="Pago Frecuente"
                            value={stats?.today?.mostFrequentPayment || "N/A"}
                            icon={CreditCard}
                            subtext="Método de pago más usado"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 bg-[#1a1a1a] p-6 rounded-xl border border-[#333]">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <TrendingUp size={20} className="text-[#d4a574]" />
                                Historial de Ingresos (Últimos 30 días)
                            </h3>
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                {stats?.history?.slice().reverse().map((day) => {
                                    const percentage = maxIncome > 0 ? (day.income / maxIncome) * 100 : 0
                                    return (
                                        <div key={day._id} className="space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-400">
                                                    {new Date(day._id).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                </span>
                                                <span className="text-[#d4a574] font-bold">{formatCOP(day.income)}</span>
                                            </div>
                                            <div className="w-full bg-[#2a2a2a] rounded-full h-2 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-[#d4a574] to-[#b08d55] h-full rounded-full transition-all duration-500"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-600">{day.cuts} cortes</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#333]">
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Calendar size={20} className="text-[#d4a574]" />
                                Resumen Diario
                            </h3>
                            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                {stats?.history?.slice().reverse().slice(0, 10).map((day) => (
                                    <div key={day._id} className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded-lg border border-[#333]">
                                        <div>
                                            <p className="text-white font-medium">
                                                {new Date(day._id).toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' })}
                                            </p>
                                            <p className="text-xs text-gray-500">{day.cuts} cortes</p>
                                        </div>
                                        <p className="text-[#d4a574] font-bold">{formatCOP(day.income)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}
