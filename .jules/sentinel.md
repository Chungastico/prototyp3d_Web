## 2026-04-24 - Insecure Randomness for IDs and Filenames
**Vulnerability:** The application used `Math.random()` to generate file names during upload and to create unique IDs for React components. `Math.random()` is not a cryptographically secure pseudo-random number generator (CSPRNG).
**Learning:** Using predictable randomness can lead to ID collisions, which can break application state or cause file overwrite vulnerabilities in storage buckets if filenames can be guessed or duplicated.
**Prevention:** Always use `crypto.randomUUID()` (or a robust library like `uuid` / `nanoid`) for generating unique identifiers, file names, or any value that requires strong uniqueness and unpredictability.
