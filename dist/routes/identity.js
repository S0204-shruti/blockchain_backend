"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const setup_1 = require("../agent/setup");
const store_1 = require("../agent/store");
const router = (0, express_1.Router)();
// GET /api/identities — list all
router.get('/', (_req, res) => {
    res.json({ success: true, data: store_1.store.getAllIdentities() });
});
// GET /api/identities/stats
router.get('/stats', (_req, res) => {
    const all = store_1.store.getAllIdentities();
    const creds = store_1.store.getAllCredentials();
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
    });
});
// GET /api/identities/:did
router.get('/:did', (req, res) => {
    const did = decodeURIComponent(req.params.did);
    const identity = store_1.store.getIdentity(did);
    if (!identity) {
        res.status(404).json({ success: false, error: 'Identity not found' });
        return;
    }
    const credentials = store_1.store.getCredentialsBySubject(did);
    const issued = store_1.store.getCredentialsByIssuer(did);
    res.json({ success: true, data: { ...identity, credentials, issued } });
});
// POST /api/identities — create new DID
router.post('/', async (req, res) => {
    try {
        const { name, alias, role } = req.body;
        if (!name || !alias || !role) {
            res.status(400).json({ success: false, error: 'name, alias, and role are required' });
            return;
        }
        if (!['issuer', 'user'].includes(role)) {
            res.status(400).json({ success: false, error: 'role must be issuer or user' });
            return;
        }
        const existing = store_1.store.getIdentityByAlias(alias);
        if (existing) {
            res.status(409).json({ success: false, error: 'Alias already exists' });
            return;
        }
        const did = (0, setup_1.createDid)(alias);
        const record = {
            did,
            alias,
            name,
            role,
            createdAt: new Date().toISOString(),
        };
        store_1.store.addIdentity(record);
        res.status(201).json({ success: true, data: record });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.default = router;
