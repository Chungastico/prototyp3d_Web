## 2025-02-14 - Replace insecure `Math.random()` for Unique Identifiers and Filenames
**Vulnerability:** Several components generated IDs and file names using `Math.random()`, such as `` `${Math.random()}.${fileExt}` `` or `Math.random().toString(36).substring(7)`. This is not cryptographically secure and can lead to predictable identifiers and file collisions.
**Learning:** `Math.random()` should never be used where uniqueness or security is expected, such as in generating temporary IDs or file names for storage, as collisions and predictability pose risks.
**Prevention:** Always use a cryptographically secure method like `crypto.randomUUID()` when generating unique identifiers, file names, or random IDs in the browser or Node.js environment.
