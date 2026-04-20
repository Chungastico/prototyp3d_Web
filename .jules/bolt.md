## 2024-04-20 - [Supabase Query Waterfall Optimization]
**Learning:** Found a severe performance bottleneck where independent Supabase queries were awaited sequentially inside a React component's `useEffect`, creating a massive network waterfall.
**Action:** Always batch independent Supabase queries using `Promise.all` instead of sequential `await` calls. When nested dependencies exist (e.g., getting pieces, then getting filaments for those pieces), structure the `Promise.all` batches in layers to minimize total network round-trips.
