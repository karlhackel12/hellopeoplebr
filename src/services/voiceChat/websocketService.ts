
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
  
  constructor(private wsUrl: string) {}
  
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('Connecting to WebSocket URL:', this.wsUrl);
        
        this.ws = new WebSocket(this.wsUrl);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected successfully');
          this.reconnectAttempts = 0;
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('Received message:', data.type);
            
            this.messageHandlers.forEach(handler => handler(data));
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        };
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
        
        this.ws.onclose = (event) => {
          console.log(`WebSocket closed: code=${event.code}, reason=${event.reason}`);
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect(resolve, reject);
          } else {
            reject(new Error(`Connection closed: ${event.reason}`));
          }
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        toast.error('Connection failed: ' + error.message);
        reject(error);
      }
    });
  }
  
  private attemptReconnect(resolve: (value: void) => void, reject: (reason: any) => void): void {
    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      try {
        this.ws = new WebSocket(this.wsUrl);
        
        this.ws.onopen = () => {
          console.log('WebSocket reconnected successfully');
          this.reconnectAttempts = 0;
          resolve();
        };
        
        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          this.messageHandlers.forEach(handler => handler(data));
        };
        
        this.ws.onerror = (error) => {
          console.error('WebSocket reconnection error:', error);
          reject(error);
        };
        
        this.ws.onclose = (event) => {
          console.log(`WebSocket reconnection closed: code=${event.code}, reason=${event.reason}`);
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect(resolve, reject);
          } else {
            reject(new Error(`Reconnection failed after ${this.maxReconnectAttempts} attempts`));
          }
        };
      } catch (error) {
        console.error('Error during reconnection:', error);
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.attemptReconnect(resolve, reject);
        } else {
          reject(new Error(`Failed to reconnect after ${this.maxReconnectAttempts} attempts`));
        }
      }
    }, 1000 * this.reconnectAttempts); // Exponential backoff
  }
  
  public send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected, cannot send message');
      toast.error('Connection lost. Please try again.');
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
