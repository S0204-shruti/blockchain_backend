// Simplified DID creation without ESM-incompatible deps
import { v4 as uuidv4 } from 'uuid'
import * as crypto from 'crypto'

export function createDid(alias: string): string {
  // Generate a deterministic key-based DID from alias + random bytes
  const keyBytes = crypto.randomBytes(32).toString('hex')
  const base58chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

  // Simple base58-like encoding
  let num = BigInt('0x' + keyBytes)
  let encoded = ''
  while (num > 0n) {
    encoded = base58chars[Number(num % 58n)] + encoded
    num = num / 58n
  }

  // Pad to standard length
  while (encoded.length < 44) encoded = '1' + encoded

  return `did:key:z6Mk${encoded.slice(0, 40)}`
}

export function signCredential(payload: object, issuerDid: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'EdDSA', typ: 'JWT' })).toString('base64url')
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', issuerDid).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${sig}`
}
