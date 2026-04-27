// Cloudflare Worker entry — routes /api/chat to the Anthropic Messages API
// and serves all other paths as static assets via the ASSETS binding.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat") {
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
      }
      if (request.method !== "POST") {
        return new Response("Method Not Allowed", {
          status: 405,
          headers: { Allow: "POST, OPTIONS" },
        });
      }
      try {
        const body = await request.json();
        const apiKey =
          env.ANTHROPIC_API_KEY ||
          env["anthropic-api-key"] ||
          env.anthropic_api_key ||
          env.AnthropicApiKey;
        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: "ANTHROPIC_API_KEY env var not set" }),
            { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
        const upstream = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: body.model || "claude-sonnet-4-6",
            max_tokens: body.max_tokens || 1000,
            system: body.system,
            messages: body.messages,
          }),
        });
        const data = await upstream.json();
        return new Response(JSON.stringify(data), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
