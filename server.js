import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.js"
import clientsRoutes from "./routes/clients.js"
import cutsRoutes from "./routes/cuts.js"
import statsRoutes from "./routes/stats.js"
import barbersRoutes from "./routes/barbers.js"

dotenv.config()

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.log("Error en MongoDB:", err))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/clients", clientsRoutes)
app.use("/api/cuts", cutsRoutes)
app.use("/api/stats", statsRoutes)
app.use("/api/barbers", barbersRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
})
