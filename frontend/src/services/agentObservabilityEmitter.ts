// Event emitter for agent observability
class AgentObservabilityEmitter extends EventTarget {
  private static instance: AgentObservabilityEmitter;

  static getInstance(): AgentObservabilityEmitter {
    if (!AgentObservabilityEmitter.instance) {
      AgentObservabilityEmitter.instance = new AgentObservabilityEmitter();
    }
    return AgentObservabilityEmitter.instance;
  }

  // Emit agent flow events
  emitAgentInvocation(agentName: string, stage: string, details: string, status: 'started' | 'completed' | 'in-progress' | 'failed') {
    const event = new CustomEvent('agent-flow', {
      detail: {
        timestamp: new Date().toISOString(),
        agentName,
        stage,
        details,
        status,
        type: 'invocation'
      }
    });
    this.dispatchEvent(event);
    window.dispatchEvent(event); // Also dispatch to window for global listening
  }

  // Emit agent reasoning events
  emitAgentReasoning(agentName: string, reasoningType: string, details: string, confidence: number) {
    const event = new CustomEvent('agent-reasoning', {
      detail: {
        timestamp: new Date().toISOString(),
        agentName,
        reasoningType,
        details,
        confidence: `${confidence}%`,
        type: 'reasoning'
      }
    });
    this.dispatchEvent(event);
    window.dispatchEvent(event); // Also dispatch to window for global listening
  }

  // Emit agent response events
  emitAgentResponse(agentName: string, component: string, message: string, type: 'system' | 'validation' | 'analysis' | 'output', attachment?: any) {
    const event = new CustomEvent('agent-response', {
      detail: {
        timestamp: new Date().toISOString(),
        agentName,
        component,
        message,
        type,
        responseType: 'response',
        attachment // <-- Emit attachment if provided
      }
    });
    this.dispatchEvent(event);
    window.dispatchEvent(event); // Also dispatch to window for global listening
  }

  // Clear all events
  clearAll() {
    const event = new CustomEvent('clear-all');
    this.dispatchEvent(event);
    window.dispatchEvent(event); // Also dispatch to window for global listening
  }

  // Clear only agent lights/highlights, keep logs persistent
  clearLights() {
    const event = new CustomEvent('clear-lights');
    this.dispatchEvent(event);
    window.dispatchEvent(event); // Also dispatch to window for global listening
  }
}

export const agentObservabilityEmitter = AgentObservabilityEmitter.getInstance();

// Helper functions for agents to use
export const emitAgentFlow = (agentName: string, stage: string, details: string, status: 'started' | 'completed' | 'in-progress' | 'failed' = 'started') => {
  agentObservabilityEmitter.emitAgentInvocation(agentName, stage, details, status);
};

export const emitAgentReasoning = (agentName: string, reasoningType: string, details: string, confidence: number = 100) => {
  agentObservabilityEmitter.emitAgentReasoning(agentName, reasoningType, details, confidence);
};

export const emitAgentResponse = (agentName: string, component: string, message: string, type: 'system' | 'validation' | 'analysis' | 'output' = 'system', attachment?: any) => {
  agentObservabilityEmitter.emitAgentResponse(agentName, component, message, type, attachment);
};

// Types for the events
export type AgentFlowEvent = {
  timestamp: string;
  agentName: string;
  stage: string;
  details: string;
  status: 'started' | 'completed' | 'in-progress' | 'failed';
  type: 'invocation';
};

export type AgentReasoningEvent = {
  timestamp: string;
  agentName: string;
  reasoningType: string;
  details: string;
  confidence: string;
  type: 'reasoning';
};

export type AgentResponseEvent = {
  timestamp: string;
  agentName: string;
  component: string;
  message: string;
  type: 'system' | 'validation' | 'analysis' | 'output';
  responseType: 'response';
  attachment?: any; // Optional order/product card attachment
};
