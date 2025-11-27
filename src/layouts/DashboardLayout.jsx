import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import {
    LayoutDashboard,
    BarChart2,
    LogOut,
    Scissors,
    User,
    ChevronDown
} from "lucide-react"

export const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [showUserMenu, setShowUserMenu] = useState(false)

    const handleLogout = () => {
        logout()
        navigate("/login")
    }

    const navItems = user?.role === "admin" ? [
        { path: "/admin/dashboard", label: "Panel Admin", icon: LayoutDashboard },
    ] : [
        { path: "/barber/dashboard", label: "Registrar Cortes", icon: Scissors },
        { path: "/barber/analytics", label: "Mis Estadísticas", icon: BarChart2 },
    ]

    return (
        <div className="min-h-screen bg-[#121212] text-white font-sans">
            {/* Top Navbar */}
            <nav className="bg-[#1a1a1a] border-b border-[#333] fixed top-0 left-0 right-0 z-30">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#d4a574] rounded-full flex items-center justify-center text-black font-bold text-xl">
                                B
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-[#d4a574] tracking-wider">BARBER SHOP</h1>
                                <p className="text-xs text-gray-400">Manager</p>
                            </div>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center gap-2">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive
                                            ? "bg-[#d4a574] text-black font-bold"
                                            : "text-gray-400 hover:bg-[#2a2a2a] hover:text-white"
                                            }`}
                                    >
                                        <item.icon size={18} />
                                        {item.label}
                                    </Link>
                                )
                            })}
                        </div>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[#2a2a2a] transition"
                            >
                                <div className="w-8 h-8 bg-[#333] rounded-full flex items-center justify-center">
                                    <User size={16} className="text-[#d4a574]" />
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-white">{user?.name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                                </div>
                                <ChevronDown size={16} className="text-gray-400" />
                            </button>

                            {/* Dropdown Menu */}
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl py-2">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-[#2a2a2a] transition text-sm"
                                    >
                                        <LogOut size={16} /> Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Navigation */}
                    <div className="md:hidden mt-4 flex gap-2 overflow-x-auto pb-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${isActive
                                        ? "bg-[#d4a574] text-black font-bold"
                                        : "text-gray-400 hover:bg-[#2a2a2a]"
                                        }`}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="pt-24 md:pt-20 min-h-screen">
                <div className="container mx-auto px-4 md:px-6 py-6 max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    )
}
