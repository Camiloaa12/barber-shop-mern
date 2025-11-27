"use client"

import { useState } from "react"
import apiClient from "../api/apiClient"
import { UserPlus, X } from "lucide-react"

export const CutForm = ({ onCutAdded }) => {
  const [formData, setFormData] = useState({
    clientName: "",
    clientLastName: "",
    amount: "",
    paymentMethod: "efectivo",
    observations: "",
    clientId: null,
  })
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if ((name === "clientName" || name === "clientLastName") && value.length > 0) {
      searchClients()
    }
  }

  const searchClients = async () => {
    try {
      const response = await apiClient.get("/clients", {
        params: {
          name: formData.clientName,
          lastName: formData.clientLastName,
        },
      })
      setClients(response.data)
    } catch (err) {
      console.error("Error al buscar clientes:", err)
    }
  }

  const handleSelectClient = (client) => {
    setFormData((prev) => ({
      ...prev,
      clientId: client._id,
      clientName: client.name,
      clientLastName: client.lastName,
    }))
    setSelectedClient(client)
    setClients([])
  }

  const handleCreateNewClient = async () => {
    try {
      const response = await apiClient.post("/clients", {
        name: formData.clientName,
        lastName: formData.clientLastName,
      })
      handleSelectClient(response.data)
    } catch (err) {
      setError("Error al crear cliente")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validate amount
    if (!formData.amount || formData.amount === "" || formData.amount === "0") {
      setError("Por favor ingresa un monto válido")
      return
    }

    // Validate client name and lastname
    if (!formData.clientName || !formData.clientLastName) {
      setError("Por favor ingresa el nombre y apellido del cliente")
      return
    }

    setLoading(true)

    try {
      const amountValue = parseInt(formData.amount.toString().replace(/[^0-9]/g, ''), 10)

      if (isNaN(amountValue) || amountValue <= 0) {
        setError("El monto debe ser un número válido mayor a 0")
        setLoading(false)
        return
      }

      // Auto-create client if not selected
      let clientId = formData.clientId
      if (!selectedClient) {
        try {
          const clientResponse = await apiClient.post("/clients", {
            name: formData.clientName,
            lastName: formData.clientLastName,
          })
          clientId = clientResponse.data._id
        } catch (clientErr) {
          // Client might already exist, continue with the cut registration
          console.log("Client creation note:", clientErr.response?.data?.message)
        }
      }

      await apiClient.post("/cuts", {
        clientId: clientId,
        clientName: formData.clientName,
        clientLastName: formData.clientLastName,
        amount: amountValue,
        paymentMethod: formData.paymentMethod,
        observations: formData.observations,
        service: "Corte Regular",
      })

      setSuccess("✓ Corte registrado exitosamente")
      setFormData({
        clientName: "",
        clientLastName: "",
        amount: "",
        paymentMethod: "efectivo",
        observations: "",
        clientId: null,
      })
      setSelectedClient(null)

      setTimeout(() => setSuccess(""), 3000)
      onCutAdded()
    } catch (err) {
      setError(err.response?.data?.message || "Error al registrar corte")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && <div className="p-3 bg-red-900/20 border border-red-500/50 text-red-400 rounded-lg text-sm">{error}</div>}
      {success && <div className="p-3 bg-green-900/20 border border-green-500/50 text-green-400 rounded-lg text-sm">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Client Selection */}
        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">Cliente</label>

          {selectedClient ? (
            <div className="p-3 bg-[#2a2a2a] border border-[#d4a574] rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#d4a574] rounded-full flex items-center justify-center text-black font-bold">
                  {selectedClient.name.charAt(0)}
                </div>
                <p className="text-white font-medium">
                  {selectedClient.name} {selectedClient.lastName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedClient(null)
                  setFormData((prev) => ({
                    ...prev,
                    clientId: null,
                    clientName: "",
                    clientLastName: "",
                  }))
                }}
                className="text-gray-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  name="clientName"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  placeholder="Nombre"
                  className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#d4a574]"
                />
                <input
                  type="text"
                  name="clientLastName"
                  value={formData.clientLastName}
                  onChange={handleInputChange}
                  placeholder="Apellido"
                  className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#d4a574]"
                />
              </div>

              {clients.length > 0 && (
                <div className="bg-[#2a2a2a] border border-[#333] rounded-lg max-h-40 overflow-y-auto custom-scrollbar z-10">
                  {clients.map((client) => (
                    <button
                      key={client._id}
                      type="button"
                      onClick={() => handleSelectClient(client)}
                      className="w-full text-left px-3 py-2 hover:bg-[#333] text-sm text-gray-300 border-b border-[#333] last:border-b-0 flex items-center justify-between group"
                    >
                      <span>{client.name} {client.lastName}</span>
                      <UserPlus size={14} className="opacity-0 group-hover:opacity-100 text-[#d4a574]" />
                    </button>
                  ))}
                </div>
              )}

              {formData.clientName && formData.clientLastName && clients.length === 0 && (
                <button
                  type="button"
                  onClick={handleCreateNewClient}
                  className="w-full px-3 py-2 bg-[#d4a574]/10 border border-[#d4a574]/30 text-[#d4a574] rounded-lg text-sm hover:bg-[#d4a574]/20 font-medium flex items-center justify-center gap-2 transition"
                >
                  <UserPlus size={16} /> Crear nuevo cliente
                </button>
              )}
            </div>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">Valor del Corte (COP)</label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              placeholder="20000"
              className="w-full pl-7 pr-3 py-2 bg-[#2a2a2a] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#d4a574]"
              required
            />
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">Método de pago</label>
          <div className="grid grid-cols-2 gap-2">
            {['efectivo', 'transferencia', 'tarjeta', 'otro'].map((method) => (
              <button
                key={method}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method }))}
                className={`px-3 py-2 rounded-lg text-sm font-medium capitalize border transition-all ${formData.paymentMethod === method
                  ? "bg-[#d4a574] text-black border-[#d4a574]"
                  : "bg-[#2a2a2a] text-gray-400 border-[#333] hover:border-[#555]"
                  }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        {/* Observations */}
        <div>
          <label className="block text-gray-400 text-sm font-medium mb-2">Observaciones (Opcional)</label>
          <textarea
            name="observations"
            value={formData.observations}
            onChange={handleInputChange}
            placeholder="Detalles adicionales..."
            rows="2"
            className="w-full px-3 py-2 bg-[#2a2a2a] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#d4a574]"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !formData.clientName || !formData.clientLastName || !formData.amount}
          className="w-full bg-[#d4a574] hover:bg-[#c19a5e] text-black font-bold py-3 rounded-lg transition-all shadow-lg shadow-[#d4a574]/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Registrando..." : "REGISTRAR CORTE"}
        </button>
      </form>
    </div>
  )
}
