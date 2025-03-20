import { toast } from 'sonner';

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private messageHandlers: ((data: any) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;
  private connectionTimeoutId: number | null = null;
  private heartbeatIntervalId: number | null = null;
  private lastMessageTime: number = 0;
  private isDebugMode = false;
  
  constructor(private wsUrl: string, debug = false) {
    this.isDebugMode = debug;
  }
  
  private debugLog(...args: any[]) {
    if (this.isDebugMode) {
      console.log('[WebSocketService]', ...args);
    }
  }
  
  public connect(): Promise<void> {
    if (this.isConnecting) {
      return Promise.reject(new Error('Connection already in progress'));
    }
    
    if (this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }
    
    this.isConnecting = true;
    this.debugLog('Connecting to WebSocket URL:', this.wsUrl);
    
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);
        
        // Set connection timeout
        this.connectionTimeoutId = window.setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            this.debugLog('WebSocket connection timeout');
            this.ws?.close();
            this.cleanup();
            this.isConnecting = false;
            reject(new Error('Timeout de conexão'));
          }
        }, 20000); // Increased timeout to 20 seconds
        
        this.ws.onopen = () => {
          this.debugLog('WebSocket connected successfully');
          
          if (this.connectionTimeoutId !== null) {
            clearTimeout(this.connectionTimeoutId);
            this.connectionTimeoutId = null;
          }
          
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          this.lastMessageTime = Date.now();
          
          // Set up heartbeat to keep connection alive
          this.startHeartbeat();
          
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          this.lastMessageTime = Date.now();
          
          try {
            const data = JSON.parse(event.data);
            this.debugLog('Received message:', data.type);
            
            // Check for error messages from the server
            if (data.type === 'error') {
              console.error('Server error:', data.message);
              toast.error('Erro do servidor: ' + data.message);
            } else if (data.type === 'session.disconnected') {
              console.error('Session disconnected:', data.reason, 'code:', data.code);
              if (data.code !== 1000) {
                toast.error('Sessão desconectada: ' + (data.reason || 'Erro no servidor'));
                this.attemptReconnect();
              }
            }
            
            this.messageHandlers.forEach(handler => handler(data));
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        };
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          
          if (this.connectionTimeoutId !== null) {
            clearTimeout(this.connectionTimeoutId);
            this.connectionTimeoutId = null;
          }
          
          this.isConnecting = false;
          reject(new Error('Erro de conexão com o servidor'));
        };
        
        this.ws.onclose = (event) => {
          this.debugLog(`WebSocket closed: code=${event.code}, reason=${event.reason}`);
          
          if (this.connectionTimeoutId !== null) {
            clearTimeout(this.connectionTimeoutId);
            this.connectionTimeoutId = null;
          }
          
          this.stopHeartbeat();
          
          if (event.code !== 1000) {
            // Not a normal close, attempt to reconnect
            this.isConnecting = false;
            this.attemptReconnect();
          } else {
            this.isConnecting = false;
          }
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        this.cleanup();
        this.isConnecting = false;
        reject(error);
      }
    });
  }
  
  private cleanup() {
    if (this.connectionTimeoutId !== null) {
      clearTimeout(this.connectionTimeoutId);
      this.connectionTimeoutId = null;
    }
    
    this.stopHeartbeat();
  }
  
  private startHeartbeat() {
    this.stopHeartbeat();
    
    // Send a ping every 30 seconds to keep the connection alive
    this.heartbeatIntervalId = window.setInterval(() => {
      const timeSinceLastMessage = Date.now() - this.lastMessageTime;
      
      // If no message received in 40 seconds, consider connection stale
      if (timeSinceLastMessage > 40000) {
        this.debugLog('Connection seems stale, reconnecting...');
        this.reconnect();
        return;
      }
      
      // Only send ping if connection is open
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.debugLog('Sending heartbeat ping');
        try {
          this.ws.send(JSON.stringify({ type: 'ping' }));
        } catch (error) {
          console.error('Error sending heartbeat:', error);
          this.reconnect();
        }
      }
    }, 30000);
  }
  
  private stopHeartbeat() {
    if (this.heartbeatIntervalId !== null) {
      clearInterval(this.heartbeatIntervalId);
      this.heartbeatIntervalId = null;
    }
  }
  
  private reconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.attemptReconnect();
  }
  
  private attemptReconnect(): void {
    if (this.isConnecting) {
      return;
    }
    
    this.reconnectAttempts++;
    this.debugLog(`Attempting to reconnect (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    if (this.reconnectAttempts > this.maxReconnectAttempts) {
      toast.error(`Falha ao reconectar após ${this.maxReconnectAttempts} tentativas`);
      return;
    }
    
    // Exponential backoff with jitter
    const baseDelay = 1000;
    const maxDelay = 10000;
    const exponentialDelay = Math.min(baseDelay * Math.pow(2, this.reconnectAttempts - 1), maxDelay);
    const jitter = Math.random() * 0.3 * exponentialDelay; // 0-30% jitter
    const delay = exponentialDelay + jitter;
    
    setTimeout(() => {
      this.debugLog(`Reconnecting after ${delay}ms delay...`);
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }
  
  public send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.debugLog('Sending message:', message.type);
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Erro ao enviar mensagem');
        this.reconnect();
      }
    } else {
      console.error('WebSocket not connected, cannot send message');
      if (!this.isConnecting) {
        toast.error('Conexão perdida. Tentando reconectar...');
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }
    }
  }
  
  public addMessageHandler(handler: (data: any) => void): void {
    this.messageHandlers.push(handler);
  }
  
  public close(): void {
    this.cleanup();
    
    if (this.ws) {
      // Use 1000 (Normal Closure) as the close code
      this.ws.close(1000, 'Client closed connection');
      this.ws = null;
    }
  }
  
  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
