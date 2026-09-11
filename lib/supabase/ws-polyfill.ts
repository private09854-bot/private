import ws from "ws";

// supabase-js builds a realtime client inside createClient() and throws if it
// can't find a WebSocket constructor. Node 20 ships without a global one
// (Node 22+ and the Edge runtime have it natively), so fill the gap here.
// Import this module *before* calling createClient.
if (typeof globalThis.WebSocket === "undefined") {
  (globalThis as unknown as { WebSocket: unknown }).WebSocket = ws;
}

export {};
