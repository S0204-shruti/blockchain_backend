export interface IdentityRecord {
    did: string;
    alias: string;
    name: string;
    role: 'issuer' | 'user';
    createdAt: string;
}
export interface CredentialRecord {
    id: string;
    vcId: string;
    issuerDid: string;
    subjectDid: string;
    type: string;
    subject: string;
    institution: string;
    issuedAt: string;
    expiresAt?: string;
    status: 'valid' | 'revoked';
    vcJwt: string;
    verificationResult?: any;
}
export declare function seedDemoData(): void;
export declare const store: {
    identities: Map<string, IdentityRecord>;
    credentials: Map<string, CredentialRecord>;
    addIdentity(record: IdentityRecord): void;
    getIdentity(did: string): IdentityRecord;
    getIdentityByAlias(alias: string): IdentityRecord;
    getAllIdentities(): IdentityRecord[];
    addCredential(record: CredentialRecord): void;
    getCredential(id: string): CredentialRecord;
    getAllCredentials(): CredentialRecord[];
    getCredentialsBySubject(did: string): CredentialRecord[];
    getCredentialsByIssuer(did: string): CredentialRecord[];
    revokeCredential(id: string): boolean;
};
