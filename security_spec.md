# Security Specification: Fortress Firestore Rules
This document outlines our Attribute-Based Access Control (ABAC) invariants, malicious payload defense criteria, and the "Dirty Dozen" threat vectors.

## 1. Data Invariants
1. **User Ownership Isolation**: Users can only read, write, update, or delete profiles, addresses, carts, wishlists, and order records that belong to their own authenticated UID.
2. **Strict Identity Matching**: During creation of any record, the user-related identifier field (or document path variable `{userId}`) must exactly match `request.auth.uid`.
3. **Temporal Trust**: Timestamps (`createdAt`, `updatedAt`) must rely purely on `request.time` generated at transaction time; client-supplied clock payloads are rejected.
4. **Finite Bound Enforcements**: All IDs and payload properties must undergo length and boundary limits validation (`.size()`) to eliminate Denial of Wallet vulnerabilities.

## 2. The Dirty Dozen (Malicious Payloads)
1. **Unsigned Identity Injection**: Writing user records without an active `auth.uid`.
2. **PII Blanket Leak**: Attempting to query `/users` or arbitrary subcollections containing sensitive address, cart, or order files without verifying the target account matches the active user.
3. **Fake Timestamp Forge**: Client attempts to manually set `createdAt` back to last year.
4. **Denial of Wallet ID Spam**: Injecting a 2MB string as a `{userId}` or doc path variable.
5. **No Verification Bypass**: Performing database mutations where the auth token's `email_verified` claim is missing or false.
6. **Cart Price Tampering**: Creating a cart item where `price` is set to `0.01` when it should match the master product catalog.
7. **Cross-User Address Stealing**: User `A` reading/modifying addresses under User `B`'s root document.
8. **Shadow Field Injection**: Writing documents containing undocumented custom attributes (e.g., adding `isAdmin: true` to a profile).
9. **Role Escalation**: Modifying internal user attributes or profile info to escalate privileges or bypass checks.
10. **Order Spoofing**: Attempting to read or replace another user's Order History records.
11. **Wishlist Poisoning**: Adding a wishlist entry targeting another customer's ID.
12. **State Locking Hijack**: Attempting to modify orders or change statuses and details after they transition to a terminal state like `Delivered` or `Cancelled`.

## 3. Mitigation Rules & Verification
- Master Gate pattern verifies all subcollections check the root user document.
- Standalone validator methods run during `create` and `update` phases.
- `affectedKeys().hasOnly(...)` ensures only specific allowed keys can be patched during actions.
