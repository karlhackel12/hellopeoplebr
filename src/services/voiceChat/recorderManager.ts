
import { AudioRecorder } from '@/utils/audioProcessing';
import { WebSocketService } from './websocketService';
import { toast } from 'sonner';

export class RecorderManager {
  private recorder: AudioRecorder | null = null;
  
  constructor(
    private webSocketService: WebSocketService,
    private audioQueueEncode: (audioData: Float32Array) => string,
    private debugLog: (...args: any[]) => void,
    private updateIsRecording: (isRecording: boolean) => void
  ) {}
  
  startRecording(): void {
    if (this.recorder) return;
    
    try {
      this.debugLog('Starting audio recorder');
      this.recorder = new AudioRecorder((audioData) => {
        if (this.webSocketService.isConnected()) {
          try {
            const base64Audio = this.audioQueueEncode(audioData);
            if (base64Audio) {
              this.webSocketService.send({
                type: 'input_audio_buffer.append',
                audio: base64Audio
              });
            }
          } catch (error) {
            console.error('Error encoding or sending audio data:', error);
          }
        }
      });
      
      this.recorder.start()
        .then(() => {
          this.updateIsRecording(true);
        })
        .catch(error => {
          console.error('Error starting recording:', error);
          toast.error('Falha ao iniciar gravação: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
        });
    } catch (error) {
      console.error('Error creating recorder:', error);
      toast.error('Falha ao acessar microfone');
    }
  }
  
  stopRecording(): void {
    if (this.recorder) {
      this.debugLog('Stopping audio recorder');
      this.recorder.stop();
      this.recorder = null;
      this.updateIsRecording(false);
    }
  }
  
  cleanup(): void {
    this.stopRecording();
  }
}
