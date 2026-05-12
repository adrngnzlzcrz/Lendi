# Security Specification for LendiControl

## Data Invariants
1. A Client must have a unique `clientNumber`.
2. A Loan must reference an existing Client and have `remainingBalance <= amount`. (Actually, balance can be more if interest is added, but it must be consistent).
3. A Payment must decrease the `remainingBalance` of the associated Loan.
4. All documents must be owned by the authenticated user (`createdBy`).

## The Dirty Dozen Payloads

1. **Identity Spoofing**: Creating a client with a `createdBy` that isn't the current user.
2. **ClientID Poisoning**: Using a 1MB string as a `clientId` in the path.
3. **Ghost Fields**: Adding `isVerified: true` to a Client document.
4. **Unauthorized Read**: Trying to list clients without being authenticated.
5. **Cross-User Leak**: Authenticated User A trying to read User B's clients.
6. **Balance Inconsistency**: Creating a payment that doesn't reference a loan.
7. **Negative Payment**: Trying to pay a negative amount.
8. **Statue Jumping**: Updating a Loan status from 'paid' back to 'active' without permission.
9. **Timestamp Manipulation**: Sending a client-side `createdAt` that is in the future.
10. **ID Overlap**: Trying to manually set a `clientNumber` that conflicts with the sequence (handled by logic, but rules should ensure user doesn't just guess).
11. **Massive Payload**: Sending a 1MB address string.
12. **Orphaned Payment**: Creating a payment for a loan that doesn't exist.

## The Test Runner (Plan)
We will verify that:
- `create` fails if `createdBy != request.auth.uid`.
- `update` fails if any immutable field is touched (`clientNumber`, `loanId`).
- `list` only returns documents where `createdBy == request.auth.uid`.
