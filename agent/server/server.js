import http from "node:http";
import { AGENT_PORT } from "../config.js";
import { sendJson } from "./utils.js";
import { handleAgentRoutes } from "./routes.js";

export function createAgentServer() {
  const server = http.createServer(async (req, res) => {
    // CORS preflight
    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      });
      res.end();
      return;
    }

    const url = new URL(req.url, `http://localhost:${AGENT_PORT}`);
    const pathname = url.pathname;

    try {
      await handleAgentRoutes(req, res, pathname);
    } catch (err) {
      console.error("[Agent HTTP Error]", err);
      return sendJson(res, 500, { error: err.message });
    }
  });

  return server;
}
