// Chat API service to communicate with the backend

// Determine API base URL - use environment variable or construct from current host
const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // In production, try to use the backend service URL
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('azurecontainerapps.io')) {
      // Replace frontend hostname with backend hostname
      const backendHostname = hostname.replace('customersupportai-frontend', 'customersupportai-backend');
      return `https://${backendHostname}/api`;
    }
  }
  
  // Fallback for development
  return 'http://localhost:8001/api';
};

const API_BASE_URL = getApiBaseUrl();

interface OrderAttachment {
  order_id: string;
  status: string;
  product_name: string;
  product_brand: string;
  product_image: string;
  order_total: string;
}

export interface ChatMessage {
  message: string;
  timestamp?: string;
}

export interface ChatResponse {
  response: string;
  agent_used: string;
  timestamp: string;
  session_id: string;
  agent_logs: any[];
  invokedAgent?: string;
  attachment?: OrderAttachment; // <-- Add this line to match backend and fix TS error
}

export interface StreamResponse {
  type: 'metadata' | 'content' | 'status' | 'status_complete' | 'done' | 'error' | 'observability' | 'attachment';
  content?: string;
  message?: string;
  agent_used?: string;
  session_id?: string;
  error?: string;
  event?: Record<string, unknown>; // For observability events
  attachment?: OrderAttachment; // For order attachments
  invokedAgent?: string; // Added for agent highlighting
}

export interface ChatHistoryItem {
  user_message: string;
  bot_response: string;
  timestamp: string;
  agent_used: string;
}

export interface SessionInfo {
  session_id: string;
  email: string;
  created_at: string;
  last_activity: string;
  message_count: number;
}

class ChatService {
  private getSessionId(): string | null {
    return localStorage.getItem('sessionId');
  }

  private async makeRequest(url: string, options: RequestInit = {}) {
    const sessionId = this.getSessionId();
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const requestOptions = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    // Add session ID as query parameter for GET requests or in body for POST
    if (sessionId) {
      if (options.method === 'GET' || !options.method) {
        url += (url.includes('?') ? '&' : '?') + `session_id=${sessionId}`;
      }
    }

    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async signin(email: string, password: string): Promise<{ session_id: string, email: string, message: string, success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async sendMessage(message: string): Promise<ChatResponse> {
    const sessionId = this.getSessionId();
    if (!sessionId) {
      throw new Error('No active session found');
    }

    const response = await this.makeRequest(`${API_BASE_URL}/chat/message?session_id=${sessionId}`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });

    return response;
  }

  async getChatHistory(): Promise<{ chat_history: ChatHistoryItem[], message_count: number, session_id: string }> {
    return this.makeRequest(`${API_BASE_URL}/chat/history`);
  }

  async clearChatHistory(): Promise<{ message: string, success: boolean, session_id: string }> {
    return this.makeRequest(`${API_BASE_URL}/chat/clear`, {
      method: 'DELETE',
    });
  }

  async getSessionInfo(): Promise<SessionInfo> {
    return this.makeRequest(`${API_BASE_URL}/session/info`);
  }

  async validateSession(): Promise<{ valid: boolean, email?: string, session_id?: string }> {
    try {
      return await this.makeRequest(`${API_BASE_URL}/session/validate`);
    } catch (error) {
      return { valid: false };
    }
  }

  async signOut(): Promise<{ message: string, success: boolean }> {
    const sessionId = this.getSessionId();
    if (sessionId) {
      const result = await this.makeRequest(`${API_BASE_URL}/auth/signout?session_id=${sessionId}`, {
        method: 'POST',
      });
      
      // Clear local storage
      localStorage.removeItem('user');
      localStorage.removeItem('sessionId');
      
      return result;
    }
    
    // Clear local storage even if no session ID
    localStorage.removeItem('user');
    localStorage.removeItem('sessionId');
    
    return { message: 'Signed out locally', success: true };
  }

  async checkHealth(): Promise<{ status: string, message: string, timestamp: string, active_sessions: number }> {
    return fetch(`${API_BASE_URL}/health`).then(res => res.json());
  }
}

export const chatService = new ChatService();
