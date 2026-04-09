"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.store = void 0;
exports.seedDemoData = seedDemoData;
const uuid_1 = require("uuid");
// In-memory store (replace with SQLite via TypeORM in production)
const identities = new Map();
const credentials = new Map();
// Seed demo data
function seedDemoData() {
    const demoIdentities = [
        {
            did: 'did:key:z6MkissDemo1',
            alias: 'mit-issuer',
            name: 'MIT University',
            role: 'issuer',
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            did: 'did:key:z6MkissDemo2',
            alias: 'harvard-issuer',
            name: 'Harvard University',
            role: 'issuer',
            createdAt: new Date('2024-01-20').toISOString(),
        },
        {
            did: 'did:key:z6MkissDemo3',
            alias: 'alice-user',
            name: 'Alice Johnson',
            role: 'user',
            createdAt: new Date('2024-02-01').toISOString(),
        },
        {
            did: 'did:key:z6MkissDemo4',
            alias: 'bob-user',
            name: 'Bob Smith',
            role: 'user',
            createdAt: new Date('2024-02-10').toISOString(),
        },
    ];
    demoIdentities.forEach(id => identities.set(id.did, id));
    const demoCredentials = [
        {
            id: (0, uuid_1.v4)(),
            vcId: 'vc:chain:0x' + Math.random().toString(16).slice(2, 18),
            issuerDid: 'did:key:z6MkissDemo1',
            subjectDid: 'did:key:z6MkissDemo3',
            type: 'UniversityDegreeCredential',
            subject: 'Bachelor of Science in Computer Science',
            institution: 'MIT University',
            issuedAt: new Date('2024-05-15').toISOString(),
            expiresAt: new Date('2034-05-15').toISOString(),
            status: 'valid',
            vcJwt: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.demo.signature',
        },
        {
            id: (0, uuid_1.v4)(),
            vcId: 'vc:chain:0x' + Math.random().toString(16).slice(2, 18),
            issuerDid: 'did:key:z6MkissDemo2',
            subjectDid: 'did:key:z6MkissDemo4',
            type: 'ProfessionalCertificateCredential',
            subject: 'MBA - Business Administration',
            institution: 'Harvard University',
            issuedAt: new Date('2024-06-01').toISOString(),
            status: 'valid',
            vcJwt: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.demo2.signature',
        },
        {
            id: (0, uuid_1.v4)(),
            vcId: 'vc:chain:0x' + Math.random().toString(16).slice(2, 18),
            issuerDid: 'did:key:z6MkissDemo1',
            subjectDid: 'did:key:z6MkissDemo4',
            type: 'CourseCompletionCredential',
            subject: 'Advanced Machine Learning Certificate',
            institution: 'MIT University',
            issuedAt: new Date('2024-07-20').toISOString(),
            status: 'valid',
            vcJwt: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.demo3.signature',
        },
    ];
    demoCredentials.forEach(c => credentials.set(c.id, c));
}
exports.store = {
    identities,
    credentials,
    addIdentity(record) {
        identities.set(record.did, record);
    },
    getIdentity(did) {
        return identities.get(did) || null;
    },
    getIdentityByAlias(alias) {
        return Array.from(identities.values()).find(i => i.alias === alias) || null;
    },
    getAllIdentities() {
        return Array.from(identities.values());
    },
    addCredential(record) {
        credentials.set(record.id, record);
    },
    getCredential(id) {
        return credentials.get(id) || null;
    },
    getAllCredentials() {
        return Array.from(credentials.values());
    },
    getCredentialsBySubject(did) {
        return Array.from(credentials.values()).filter(c => c.subjectDid === did);
    },
    getCredentialsByIssuer(did) {
        return Array.from(credentials.values()).filter(c => c.issuerDid === did);
    },
    revokeCredential(id) {
        const cred = credentials.get(id);
        if (cred) {
            cred.status = 'revoked';
            credentials.set(id, cred);
            return true;
        }
        return false;
    },
};
