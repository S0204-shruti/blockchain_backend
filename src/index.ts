import express from 'express'
import cors from 'cors'
import identityRoutes from './routes/identity'
import credentialRoutes from './routes/credentials'
import { seedDemoData } from './agent/store'

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: '*' }))
app.use(express.json())

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' })
})

// Routes
app.use('/api/identities', identityRoutes)
app.use('/api/credentials', credentialRoutes)

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' })
})

// Seed demo data
seedDemoData()

app.listen(PORT, () => {
  console.log(`\n🚀 Blockchain Identity Backend running on http://localhost:${PORT}`)
  console.log(`📋 Health: http://localhost:${PORT}/health`)
  console.log(`🔑 Identities: http://localhost:${PORT}/api/identities`)
  console.log(`📜 Credentials: http://localhost:${PORT}/api/credentials\n`)
})

export default app
