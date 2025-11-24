import { useState, useEffect } from "react"
import apiClient from "../api/apiClient"
import { Trash2, Edit, UserPlus, CheckCircle, XCircle } from "lucide-react"

export const BarberManagement = () => {
    const [barbers, setBarbers] = useState([])
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [editingBarber, setEditingBarber] = useState(null)

    const [formData, setFormData] = useState({
        name: "",
        lastName: "",
        email: "",
        password: "",
        isActive: true
    })

    useEffect(() => {
        fetchBarbers()
    }, [])

    const fetchBarbers = async () => {
        setLoading(true)
        try {
            const response = await apiClient.get("/barbers?includeInactive=true")
            setBarbers(response.data)
        } catch (err) {
            console.error("Error fetching barbers:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingBarber) {
                await apiClient.put(`/barbers/${editingBarber._id}`, formData)
            } else {
                await apiClient.post("/barbers", formData)
            }
            setShowModal(false)
            setEditingBarber(null)
            setFormData({ name: "", lastName: "", email: "", password: "", isActive: true })
            fetchBarbers()
        } catch (err) {
            alert(err.response?.data?.message || "Error al guardar barbero")
        }
    }

    const handleEdit = (barber) => {
        setEditingBarber(barber)
        setFormData({
            name: barber.name,
            lastName: barber.lastName,
            email: barber.email,
            password: "", // Don't show password
            isActive: barber.isActive
        })
        setShowModal(true)
    }

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de desactivar este barbero?")) {
            try {
                await apiClient.delete(`/barbers/${id}`)
                fetchBarbers()
            } catch (err) {
                console.error("Error deleting barber:", err)
            }
        }
    }

    const handleToggleActive = async (barber) => {
        try {
            await apiClient.put(`/barbers/${barber._id}`, { isActive: !barber.isActive })
            fetchBarbers()
        } catch (err) {
            console.error("Error toggling status:", err)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-[#1a1a1a]">Gestión de Barberos</h2>
                <button
                    onClick={() => {
                        setEditingBarber(null)
                        setFormData({ name: "", lastName: "", email: "", password: "", isActive: true })
                        setShowModal(true)
                    }}
                    className="flex items-center gap-2 bg-[#d4a574] hover:bg-[#c19a5e] text-black font-bold py-2 px-4 rounded transition"
                >
                    <UserPlus size={20} />
                    Nuevo Barbero
                </button>
            </div>

            {loading ? (
                <p className="text-center text-gray-500">Cargando...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-3 px-4 font-semibold text-gray-700">Nombre</th>
                                <th className="py-3 px-4 font-semibold text-gray-700">Email</th>
                                <th className="py-3 px-4 font-semibold text-gray-700">Estado</th>
                                <th className="py-3 px-4 font-semibold text-gray-700">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {barbers.map((barber) => (
                                <tr key={barber._id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4">{barber.name} {barber.lastName}</td>
                                    <td className="py-3 px-4">{barber.email}</td>
                                    <td className="py-3 px-4">
                                        <button onClick={() => handleToggleActive(barber)} className="focus:outline-none">
                                            {barber.isActive ? (
                                                <span className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs font-bold">
                                                    <CheckCircle size={14} /> Activo
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs font-bold">
                                                    <XCircle size={14} /> Inactivo
                                                </span>
                                            )}
                                        </button>
                                    </td>
                                    <td className="py-3 px-4 flex gap-2">
                                        <button
                                            onClick={() => handleEdit(barber)}
                                            className="text-blue-600 hover:text-blue-800 p-1"
                                            title="Editar"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        {barber.isActive && (
                                            <button
                                                onClick={() => handleDelete(barber._id)}
                                                className="text-red-600 hover:text-red-800 p-1"
                                                title="Desactivar"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">
                            {editingBarber ? "Editar Barbero" : "Nuevo Barbero"}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#d4a574] focus:border-[#d4a574]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Apellido</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#d4a574] focus:border-[#d4a574]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#d4a574] focus:border-[#d4a574]"
                                />
                            </div>
                            {!editingBarber && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Contraseña</label>
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#d4a574] focus:border-[#d4a574]"
                                    />
                                </div>
                            )}
                            {editingBarber && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Nueva Contraseña (Opcional)</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#d4a574] focus:border-[#d4a574]"
                                        placeholder="Dejar en blanco para mantener actual"
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#d4a574] hover:bg-[#c19a5e] text-black font-bold rounded"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
