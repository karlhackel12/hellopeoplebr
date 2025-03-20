
import { toast } from 'sonner';

export interface WebSocketMessage {
  type: string;
  [key: string]: any;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private messageHandlers: ((data: any) => void)[] = [];
  
  constructor(private wsUrl: string) {}
  
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('Connecting to WebSocket URL:', this.wsUrl);
        
        this.ws = new WebSocket(this.wsUrl);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log('Received message:', data.type);
          
          this.messageHandlers.forEach(handler => handler(data));
        };
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          toast.error('Connection error occurred');
          reject(error);
        };
        
        this.ws.onclose = () => {
          console.log('WebSocket closed');
        };
      } catch (error) {
        console.error('Error connecting:', error);
        reject(error);
      }
    });
  }
  
  public send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected');
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
