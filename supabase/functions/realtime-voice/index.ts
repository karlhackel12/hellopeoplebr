
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
      console.error('OPENAI_API_KEY is not set');
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Validate API key format (basic validation)
    if (!OPENAI_API_KEY.startsWith('sk-') || OPENAI_API_KEY.length < 20) {
      console.error('OPENAI_API_KEY has invalid format');
      return new Response(JSON.stringify({ error: 'Invalid API key format' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const upgradeHeader = req.headers.get('Upgrade');
    
    // WebSocket upgrade
    if (upgradeHeader?.toLowerCase() === 'websocket') {
      console.log("Attempting WebSocket upgrade");
      
      try {
        const { socket, response } = Deno.upgradeWebSocket(req);
        
        console.log("WebSocket connection established with client");
        
        // Client WebSocket connection
        let openAISocket: WebSocket | null = null;
        let connectionTimer: number | null = null;
        
        // Handle messages from client
        socket.onmessage = async (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log("Received message type:", message.type);
            
            // Initialize OpenAI WebSocket connection
            if (message.type === 'session.initialize') {
              if (openAISocket) {
                openAISocket.close();
              }
              
              // Clear any existing connection timeout
              if (connectionTimer !== null) {
                clearTimeout(connectionTimer);
              }
              
              // Use gpt-4o model - stable version
              const url = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime`;
              console.log("Connecting to OpenAI at:", url);
              
              openAISocket = new WebSocket(url);
              
              // Set up connection timeout
              connectionTimer = setTimeout(() => {
                if (openAISocket && openAISocket.readyState !== WebSocket.OPEN) {
                  console.error("OpenAI WebSocket connection timeout");
                  socket.send(JSON.stringify({
                    type: 'error',
                    message: 'Timeout connecting to OpenAI service'
                  }));
                  openAISocket.close();
                }
              }, 15000);
              
              // Set up event handlers for OpenAI WebSocket
              openAISocket.onopen = () => {
                console.log("Connected to OpenAI Realtime API");
                
                if (connectionTimer !== null) {
                  clearTimeout(connectionTimer);
                  connectionTimer = null;
                }
                
                // Send OpenAI API key for authentication
                openAISocket.send(JSON.stringify({
                  type: "auth",
                  client_id: "user",
                  auth_key: OPENAI_API_KEY
                }));
                
                // Send confirmation to client
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
                  message: 'Error connecting to OpenAI service'
                }));
              };
              
              // Handle OpenAI WebSocket close
              openAISocket.onclose = (closeEvent) => {
                console.log(`OpenAI WebSocket closed: code=${closeEvent.code}, reason=${closeEvent.reason}`);
                socket.send(JSON.stringify({
                  type: 'session.disconnected',
                  reason: closeEvent.reason || 'Connection closed by server',
                  code: closeEvent.code
                }));
              };
            } 
            // Forward messages to OpenAI
            else if (openAISocket && openAISocket.readyState === WebSocket.OPEN) {
              openAISocket.send(event.data);
            } else {
              console.error("Cannot forward message: OpenAI WebSocket not connected");
              socket.send(JSON.stringify({
                type: 'error',
                message: 'Not connected to OpenAI service'
              }));
            }
          } catch (error) {
            console.error("Error handling message:", error);
            socket.send(JSON.stringify({
              type: 'error',
              message: error.message || 'Unknown error processing message'
            }));
          }
        };
        
        // Handle client disconnect
        socket.onclose = (closeEvent) => {
          console.log(`Client WebSocket closed: code=${closeEvent.code}, reason=${closeEvent.reason}`);
          
          if (connectionTimer !== null) {
            clearTimeout(connectionTimer);
            connectionTimer = null;
          }
          
          if (openAISocket) {
            openAISocket.close();
          }
        };
        
        socket.onerror = (error) => {
          console.error("Client WebSocket error:", error);
          
          if (connectionTimer !== null) {
            clearTimeout(connectionTimer);
            connectionTimer = null;
          }
          
          if (openAISocket) {
            openAISocket.close();
          }
        };
        
        return response;
      } catch (upgradeError) {
        console.error("WebSocket upgrade failed:", upgradeError);
        return new Response(JSON.stringify({ error: "WebSocket upgrade failed" }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Non-WebSocket request
    return new Response(JSON.stringify({ error: "WebSocket upgrade required" }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(JSON.stringify({ error: error.message || "Unknown server error" }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
