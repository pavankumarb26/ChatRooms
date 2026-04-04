/** Backend origin for REST (uploads / downloads). Override with VITE_API_URL in .env */
export const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:3000";

/** Socket.IO server origin (same host as API unless VITE_SOCKET_URL is set). */
export const SOCKET_ORIGIN =
  import.meta.env.VITE_SOCKET_URL?.replace(/\/$/, "") || API_BASE;
