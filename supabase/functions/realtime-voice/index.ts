
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }
    
    const upgradeHeader = req.headers.get('Upgrade');
    
    // WebSocket upgrade
    if (upgradeHeader?.toLowerCase() === 'websocket') {
      const { socket, response } = Deno.upgradeWebSocket(req);
      
      console.log("WebSocket connection established");
      
      // Client WebSocket connection
      let openAISocket: WebSocket | null = null;
      
      // Handle messages from client
      socket.onmessage = async (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("Received message:", message.type);
          
          // Initialize OpenAI WebSocket connection
          if (message.type === 'session.initialize') {
            if (openAISocket) {
              openAISocket.close();
            }
            
            // Create OpenAI WebSocket connection
            const url = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01`;
            openAISocket = new WebSocket(url);
            
            console.log("Connecting to OpenAI Realtime API");
            
            // Set up event handlers for OpenAI WebSocket
            openAISocket.onopen = () => {
              console.log("Connected to OpenAI Realtime API");
              
              // Send OpenAI API key for authentication
              openAISocket.send(JSON.stringify({
                type: "auth",
                client_id: "user",
                auth_key: OPENAI_API_KEY
              }));
              
              // Send configuration after connecting
              socket.send(JSON.stringify({
                type: 'session.connected'
              }));
            };
            
            // Forward messages from OpenAI to client
            openAISocket.onmessage = (aiEvent) => {
              socket.send(aiEvent.data);
            };
            
            // Handle OpenAI WebSocket errors
            openAISocket.onerror = (error) => {
              console.error("OpenAI WebSocket error:", error);
              socket.send(JSON.stringify({
                type: 'error',
                message: 'Error connecting to OpenAI'
              }));
            };
            
            // Handle OpenAI WebSocket close
            openAISocket.onclose = () => {
              console.log("OpenAI WebSocket closed");
              socket.send(JSON.stringify({
                type: 'session.disconnected'
              }));
            };
          } 
          // Forward messages to OpenAI
          else if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
            openAISocket.send(event.data);
          }
        } catch (error) {
          console.error("Error handling message:", error);
          socket.send(JSON.stringify({
            type: 'error',
            message: error.message
          }));
        }
      };
      
      // Handle client disconnect
      socket.onclose = () => {
        console.log("WebSocket connection closed");
        if (openAISocket) {
          openAISocket.close();
        }
      };
      
      socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        if (openAISocket) {
          openAISocket.close();
        }
      };
      
      return response;
    }
    
    // Non-WebSocket request
    return new Response(JSON.stringify({ error: "WebSocket upgrade required" }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
