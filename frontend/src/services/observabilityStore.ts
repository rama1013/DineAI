// Global store for observability data that persists across chat sessions

interface LogEntry {
  timestamp: string;
  agent?: string;
  agentName?: string;
  action?: string;
  details?: string;
  type?: string;
  confidence?: string;
  reasoningType?: string;
  stage?: string;
  status?: string;
  component?: string;
  message?: string;
  responseType?: string;
  attachment?: any; // <-- Add attachment field for agent-response logs
}

interface FlowStep {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  timestamp?: number;
}

interface FlowState {
  highlightedNodes: string[];
  flowSteps: FlowStep[];
}

class ObservabilityStore {
  private static instance: ObservabilityStore;
  private logs: LogEntry[] = [];
  private flowState: FlowState = {
    highlightedNodes: [],
    flowSteps: [],
  };
  private listeners: Set<(logs: LogEntry[], flowState: FlowState) => void> = new Set();
  private agentTimeouts: Record<string, NodeJS.Timeout> = {};

  static getInstance(): ObservabilityStore {
    if (!ObservabilityStore.instance) {
      ObservabilityStore.instance = new ObservabilityStore();
    }
    return ObservabilityStore.instance;
  }

  constructor() {
    if (ObservabilityStore.instance) {
      return ObservabilityStore.instance;
    }
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Listen for agent events
    const handleAgentEvent = (event: CustomEvent) => {
      const detail = event.detail;
      const newLog: LogEntry = {
        timestamp: detail.timestamp,
        agent: detail.agentName || detail.agent || 'Unknown',
        action: detail.stage || detail.reasoningType || detail.component || detail.action || 'Unknown',
        details: detail.details || detail.message || '',
        type: detail.type || undefined,
        attachment: detail.attachment // <-- Ensure attachment is included in logs
      };
      this.logs = [newLog, ...this.logs].slice(0, 200); // Keep only last 200 logs
      this.notifyListeners();
    };

    // Highlight nodes based on invokedAgent
    const handleInvokedAgent = (event: CustomEvent) => {
      const { invokedAgent, isNewRequest } = event.detail;
      if (isNewRequest) {
        this.flowState.highlightedNodes = [];
        this.notifyListeners();
        return;
      }
      // Only highlight if invokedAgent is a specialised agent
      const specialisedAgents = [
        'Return Agent',
        'Refund Agent',
        'Order Modification Agent',
        'General Agent',
        'Greeting Agent'
      ];
      if (specialisedAgents.includes(invokedAgent)) {
        this.flowState.highlightedNodes = [
          'Orchestrator Agent',
          invokedAgent,
          'Conversational Agent'
        ];
        this.notifyListeners();
      }
    };

    // Listen on window for global events
    if (typeof window !== 'undefined') {
      window.addEventListener('agent-flow', handleAgentEvent as EventListener);
      window.addEventListener('agent-reasoning', handleAgentEvent as EventListener);
      window.addEventListener('agent-response', handleAgentEvent as EventListener);
      window.addEventListener('invoked-agent', handleInvokedAgent as EventListener);
      window.addEventListener('clear-all', () => {
        this.flowState.highlightedNodes = [];
        this.notifyListeners();
      });
    }
  }

  subscribe(listener: (logs: LogEntry[], flowState: FlowState) => void): () => void {
    this.listeners.add(listener);
    
    // Immediately call with current state
    listener(this.logs, this.flowState);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => {
      listener(this.logs, this.flowState);
    });
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }

  getFlowState(): FlowState {
    return this.flowState;
  }

  // Only clear the lights/flow state, keep logs persistent
  clearLights() {
    console.log('💡 Clearing agent lights for new request (keeping logs)');
    this.flowState = {
      highlightedNodes: [],
      flowSteps: [],
    };
    
    // Clear all agent timeouts
    Object.values(this.agentTimeouts).forEach(timeout => {
      if (timeout) clearTimeout(timeout);
    });
    this.agentTimeouts = {};
    
    this.notifyListeners();
  }

  // Only clear logs (for session end or manual clear)
  clearLogs() {
    console.log('🧹 Clearing all logs (session end)');
    this.logs = [];
    this.notifyListeners();
  }

  // Clear everything (for complete reset)
  clearAll() {
    console.log('🧹 Clearing all agent observability data and lights');
    this.logs = [];
    this.flowState = {
      highlightedNodes: [],
      flowSteps: [],
    };
    
    // Clear all agent timeouts
    Object.values(this.agentTimeouts).forEach(timeout => {
      if (timeout) clearTimeout(timeout);
    });
    this.agentTimeouts = {};
    
    this.notifyListeners();
  }
}

export const observabilityStore = ObservabilityStore.getInstance();
export type { LogEntry, FlowState };
