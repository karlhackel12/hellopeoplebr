
import { toast } from 'sonner';

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private messageHandlers: ((data: any) => void)[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private isConnecting = false;
  
  constructor(private wsUrl: string) {}
  
  public connect(): Promise<void> {
    if (this.isConnecting) {
      return Promise.reject(new Error('Connection already in progress'));
    }
    
    this.isConnecting = true;
    
    return new Promise((resolve, reject) => {
      try {
        console.log('Connecting to WebSocket URL:', this.wsUrl);
        
        this.ws = new WebSocket(this.wsUrl);
        
        const connectionTimeout = setTimeout(() => {
          if (this.ws?.readyState !== WebSocket.OPEN) {
            console.error('WebSocket connection timeout');
            this.ws?.close();
            this.isConnecting = false;
            reject(new Error('Timeout de conexão'));
          }
        }, 15000); // Increased timeout to 15 seconds
        
        this.ws.onopen = () => {
          console.log('WebSocket connected successfully');
          clearTimeout(connectionTimeout);
          this.reconnectAttempts = 0;
          this.isConnecting = false;
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Received message:', data.type);
            
            // Check for error messages from the server
            if (data.type === 'error') {
              console.error('Server error:', data.message);
              toast.error('Erro do servidor: ' + data.message);
            }
            
            this.messageHandlers.forEach(handler => handler(data));
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        };
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          clearTimeout(connectionTimeout);
          this.isConnecting = false;
          reject(new Error('Erro de conexão com o servidor'));
        };
        
        this.ws.onclose = (event) => {
          console.log(`WebSocket closed: code=${event.code}, reason=${event.reason}`);
          clearTimeout(connectionTimeout);
          
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.isConnecting = false;
            this.attemptReconnect();
            resolve(); // Resolve anyway as we're trying to reconnect
          } else {
            this.isConnecting = false;
            reject(new Error(`Conexão fechada: ${event.reason || 'Razão desconhecida'}`));
          }
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        toast.error('Falha na conexão: ' + (error instanceof Error ? error.message : String(error)));
        this.isConnecting = false;
        reject(error);
      }
    });
  }
  
  private attemptReconnect(): void {
    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          toast.error(`Falha ao reconectar após ${this.maxReconnectAttempts} tentativas`);
        }
      });
    }, 1000 * Math.min(this.reconnectAttempts, 5)); // Exponential backoff up to 5 seconds
  }
  
  public send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Erro ao enviar mensagem');
      }
    } else {
      console.error('WebSocket not connected, cannot send message');
      toast.error('Conexão perdida. Por favor, tente novamente.');
    }
  }
  
  public addMessageHandler(handler: (data: any) => void): void {
    this.messageHandlers.push(handler);
  }
  
  public close(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  
  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
