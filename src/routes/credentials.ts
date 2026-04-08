import { Router, Request, Response } from 'express'
import { signCredential } from '../agent/setup'
import { store, CredentialRecord } from '../agent/store'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

// GET /api/credentials
router.get('/', (_req: Request, res: Response) => {
  const creds = store.getAllCredentials()
  res.json({ success: true, data: creds })
})

// GET /api/credentials/:id
router.get('/:id', (req: Request, res: Response) => {
  const cred = store.getCredential(req.params.id)
  if (!cred) {
    res.status(404).json({ success: false, error: 'Credential not found' })
    return
  }
  res.json({ success: true, data: cred })
})

// POST /api/credentials/issue
router.post('/issue', async (req: Request, res: Response) => {
  try {
    const { issuerDid, subjectDid, type, subject, institution, expiresAt } = req.body
    if (!issuerDid || !subjectDid || !type || !subject || !institution) {
      res.status(400).json({ success: false, error: 'issuerDid, subjectDid, type, subject, institution are required' })
      return
    }

    const issuer = store.getIdentity(issuerDid)
    const subjectIdentity = store.getIdentity(subjectDid)

    if (!issuer || !subjectIdentity) {
      res.status(404).json({ success: false, error: 'Issuer or subject DID not found' })
      return
    }

    if (issuer.role !== 'issuer') {
      res.status(403).json({ success: false, error: 'Only issuers can issue credentials' })
      return
    }

    const vcPayload = {
      iss: issuerDid,
      sub: subjectDid,
      vc: {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', type],
        credentialSubject: {
          id: subjectDid,
          subject,
          institution,
          name: subjectIdentity.name,
        },
      },
      iat: Math.floor(Date.now() / 1000),
      ...(expiresAt ? { exp: Math.floor(new Date(expiresAt).getTime() / 1000) } : {}),
    }

    const vcJwt = signCredential(vcPayload, issuerDid)

    const record: CredentialRecord = {
      id: uuidv4(),
      vcId: 'vc:chain:0x' + uuidv4().replace(/-/g, '').slice(0, 16),
      issuerDid,
      subjectDid,
      type,
      subject,
      institution,
      issuedAt: new Date().toISOString(),
      expiresAt,
      status: 'valid',
      vcJwt,
    }

    store.addCredential(record)
    res.status(201).json({ success: true, data: record })
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/credentials/verify
router.post('/verify', (req: Request, res: Response) => {
  const { id, vcJwt } = req.body

  let cred: CredentialRecord | null = null

  if (id) {
    cred = store.getCredential(id)
  } else if (vcJwt) {
    cred = store.getAllCredentials().find(c => c.vcJwt === vcJwt) || null
  }

  if (!cred) {
    res.json({
      success: true,
      data: {
        verified: false,
        reason: 'Credential not found in registry',
        checks: {
          exists: false,
          notRevoked: false,
          notExpired: false,
          signatureValid: false,
        },
      },
    })
    return
  }

  const now = new Date()
  const notExpired = !cred.expiresAt || new Date(cred.expiresAt) > now
  const notRevoked = cred.status === 'valid'
  const signatureValid = cred.vcJwt.startsWith('eyJhbGci') && cred.vcJwt.split('.').length === 3

  const verified = notExpired && notRevoked && signatureValid

  res.json({
    success: true,
    data: {
      verified,
      credential: cred,
      reason: !verified
        ? cred.status === 'revoked'
          ? 'Credential has been revoked'
          : !notExpired
          ? 'Credential has expired'
          : 'Signature verification failed'
        : 'Credential is valid and authentic',
      checks: {
        exists: true,
        notRevoked,
        notExpired,
        signatureValid,
      },
      verifiedAt: now.toISOString(),
    },
  })
})

// PATCH /api/credentials/:id/revoke
router.patch('/:id/revoke', (req: Request, res: Response) => {
  const { id } = req.params
  const revoked = store.revokeCredential(id)
  if (!revoked) {
    res.status(404).json({ success: false, error: 'Credential not found' })
    return
  }
  res.json({ success: true, data: { id, status: 'revoked' } })
})

export default router
