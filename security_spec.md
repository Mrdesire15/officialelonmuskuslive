# Security Specification — Visitor Authentication & Profile Storage

## 1. Data Invariants
1. **Identity Isolation**: A visitor profile document at `/users/{userId}` can only exist when `userId == request.auth.uid` and `data.uid == request.auth.uid`.
2. **PII Protection**: Email addresses and profile metadata in `/users/{userId}` are strictly private to the verified owner (`isOwner(userId)`). Collection-wide `list` queries on `/users` are completely disabled (`allow list: if false;`).
3. **Immutable Fields**: `uid`, `email`, and `createdAt` are immutable after document creation.
4. **Temporal Integrity**: `createdAt` (on create) and `lastLoginAt` (on create/update) must strictly equal server `request.time`.
5. **Verified Writes**: Firestore writes require `request.auth != null && request.auth.token.email_verified == true`.

## 2. "Dirty Dozen" Adversarial Payloads
1. **Unauthenticated Create**: Create `/users/user123` with `request.auth == null` -> `PERMISSION_DENIED`.
2. **Unverified Email Create**: Create `/users/user123` with `email_verified == false` -> `PERMISSION_DENIED`.
3. **Cross-User Spoof Create**: Auth as `uidA`, attempt create at `/users/uidB` -> `PERMISSION_DENIED`.
4. **UID Field Spoofing**: Auth as `uidA`, attempt create at `/users/uidA` with `data.uid = "uidB"` -> `PERMISSION_DENIED`.
5. **Shadow / Ghost Field Injection**: Create `/users/uidA` with extra key `isAdmin: true` or `role: "admin"` -> `PERMISSION_DENIED` (`hasOnly` rejection).
6. **Client Timestamp Tampering**: Create `/users/uidA` with backdated `createdAt` -> `PERMISSION_DENIED` (`createdAt == request.time`).
7. **Oversized DisplayName Poisoning**: Create `/users/uidA` with 500-char `displayName` -> `PERMISSION_DENIED` (`displayName.size() <= 120`).
8. **Invalid Document ID Poisoning**: Access `/users/invalid$id..` -> `PERMISSION_DENIED` (`isValidId` regex guard).
9. **Immutable Field Mutation**: Update `/users/uidA` attempting to alter `email`, `uid`, or `createdAt` -> `PERMISSION_DENIED`.
10. **Unauthorized Update Field**: Update `/users/uidA` attempting to inject or modify unpermitted fields -> `PERMISSION_DENIED` (`affectedKeys().hasOnly(['displayName', 'lastLoginAt'])`).
11. **Cross-User PII Read**: Auth as `uidB`, attempt `get` on `/users/uidA` -> `PERMISSION_DENIED`.
12. **Blanket User Enumeration**: Attempt `list` on `/users` as any signed-in user -> `PERMISSION_DENIED`.
