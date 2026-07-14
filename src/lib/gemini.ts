import { createServerFn } from "@tanstack/react-start";

export const callGeminiServerFn = createServerFn({ method: "POST" })
  .validator((data: {
    text: string;
    driverName: string;
    driverNumber: string | number;
    teamName: string;
    apiUrl: string;
    apiKey: string;
    model?: string;
  }) => data)
  .handler(async ({ data }) => {
    const { text, driverName, driverNumber, teamName, apiUrl, apiKey, model } = data;
    try {
      const isGemini = apiUrl.includes("generativelanguage.googleapis.com");
      
      if (isGemini) {
        // Access key from environment (Cloudflare edge bindings or system environment variables)
        const resolvedApiKey = (typeof process !== "undefined" ? process.env?.GEMINI_API_KEY : null) 
          || (globalThis as any).GEMINI_API_KEY 
          || apiKey;

        const systemInstruction = `You are 'Mini', a helpful, expert F1 telemetry and race engineer companion. Keep answers clear, technical, and F1-themed. Respond in a highly professional, telemetry-focused paddock tone. The user is acting as ${driverName} (#${driverNumber}) of ${teamName}.`;
        
        const response = await fetch(`${apiUrl}?key=${resolvedApiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `${systemInstruction}\n\nDriver Radio Command: ${text}`
                  }
                ]
              }
            ]
          }),
        });
        const dataJson = await response.json();
        if (dataJson.error) {
          return `Error [${dataJson.error.code}]: ${dataJson.error.message}`;
        } else if (dataJson.promptFeedback?.blockReason) {
          return `Comms blocked by safety protocol: ${dataJson.promptFeedback.blockReason}`;
        } else {
          return dataJson.candidates?.[0]?.content?.parts?.[0]?.text || "Error: Empty response payload received from Gemini API.";
        }
      } else {
        // Standard OpenAI compatible API
        const resolvedApiKey = (typeof process !== "undefined" ? (process.env?.NVIDIA_API_KEY || process.env?.GEMINI_API_KEY) : null) 
          || (globalThis as any).NVIDIA_API_KEY 
          || (globalThis as any).GEMINI_API_KEY
          || apiKey;

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resolvedApiKey}`,
          },
          body: JSON.stringify({
            model: model || "gpt-4o-mini",
            messages: [
              {
                role: "user",
                content: `[System Instruction: You are 'Mini', a helpful, expert F1 telemetry and race engineer companion. Keep answers clear, technical, and F1-themed. Respond in a highly professional, telemetry-focused paddock tone. The user is acting as ${driverName} (#${driverNumber}) of ${teamName}.]\n\nDriver Command: ${text}`
              }
            ],
            max_tokens: 8192,
            temperature: 1.00,
            top_p: 0.95,
          }),
        });
        const dataJson = await response.json();
        return dataJson.choices?.[0]?.message?.content || "Connection established, but no response payload found.";
      }
    } catch (e: any) {
      console.error("Server function call failed:", e);
      return `Error: ${e.message || "Failed to contact AI API from server."}`;
    }
  });
