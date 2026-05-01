## 2024-05-15 - Concurrent Supabase Fetching in Dashboard
**Learning:** Sequential, independent database queries inside Next.js client components using Supabase client cause measurable network waterfalls, artificially extending the loading state of the dashboard overview. Destructuring the resolved queries exactly preserves state mapping.
**Action:** Always scan for uncoupled `await supabase...` requests inside `useEffect` fetching blocks and batch them using `Promise.all` to parallelize data retrieval over a single request cycle.
