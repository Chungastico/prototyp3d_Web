
## 2025-02-27 - Insecure random number generation with Math.random()
**Vulnerability:** The codebase was using `Math.random()` to generate unique identifiers for file uploads and internal component state keys.
**Learning:** `Math.random()` is not cryptographically secure and predictable, which could lead to ID collisions, predictable filenames, or manipulation.
**Prevention:** Always use `crypto.randomUUID()` for generating random identifiers, tokens, and unique filenames to ensure sufficient entropy.
