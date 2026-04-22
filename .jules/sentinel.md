## 2026-04-22 - [Insecure Randomness for Identifiers]
**Vulnerability:** Insecure use of `Math.random()` for generating file names and object IDs.
**Learning:** React state keys and object identifiers used for Supabase or general file storage should never use `Math.random()` due to poor collision resistance and predictability, which could potentially expose predictable file paths or lead to data overlap.
**Prevention:** Use `crypto.randomUUID()` whenever an unguessable unique identifier is required for IDs or filenames.
