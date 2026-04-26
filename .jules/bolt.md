## 2024-05-19 - Concurrent Supabase Fetching
**Learning:** Sequential `await` calls to Supabase for independent data (e.g., job info, pieces, and extras) create a significant network waterfall that delays page load.
**Action:** When fetching independent data collections on the same route/component, always batch the Supabase promises using `Promise.all` to fetch them concurrently.
