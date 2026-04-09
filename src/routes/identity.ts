import { Router, Request, Response } from 'express'
import { createDid } from '../agent/setup'
import { store, IdentityRecord } from '../agent/store'

const router = Router()

// GET /api/identities — list all
router.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, data: store.getAllIdentities() })
})

// GET /api/identities/stats
router.get('/stats', (_req: Request, res: Response) => {
  const all = store.getAllIdentities()
  const creds = store.getAllCredentials()
  res.json({
    success: true,
    data: {
      totalIdentities: all.length,
      issuers: all.filter(i => i.role === 'issuer').length,
      users: all.filter(i => i.role === 'user').length,
      totalCredentials: creds.length,
      validCredentials: creds.filter(c => c.status === 'valid').length,
      revokedCredentials: creds.filter(c => c.status === 'revoked').length,
    },
  })
})

// GET /api/identities/:did
router.get('/:did', (req: Request, res: Response) => {
  const did = decodeURIComponent(req.params.did)
  const identity = store.getIdentity(did)
  if (!identity) {
    res.status(404).json({ success: false, error: 'Identity not found' })
    return
  }
  const credentials = store.getCredentialsBySubject(did)
  const issued = store.getCredentialsByIssuer(did)
  res.json({ success: true, data: { ...identity, credentials, issued } })
})

// POST /api/identities — create new DID
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, alias, role } = req.body
    if (!name || !alias || !role) {
      res.status(400).json({ success: false, error: 'name, alias, and role are required' })
      return
    }
    if (!['issuer', 'user'].includes(role)) {
      res.status(400).json({ success: false, error: 'role must be issuer or user' })
      return
    }

    const existing = store.getIdentityByAlias(alias)
    if (existing) {
      res.status(409).json({ success: false, error: 'Alias already exists' })
      return
    }

    const did = createDid(alias)

    const record: IdentityRecord = {
      did,
      alias,
      name,
      role,
      createdAt: new Date().toISOString(),
    }

    store.addIdentity(record)
    res.status(201).json({ success: true, data: record })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

export default router
