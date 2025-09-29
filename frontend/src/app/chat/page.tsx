"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import ChatButton from "../../components/ChatButton";
import ChatLayout from "../../components/ChatLayout";
import { chatService } from "../../services/chatService";
import { AgentFlowDisplay } from "../../components/AgentFlowDisplay";
import { 
  agentObservabilityEmitter, 
  AgentFlowEvent, 
  AgentReasoningEvent, 
  AgentResponseEvent 
} from "../../services/agentObservabilityEmitter";
import { observabilityStore, LogEntry as ObservabilityLogEntry, FlowState } from "../../services/observabilityStore";
import "../../styles/fonts.css";
import "../../styles/chat.css";
import OrderCard from '../../components/OrderCard';

type LogEntry = {
  type: string;
  timestamp: string;
  agent?: string;
  agentName?: string;
  reasoningType?: string;
  stage?: string;
  status?: string;
  component?: string;
  message?: string;
  action?: string;
  details?: string;
  confidence?: string;
  responseType?: string;
  attachment?: any; // <-- Add attachment field for agent-response logs
};

type LogGroup = {
  id: string;
  title: string;
  logs: LogEntry[];
  isExpanded: boolean;
};

export default function ChatPage() {
  const [chatOpen, setChatOpen] = useState(false);
  const [obsOpen, setObsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [observabilityPaneTab, setObservabilityPaneTab] = useState('flow');
  const [textPaneSection, setTextPaneSection] = useState('agent-flow'); // Default to agent reasoning
  const [logGroups, setLogGroups] = useState<LogGroup[]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  const [agentFlowSteps, setAgentFlowSteps] = useState<any[]>([]);
  const [agentFlowLogs, setAgentFlowLogs] = useState<AgentFlowEvent[]>([]);
  const [agentReasoningLogs, setAgentReasoningLogs] = useState<AgentReasoningEvent[]>([]);
  const [agentResponseLogs, setAgentResponseLogs] = useState<AgentResponseEvent[]>([]);
  const router = useRouter();

  const toggleLogGroupExpansion = (groupId: string) => {
    setLogGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, isExpanded: !group.isExpanded }
        : group
    ));
  };

  useEffect(() => {
    // Check if user is signed in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // If no user data, redirect to signin
      router.push('/signin');
      return;
    }
    setIsLoading(false);

    // Set up observability store subscription
    const unsubscribe = observabilityStore.subscribe((logs: ObservabilityLogEntry[], flowState: FlowState) => {
      setHighlightedNodes(flowState.highlightedNodes || []);
      setAgentFlowSteps(flowState.flowSteps || []);
      // Separate logs by type
      const flowLogs: AgentFlowEvent[] = [];
      const reasoningLogs: AgentReasoningEvent[] = [];
      const responseLogs: AgentResponseEvent[] = [];
      logs.forEach((log: ObservabilityLogEntry) => {
        const agentName = typeof log.agentName === 'string' ? log.agentName : (typeof log.agent === 'string' ? log.agent : "Unknown");
        if (log.type === 'agent-reasoning') {
          reasoningLogs.push({
            timestamp: log.timestamp || "",
            agentName,
            reasoningType: typeof log.reasoningType === 'string' ? log.reasoningType : (typeof log.action === 'string' ? log.action : "Unknown"),
            details: typeof log.details === 'string' ? log.details : "",
            confidence: typeof log.confidence === 'string' ? log.confidence : '95%',
            type: 'reasoning'
          });
        } else if (log.type === 'agent-flow') {
          const validStatuses = ["started", "completed", "in-progress", "failed"];
          const status = validStatuses.includes(log.status as any)
            ? (log.status as "started" | "completed" | "in-progress" | "failed")
            : "started";
          flowLogs.push({
            timestamp: log.timestamp || "",
            agentName,
            stage: typeof log.stage === 'string' ? log.stage : (typeof log.action === 'string' ? log.action : "Unknown"),
            details: typeof log.details === 'string' ? log.details : "",
            status,
            type: 'invocation'
          });
        } else if (log.type === 'agent-response') {
          responseLogs.push({
            timestamp: log.timestamp || "",
            agentName,
            component: typeof log.component === 'string' ? log.component : (typeof log.action === 'string' ? log.action : "Unknown"),
            message: typeof log.message === 'string' ? log.message : (typeof log.details === 'string' ? log.details : ""),
            type: 'system',
            responseType: 'response',
            attachment: log.attachment // <-- Add attachment field
          });
        }
      });
      setAgentFlowLogs(flowLogs);
      setAgentReasoningLogs(reasoningLogs);
      setAgentResponseLogs(responseLogs);
    });
    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    // Clear logs and graph visuals for new session
    observabilityStore.clearAll();
  }, [user?.sessionId]);

  const handleSignOut = async () => {
    try {
      await chatService.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('sessionId');
    }
    observabilityStore.clearAll();
    setUser(null);
    router.push('/signin');
  };

  // Log agent/tool lifecycle events to browser console
  useEffect(() => {
    agentFlowLogs.forEach(log => {
      console.log(`[AgentFlow] ${log.agentName} - ${log.stage} - ${log.status} - ${log.timestamp}`);
    });
  }, [agentFlowLogs]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div 
        style={{
          backgroundImage: "url('/blur_bg_image_new.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <div style={{
          background: "rgba(255, 255, 255, 0.9)",
          padding: "20px",
          borderRadius: "8px",
          fontFamily: "'MacysSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{
        backgroundImage: "url('/blur_bg_image_new.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        width: "100%",
        position: "relative"
      }}
    >
      {/* Header with sign out and Agent Observability ribbon */}
      <header style={{
        position: "absolute",
        top: "10px",
        left: "0px",
        zIndex: "99",
        display: "flex",
        flexDirection: "column",
        gap: "8px"
      }}>
        
        <button
          onClick={handleSignOut}
          style={{
            background: "none",
            border: "none",
            padding: "0",
            marginLeft: "10px",
            cursor: "pointer"
          }}
          title="Sign Out"
        >
          <svg width="22" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 17V19C10 20.1046 10.8954 21 12 21H17C18.1046 21 19 20.1046 19 19V5C19 3.89543 18.1046 3 17 3H12C10.8954 3 10 3.89543 10 5V7" stroke="#D71A20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 12H15" stroke="#D71A20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 12L10 9" stroke="#D71A20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M7 12L10 15" stroke="#D71A20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <button
          onClick={() => setObsOpen(!obsOpen)}
          className="agent-obs-button"
          title="Agent Observability Dashboard"
        >
          <img 
            src="/Agent_Observability_ribbon.png" 
            alt="Agent Observability" 
            style={{
              width: "150px",
              height: "auto",
              display: "block"
            }}
          />
        </button>

        <div className={`observability-panel ${obsOpen ? 'open' : ''}`}>
          <div className="observability-content">
            <div className="observability-header">
              <h2>Agent Observability</h2>
              <div className="header-controls">
                <button 
                  className={`header-button ${observabilityPaneTab === 'logs' ? 'active' : ''}`}
                  onClick={() => setObservabilityPaneTab('logs')}
                >
                  Text
                </button>
                <button 
                  className={`header-button ${observabilityPaneTab === 'flow' ? 'active' : ''}`}
                  onClick={() => setObservabilityPaneTab('flow')}
                >
                  Visuals
                </button>
                <button 
                  onClick={() => setObsOpen(false)}
                  className="close-panel-button"
                  style={{
                    marginLeft: '16px'
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            <div className="observability-content-area">
              {observabilityPaneTab === 'flow' ? (
                <AgentFlowDisplay
                  highlightedNodes={highlightedNodes}
                  flowSteps={agentFlowSteps}
                />
              ) : (
                <div className="agent-logs">
                  <div className="text-sections-nav">
                    <button 
                      className={`section-btn ${textPaneSection === 'agent-flow' ? 'active' : ''}`}
                      onClick={() => setTextPaneSection('agent-flow')}
                    >
                      Agent Flow
                    </button>
                    <button 
                      className={`section-btn ${textPaneSection === 'agent-reasoning' ? 'active' : ''}`}
                      onClick={() => setTextPaneSection('agent-reasoning')}
                    >
                      Agent Reasoning
                    </button>
                    <button 
                      className={`section-btn ${textPaneSection === 'agent-response' ? 'active' : ''}`}
                      onClick={() => setTextPaneSection('agent-response')}
                    >
                      Agent Response
                    </button>
                  </div>
                  
                  <div className="text-section-content">
                    {textPaneSection === 'agent-flow' && (
                      <div className="section-panel">
                      
                        <div className="section-entries">
                          {agentFlowLogs.length === 0 ? (
                            <div className="empty-state">
                              <p>No agent flow events yet. Start a conversation to see agent activities.</p>
                            </div>
                          ) : (
                            agentFlowLogs.map((log, index) => (
                              <div key={index} className={`flow-entry ${log.status}`}>
                                <div className="entry-content">
                                  <div className="entry-action">
                                    <strong>{log.agentName}</strong> - {log.stage}
                                  </div>
                                  <div className="entry-details">{log.details}</div>
                                  <div className="entry-time">{new Date(log.timestamp).toLocaleTimeString()}</div>
                                </div>
                                <div className={`status-indicator ${log.status}`}></div>
                              </div>
                            ))
                         ) }
                        </div>
                      </div>
                    )}
                    
                    {textPaneSection === 'agent-reasoning' && (
                      <div className="section-panel">
                       
                        <div className="section-entries">
                          {agentReasoningLogs.length === 0 ? (
                            <div className="empty-state">
                              <p>No reasoning events yet. Agent reasoning will appear here during conversations.</p>
                            </div>
                          ) : (
                            agentReasoningLogs.map((log, index) => (
                              <div key={index} className="reasoning-entry">
                                <div className="reasoning-agent">
                                  <strong>{log.agentName}</strong>
                                </div>
                                <div className="reasoning-type">{log.reasoningType}</div>
                                <div className="reasoning-details">{log.details}</div>
                                <div className="reasoning-footer">
                                
                                  <span className="reasoning-time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                </div>
                              </div>
                            ))
                           ) }
                        </div>
                      </div>
                    )}
                    
                    {textPaneSection === 'agent-response' && (
                      <div className="section-panel">
                        
                        <div className="">
                          {agentResponseLogs.length === 0 ? (
                            <div className="empty-state">
                              <p>No response events yet. Agent responses will appear here during conversations.</p>
                            </div>
                          ) : (
                            agentResponseLogs.map((log, index) => {
                              console.log('AgentResponseLog attachment:', log.attachment);
                              return (
                                <div key={index} className={`response-entry ${log.type}`}>
                                  <div className="response-agent">
                                    <strong>{log.agentName}</strong>
                                  </div>
                                  <div className="response-component">{log.component}</div>
                                  <div className="response-message">{log.message}</div>
                                  {/* Render order card attachment if present */}
                                  {log.attachment && (
                                    <div className="attachment-container">
                                      <OrderCard attachment={log.attachment} />
                                    </div>
                                  )}
                                  <div className="response-time">{new Date(log.timestamp).toLocaleTimeString()}</div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Chat Components - Clean interface with observability integration */}
      {chatOpen && <ChatLayout />}
      {!chatOpen && <ChatButton onClick={() => setChatOpen(true)} />}
    </div>
  );
}