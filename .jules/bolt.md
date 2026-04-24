## 2026-04-24 - Supabase Promise.all parallelization
**Learning:** Sequential await loops on Supabase fetch calls result in large network waterfalls that heavily delay React component rendering, specifically in large components like JobDetails.
**Action:** When fetching multiple independent datasets from Supabase inside a React Server Component or useCallback, immediately wrap them in a Promise.all array destructuring to reduce total load time.
