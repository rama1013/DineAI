'use client';

import React, { useState } from 'react';
import ChatBox from './ChatBox';
import '../styles/chat.css';
import { AgentFlowDisplay } from './AgentFlowDisplay';
import { observabilityStore, FlowState } from '../services/observabilityStore';
import type { LogEntry } from '../services/observabilityStore';

// Agent Observability Icon component
function AgentObservabilityIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
    </svg>
  );
}

// Visualize the agent workflow
function AgentFlowWrapper() {
  const [flowState, setFlowState] = useState<FlowState>({
    highlightedNodes: [],
    flowSteps: []
  });

  React.useEffect(() => {
    // Subscribe to the persistent observability store
    const unsubscribe = observabilityStore.subscribe((logs, newFlowState) => {
      setFlowState(newFlowState);
    });

    return unsubscribe;
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ marginBottom: '15px', color: '#333' }}>Agent Flow Visualization</h3>
      <div style={{ height: '400px' }}>
        <AgentFlowDisplay
          highlightedNodes={flowState.highlightedNodes || []}
          flowSteps={flowState.flowSteps || []}
        />
      </div>
    </div>
  );
}

// AgentObservabilityPaneUI component with comprehensive monitoring
interface AgentObservabilityPaneUIProps {
  open: boolean;
  onClose: () => void;
}

function AgentObservabilityPaneUI({ open, onClose }: AgentObservabilityPaneUIProps) {
  const [activeTab, setActiveTab] = useState('visuals');
  const [logs, setLogs] = useState<LogEntry[]>([]);

  React.useEffect(() => {
    // Subscribe to the persistent observability store for logs
    const unsubscribe = observabilityStore.subscribe((newLogs, flowState) => {
      setLogs(newLogs);
    });

    return unsubscribe;
  }, []);

  if (!open) return null;

  const headerButtonStyle = (isActive: boolean) => ({
    padding: '8px 16px',
    border: '1px solid #D7191F',
    backgroundColor: isActive ? '#D7191F' : 'white',
    color: isActive ? 'white' : '#D7191F',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    marginLeft: '8px',
  });

  return (
    <div className="agent-observability-pane">
      <div className="agent-observability-header">
        <h2>Agent Observability</h2>
        <div className="header-controls">
          <button 
            onClick={() => setActiveTab('text')}
            style={headerButtonStyle(activeTab === 'text')}
          >
            Text
          </button>
          <button 
            onClick={() => setActiveTab('visuals')}
            style={headerButtonStyle(activeTab === 'visuals')}
          >
            Visuals
          </button>
          <button onClick={onClose} className="close-button">×</button>
        </div>
      </div>
      <div className="agent-observability-content">
        {activeTab === 'visuals' ? (
          <AgentFlowWrapper />
        ) : (
          <div className="agent-logs">
            <div className="logs-header">
              <h3>Agent Activity Logs</h3>
              <span className="logs-count">{logs.length} entries</span>
            </div>
            <div className="logs-container">
              {logs.map((log, index) => (
                <span key={index} className="log-line">
                  <span className="log-timestamp">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <span className="log-agent">{log.agent}</span>
                  <span className="log-action">{log.action}</span>
                  <span className="log-details">{log.details}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main ChatLayout component
function ChatLayout() {
  return (
    <div className="chat-layout">
      <div className="chat-container">
        <ChatBox onClose={() => {}} />
      </div>
    </div>
  );
}

export default ChatLayout;
