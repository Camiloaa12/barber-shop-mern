import { useState, useEffect } from "react"
import apiClient from "../api/apiClient"
import { Edit, Search, History, X } from "lucide-react"

export const ClientManagement = () => {
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState({ name: "", lastName: "" })
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const [editingClient, setEditingClient] = useState(null)
    const [viewingHistory, setViewingHistory] = useState(null)
    const [clientHistory, setClientHistory] = useState([])
    const [historyLoading, setHistoryLoading] = useState(false)

    useEffect(() => {
        fetchClients()
    }, [page, search])

    const fetchClients = async () => {
        setLoading(true)
        try {
            const params = { page, limit: 10 }
            if (search.name) params.name = search.name
            if (search.lastName) params.lastName = search.lastName

            const response = await apiClient.get("/clients", { params })
            setClients(response.data.clients)
            setTotalPages(response.data.totalPages)
        } catch (err) {
            console.error("Error fetching clients:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleSearchChange = (e) => {
        setSearch({ ...search, [e.target.name]: e.target.value })
        setPage(1) // Reset to page 1 on search
    }

    const handleEdit = (client) => {
        setEditingClient({ ...client })
    }

    const handleUpdateClient = async (e) => {
        e.preventDefault()
        try {
            await apiClient.put(`/clients/${editingClient._id}`, editingClient)
            setEditingClient(null)
            fetchClients()
        } catch (err) {
            alert("Error al actualizar cliente")
        }
    }

    const handleViewHistory = async (client) => {
        setViewingHistory(client)
        setHistoryLoading(true)
        try {
            const response = await apiClient.get(`/clients/${client._id}/history`)
            setClientHistory(response.data)
        } catch (err) {
            console.error("Error fetching history:", err)
        } finally {
            setHistoryLoading(false)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-6">Gestión de Clientes</h2>

            {/* Search */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                        type="text"
                        name="name"
                        placeholder="Buscar por nombre..."
                        value={search.name}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d4a574]"
                    />
                </div>
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Buscar por apellido..."
                        value={search.lastName}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#d4a574]"
                    />
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <p className="text-center text-gray-500">Cargando...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="py-3 px-4 font-semibold text-gray-700">Nombre</th>
                                <th className="py-3 px-4 font-semibold text-gray-700">Email</th>
                                <th className="py-3 px-4 font-semibold text-gray-700">Teléfono</th>
                                <th className="py-3 px-4 font-semibold text-gray-700">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {clients.map((client) => (
                                <tr key={client._id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4">{client.name} {client.lastName}</td>
                                    <td className="py-3 px-4">{client.email || "-"}</td>
                                    <td className="py-3 px-4">{client.phone || "-"}</td>
                                    <td className="py-3 px-4 flex gap-2">
                                        <button
                                            onClick={() => handleEdit(client)}
                                            className="text-blue-600 hover:text-blue-800 p-1"
                                            title="Editar"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleViewHistory(client)}
                                            className="text-[#d4a574] hover:text-[#c19a5e] p-1"
                                            title="Historial"
                                        >
                                            <History size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center mt-6 gap-2">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                >
                    Anterior
                </button>
                <span className="px-3 py-1">Página {page} de {totalPages}</span>
                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                >
                    Siguiente
                </button>
            </div>

            {/* Edit Modal */}
            {editingClient && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Editar Cliente</h3>
                        <form onSubmit={handleUpdateClient} className="space-y-4">
                            <input
                                type="text"
                                value={editingClient.name}
                                onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                                className="w-full px-3 py-2 border rounded"
                                placeholder="Nombre"
                                required
                            />
                            <input
                                type="text"
                                value={editingClient.lastName}
                                onChange={(e) => setEditingClient({ ...editingClient, lastName: e.target.value })}
                                className="w-full px-3 py-2 border rounded"
                                placeholder="Apellido"
                                required
                            />
                            <input
                                type="email"
                                value={editingClient.email || ""}
                                onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                                className="w-full px-3 py-2 border rounded"
                                placeholder="Email"
                            />
                            <input
                                type="text"
                                value={editingClient.phone || ""}
                                onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                                className="w-full px-3 py-2 border rounded"
                                placeholder="Teléfono"
                            />
                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setEditingClient(null)} className="px-4 py-2 text-gray-600">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-[#d4a574] text-black font-bold rounded">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {viewingHistory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Historial: {viewingHistory.name} {viewingHistory.lastName}</h3>
                            <button onClick={() => setViewingHistory(null)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>

                        {historyLoading ? (
                            <p>Cargando historial...</p>
                        ) : clientHistory.length === 0 ? (
                            <p>No hay cortes registrados.</p>
                        ) : (
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="py-2">Fecha</th>
                                        <th className="py-2">Barbero</th>
                                        <th className="py-2">Servicio</th>
                                        <th className="py-2">Monto</th>
                                        <th className="py-2">Pago</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clientHistory.map(cut => (
                                        <tr key={cut._id} className="border-b">
                                            <td className="py-2">{new Date(cut.createdAt).toLocaleDateString()}</td>
                                            <td className="py-2">{cut.barberId?.name} {cut.barberId?.lastName}</td>
                                            <td className="py-2">{cut.service || "Corte"}</td>
                                            <td className="py-2">${cut.amount}</td>
                                            <td className="py-2 capitalize">{cut.paymentMethod}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
