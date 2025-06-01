declare module '*.worker.ts' {
  class WebpackWorker extends Worker {
    constructor();
  }
  export default WebpackWorker;
}

interface WorkerMessage {
  type: 'generate' | 'progress' | 'stream' | 'complete' | 'error';
  data?: any;
  messages?: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  config?: {
    max_new_tokens?: number;
    temperature?: number;
    do_sample?: boolean;
    top_p?: number;
  };
  error?: string;
} 