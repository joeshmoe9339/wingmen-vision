// Frontend "real" API entrypoint — re-exports the live client above.
// Previously this silently re-exported the mock `api.ts` (dead Supabase code).
// Now it points to the real backend client.
export { api } from './api';
