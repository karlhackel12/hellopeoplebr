
import { config } from 'dotenv';
import { openai } from './config';
import { 
  SimulatedVoiceService, 
  DirectOpenAIVoiceService,
  EdgeFunctionVoiceService
} from './browserVoiceService';

// Load environment variables
config();

// Determine if we're using edge functions
const USE_EDGE_FUNCTIONS = import.meta.env.VITE_USE_EDGE_FUNCTIONS === 'true' || false;
const USE_SIMULATION = import.meta.env.VITE_USE_SIMULATION === 'true' || false;

// Select implementation based on environment
let voiceService: SimulatedVoiceService | DirectOpenAIVoiceService | EdgeFunctionVoiceService;

if (USE_SIMULATION) {
  console.log('Using simulated voice service');
  voiceService = new SimulatedVoiceService();
} else if (USE_EDGE_FUNCTIONS) {
  console.log('Using edge function voice service');
  voiceService = new EdgeFunctionVoiceService();
} else {
  console.log('Using direct OpenAI voice service');
  voiceService = new DirectOpenAIVoiceService();
}

export default voiceService;
