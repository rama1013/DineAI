import React, { useState, useRef, useEffect } from 'react';
import { chatService, ChatHistoryItem } from '../services/chatService';
import { agentObservabilityEmitter } from '../services/agentObservabilityEmitter';
import OrderCard from './OrderCard';

// Icon Components
const ChatIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_366_3268)">
      <path d="M31.8735 9.58221C31.8128 8.28273 31.7446 7.13081 31.4554 6.03547C31.3108 5.48838 31.1108 4.95587 30.8298 4.43153C30.5487 3.90719 30.1866 3.39043 29.7213 2.87309C28.8654 1.92122 27.9126 1.27615 26.8666 0.850378C25.8205 0.424023 24.6847 0.215219 23.4521 0.117233H23.4433L23.4346 0.11665C20.1897 0.112567 16.9093 0 13.6342 0C12.3228 0 11.012 0.0180807 9.70478 0.0682402C8.4599 0.116067 7.26226 0.21172 6.12292 0.513843C4.98358 0.815383 3.90255 1.32806 2.91073 2.20177C2.31541 2.72553 1.8402 3.28603 1.46353 3.87803C0.897943 4.76573 0.553343 5.72343 0.342268 6.73479C0.131193 7.74556 0.051311 8.81115 0.0139939 9.92516C0.00349848 10.236 0 10.5463 0 10.8566C0 11.6994 0.0279878 12.5399 0.0279878 13.3722C0.0279878 13.5985 0.0256555 13.8248 0.0209909 14.0499V14.0831L0.0285709 14.1152C0.108453 14.4185 0.284543 14.6757 0.514276 14.8577C0.74401 15.0397 1.02972 15.1487 1.33059 15.1487C1.52709 15.1487 1.72941 15.1015 1.9195 15.0006C1.99472 14.9609 2.06585 14.9102 2.13524 14.8513C2.23903 14.7632 2.33757 14.6571 2.4192 14.5404C2.46001 14.4821 2.49675 14.4209 2.52707 14.3567C2.55739 14.2925 2.58129 14.2249 2.59412 14.1526C2.63202 13.935 2.6431 13.6935 2.6431 13.4427C2.6431 12.9989 2.60812 12.5241 2.6087 12.1415C2.6087 12.0931 2.6087 12.0464 2.61045 12.0015C2.64077 10.8379 2.61336 9.48831 2.77021 8.21157C2.84834 7.5735 2.97196 6.9535 3.16904 6.386C3.36612 5.81792 3.63492 5.30291 4.00226 4.86722C4.35852 4.44436 4.70779 4.11424 5.0623 3.85353C5.59465 3.46334 6.13983 3.22595 6.76023 3.06906C7.38004 2.91275 8.07507 2.83926 8.8873 2.78443C10.6855 2.66312 12.5065 2.62229 14.3309 2.62229C16.3583 2.62229 18.3903 2.67245 20.402 2.71853C21.1559 2.73602 21.8807 2.72611 22.5739 2.74186C23.6147 2.7646 24.5821 2.84451 25.4736 3.14255C25.9196 3.29186 26.3476 3.49483 26.761 3.77421C27.1744 4.05359 27.5727 4.40937 27.9581 4.86664C28.3353 5.31457 28.603 5.80917 28.7942 6.33934C29.0811 7.13431 29.1936 8.01035 29.2368 8.90681C29.2805 9.80326 29.2549 10.719 29.2753 11.5944C29.3097 13.0875 29.3528 14.6022 29.3528 16.1094C29.3528 17.1003 29.3342 18.0889 29.2823 19.0659C29.2327 19.9973 29.0525 20.8226 28.7126 21.5639C28.3721 22.3058 27.8706 22.9666 27.1639 23.5709C26.6642 23.9978 26.1663 24.2836 25.6584 24.4796C24.8975 24.7735 24.1109 24.8645 23.2725 24.9001C22.4346 24.9357 21.5483 24.9153 20.6031 24.9993C20.2912 25.0272 20.0066 25.0832 19.7454 25.1684C19.353 25.2961 19.0125 25.4909 18.7104 25.7452C18.4078 25.9995 18.1431 26.3116 17.8889 26.6767C17.7577 26.8651 17.6317 27.0785 17.507 27.3025C17.3198 27.6385 17.1361 27.9983 16.9525 28.3261C16.77 28.6539 16.5857 28.9496 16.4119 29.1502C16.349 29.2231 16.2796 29.2739 16.2067 29.3077C16.1338 29.3415 16.0568 29.3579 15.9776 29.3579C15.8639 29.3579 15.7443 29.3229 15.6306 29.2494C15.3624 28.8615 15.1169 28.427 14.8656 27.9867C14.4773 27.3066 14.0767 26.6114 13.5327 26.0538C13.261 25.7756 12.952 25.5318 12.5922 25.348C12.233 25.1643 11.8237 25.0412 11.3578 24.9993C10.517 24.9234 9.63773 24.9497 8.78293 24.9182C7.92755 24.8873 7.09958 24.7986 6.3614 24.5099C5.80339 24.2924 5.23606 23.9342 4.73286 23.4986C4.22966 23.0634 3.79177 22.5514 3.48623 22.0352C3.39411 21.88 3.31539 21.7103 3.23493 21.5394C3.17487 21.4111 3.11365 21.2822 3.04309 21.1574C2.99003 21.0641 2.93173 20.9731 2.8635 20.8885C2.76147 20.7614 2.63435 20.6459 2.47517 20.566C2.31599 20.4849 2.12824 20.4417 1.91717 20.4423C1.80638 20.4423 1.68918 20.454 1.56382 20.4767C1.40755 20.5053 1.2647 20.566 1.14167 20.6488C0.956251 20.7736 0.813396 20.9462 0.716605 21.1399C0.619814 21.3335 0.56792 21.5487 0.567337 21.7663C0.567337 21.8392 0.573167 21.9127 0.585995 21.9856C0.609901 22.125 0.653049 22.2696 0.710774 22.419C0.811064 22.6797 0.955085 22.9567 1.12534 23.2373C1.38015 23.6578 1.69268 24.0865 2.00346 24.4662C2.31483 24.8459 2.62328 25.176 2.87633 25.4017C3.78594 26.2124 4.73286 26.7321 5.74334 27.0605C6.75381 27.3888 7.82551 27.5276 8.99634 27.5895C9.09838 27.5947 9.20217 27.597 9.30595 27.597C9.59866 27.597 9.89778 27.5819 10.187 27.5819C10.5269 27.5819 10.8523 27.6029 11.1339 27.6828C11.275 27.7224 11.4045 27.7767 11.5228 27.8484C11.6412 27.9208 11.7485 28.0112 11.8458 28.1284C12.1415 28.4848 12.3864 28.8971 12.6237 29.3194C12.8021 29.6361 12.9759 29.9586 13.1665 30.2672C13.31 30.4981 13.4627 30.7215 13.6353 30.928C13.8942 31.2371 14.1992 31.5083 14.5787 31.7002C14.9577 31.8927 15.4079 32.0023 15.9426 32.0017C16.0603 32.0017 16.1828 31.9965 16.3093 31.986C16.9338 31.9341 17.4318 31.7305 17.8282 31.4331C18.1262 31.2109 18.3676 30.9391 18.5763 30.6463C18.8895 30.2065 19.1332 29.7183 19.3862 29.2529C19.6387 28.7875 19.9005 28.3465 20.2346 27.996C20.3145 27.9126 20.4084 27.8449 20.5174 27.7895C20.6813 27.7067 20.8795 27.653 21.0993 27.6215C21.3191 27.59 21.5582 27.5801 21.8008 27.5807C22.1046 27.5807 22.4118 27.5953 22.6964 27.5953C22.7879 27.5953 22.8777 27.5935 22.964 27.5895C24.3488 27.5201 25.6071 27.3218 26.7593 26.8627C27.9114 26.4037 28.9528 25.6817 29.8933 24.5869C30.6152 23.7476 31.0811 22.9229 31.3779 22.0416C31.6752 21.1597 31.8053 20.2259 31.8729 19.1598C31.9627 17.7477 32 16.2488 32 14.7422C32 12.9901 31.9499 11.2281 31.8735 9.58454V9.58221Z" fill="#CC0000"/>
      <path d="M9.53393 12.7982C9.69486 12.8787 9.8797 12.9312 10.0844 12.951L10.0954 12.9522H21.8626L21.8719 12.9516C22.0754 12.9347 22.2602 12.8839 22.4206 12.8046C22.662 12.6862 22.848 12.5054 22.9704 12.2966C23.0934 12.0872 23.1541 11.851 23.1541 11.6148C23.1541 11.3051 23.048 10.9919 22.8305 10.7446C22.722 10.6215 22.5856 10.5154 22.4247 10.4366C22.2637 10.3579 22.0789 10.306 21.8736 10.2873L21.8626 10.2861L9.96949 10.3042L9.95375 10.3065C9.77008 10.3322 9.6039 10.3888 9.4593 10.4693C9.24239 10.59 9.0768 10.7656 8.96834 10.965C8.85931 11.1645 8.80566 11.3873 8.80566 11.6101C8.80566 11.9216 8.9112 12.2365 9.12811 12.4862C9.23656 12.611 9.37242 12.7183 9.53335 12.7982H9.53393Z" fill="#CC0000"/>
      <path d="M9.04471 17.5221C9.20681 17.7489 9.45403 17.9309 9.76948 18.0237L9.80213 18.0336L18.3577 18.0377H18.3641C18.4387 18.033 18.511 18.0184 18.5827 17.9974C18.6894 17.9659 18.7944 17.9198 18.8906 17.8644C18.9874 17.8084 19.0754 17.7449 19.1495 17.6667C19.2702 17.5396 19.3594 17.3955 19.4177 17.2444C19.476 17.0934 19.5034 16.9359 19.5034 16.7808C19.5034 16.4699 19.395 16.1672 19.2014 15.9245C19.0078 15.6825 18.7233 15.5011 18.381 15.448L18.3629 15.4451L9.8756 15.4434L9.84761 15.4504C9.51176 15.5338 9.24471 15.7198 9.06862 15.9566C8.89195 16.1934 8.80273 16.4775 8.80273 16.7609C8.80273 17.0269 8.88145 17.2952 9.04413 17.5215L9.04471 17.5221Z" fill="#CC0000"/>
    </g>
    <defs>
      <clipPath id="clip0_366_3268">
        <rect width="32" height="32" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

const StarIcon = () => (
  <svg
    width="20"
    height="19"
    viewBox="0 0 20 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ position: "relative", bottom: "8px", left: "3px" }}
  >
    <g clipPath="url(#clip0_925_5616)">
      <path
        d="M10.0194 0L7.66626 7.22526H0L6.18804 11.6952L3.86312 18.9557L10.0159 14.4858L16.1969 18.9557L13.8437 11.6952L19.9965 7.22526H12.3655L10.0194 0Z"
        fill="#E22130"
      />
    </g>
    <defs>
      <clipPath id="clip0_925_5616">
        <rect width="20" height="18.9557" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const ChevronDownIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    width="20px"
    height="20px"
    color="black"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m19.5 8.25-7.5 7.5-7.5-7.5"
    />
  </svg>
);

const PaperAirplaneIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20px"
    height="20px"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
  </svg>
);

const PersonIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    style={{ marginRight: "4px", flexShrink: 0 }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="16" cy="16" r="16" fill="#CC0000" />
    <path
      d="M13.7057 13.4625H7L12.4873 17.6347L10.4897 23.9845C10.611 24.1175 11.6328 23.3529 11.8331 23.2125C12.5332 22.7249 15.5562 20.2426 16.0781 20.2869C16.9032 20.3553 20.2606 23.6502 21.4165 23.9864C21.6371 23.9217 21.4717 23.5838 21.4294 23.4212C21.2089 22.5846 19.441 17.9302 19.5127 17.6347L25 13.4625H18.2943L15.9072 7L13.7002 13.4625H13.7057Z"
      fill="white"
    />
  </svg>
);

const LoaderIcon = () => (
  <svg
    width="30"
    height="30"
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="0" y="6" width="24" height="12" fill="white" rx="8" ry="4" />
    <circle cx="4" cy="12" r="2">
      <animate
        attributeName="cy"
        dur="1s"
        values="12;8;12;12"
        keyTimes="0;0.25;0.5;1"
        repeatCount="indefinite"
        begin="0.1s"
      />
      <animate
        attributeName="opacity"
        dur="1s"
        values="1;0.7;1;1"
        keyTimes="0;0.25;0.5;1"
        repeatCount="indefinite"
        begin="0.1s"
      />
    </circle>
    <circle cx="12" cy="12" r="2">
      <animate
        attributeName="cy"
        dur="1s"
        values="12;8;12;12"
        keyTimes="0;0.25;0.5;1"
        repeatCount="indefinite"
        begin="0.2s"
      />
      <animate
        attributeName="opacity"
        dur="1s"
        values="1;0.7;1;1"
        keyTimes="0;0.25;0.5;1"
        repeatCount="indefinite"
        begin="0.2s"
      />
    </circle>
    <circle cx="20" cy="12" r="2">
      <animate
        attributeName="cy"
        dur="1s"
        values="12;8;12;12"
        keyTimes="0;0.25;0.5;1"
        repeatCount="indefinite"
        begin="0.3s"
      />
      <animate
        attributeName="opacity"
        dur="1s"
        values="1;0.7;1;1"
        keyTimes="0;0.25;0.5;1"
        repeatCount="indefinite"
        begin="0.3s"
      />
    </circle>
  </svg>
);

// Types
type OrderAttachment = {
  order_id: string;
  status: string;
  product_name: string;
  product_brand: string;
  product_image: string;
  order_total: string;
};

type Message = {
  id: string;
  from: 'user' | 'assistant';
  text: string;
  timestamp: number;
  isLoading?: boolean;
  isStreaming?: boolean;
  agent_used?: string;
  attachment?: OrderAttachment;
};

type ChatBoxProps = {
  onClose: () => void;
};

const LOADER_MESSAGES = [
  "Please wait ! I will handle this for you",
];

const ChatBox: React.FC<ChatBoxProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-message',
      from: 'assistant',
      text: 'Welcome to Customer Center. I am Meg, Customer digital assistant. How can I help you today?',
      timestamp: Date.now(),
      isStreaming: false
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentLoaderText, setCurrentLoaderText] = useState(LOADER_MESSAGES[0]);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [showStreamingMessage, setShowStreamingMessage] = useState(false);
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const loaderIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatBoxRef.current) {
      setTimeout(() => {
        if (chatBoxRef.current) {
          chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
      }, 0);
    }
  }, [messages, isLoading, streamingMessageId]);

  // Loader text rotation
  useEffect(() => {
    if (isLoading) {
      setCurrentLoaderText(LOADER_MESSAGES[0]);
      let currentIndex = 0;
      loaderIntervalRef.current = setInterval(() => {
        currentIndex = (currentIndex + 1) % LOADER_MESSAGES.length;
        setCurrentLoaderText(LOADER_MESSAGES[currentIndex]);
      }, 2000);
    } else {
      if (loaderIntervalRef.current) {
        clearInterval(loaderIntervalRef.current);
        loaderIntervalRef.current = null;
      }
    }
    return () => {
      if (loaderIntervalRef.current) {
        clearInterval(loaderIntervalRef.current);
      }
    };
  }, [isLoading]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? "0" + minutes : minutes.toString();
    return hours + ":" + minutesStr + " " + ampm;
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    // Clear only the agent lights for new request (logs persist)
    agentObservabilityEmitter.clearLights();

    const userMessage: Message = {
      id: Date.now().toString(),
      from: 'user',
      text: trimmedInput,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(trimmedInput);
      // Emit agent logs for observability and log pane
      if (response.agent_logs && Array.isArray(response.agent_logs)) {
        response.agent_logs.forEach((log: any) => {
          const safeLog = {
            ...log,
            agentName: log.agentName || "Unknown",
            stage: log.stage || "",
            details: log.details || "",
            status: log.status || "started",
            component: log.component || "",
            message: log.message || "",
            reasoningType: log.reasoningType || "",
            confidence: log.confidence || "",
            responseType: log.responseType || "",
          };
          if (safeLog.type === 'agent-flow') {
            window.dispatchEvent(new CustomEvent('agent-flow', { detail: safeLog }));
          } else if (safeLog.type === 'agent-reasoning') {
            window.dispatchEvent(new CustomEvent('agent-reasoning', { detail: safeLog }));
          } else if (safeLog.type === 'agent-response') {
            window.dispatchEvent(new CustomEvent('agent-response', { detail: safeLog }));
          }
        });
      }
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          from: 'assistant',
          text: response.response,
          timestamp: Date.now(),
          isStreaming: false,
          agent_used: response.agent_used,
          attachment: response.attachment, // <-- Fix: propagate attachment to message
        }
      ]);
      // Emit invoked-agent event for graph lighting
      if (response.invokedAgent) {
        window.dispatchEvent(new CustomEvent('invoked-agent', {
          detail: {
            invokedAgent: response.invokedAgent,
            isNewRequest: false
          }
        }));
      }
      setIsLoading(false);
      setStreamingMessageId(null);
      setCurrentStatus(null);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          from: 'assistant',
          text: 'Sorry, something went wrong.',
          timestamp: Date.now(),
          isStreaming: false,
        }
      ]);
      setIsLoading(false);
      setStreamingMessageId(null);
      setCurrentStatus(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatMessageText = (text: string) => {
    if (!text) return '';
    
    // Trim leading and trailing whitespace to remove extra newlines
    const cleanText = text.trim();
    
    // Split by existing line breaks first (preserve backend formatting)
    const lines = cleanText.split('\n');
    
    return lines.map((line, lineIndex) => (
      <React.Fragment key={lineIndex}>
        {formatLineWithMarkdown(line.trim())}
        {lineIndex < lines.length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const formatLineWithMarkdown = (line: string) => {
    if (!line.trim()) return '';
    
    // Handle **bold** markdown
    const parts = line.split(/(\*\*[^*]+\*\*)/);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        // Remove ** and make bold
        const boldText = part.slice(2, -2);
        return <strong key={index}>{boldText}</strong>;
      }
      // Handle Order ID patterns - make them bold even without **
      if (part.includes('Order ID:') || part.match(/Order.*\d+/)) {
        return <strong key={index}>{part}</strong>;
      }
      return part;
    });
  };

  const renderMessage = (message: Message) => {
    if (message.from === 'user') {
      return (
        <div key={message.id} className="user-message-container">
          <div className="user-message">
            {formatMessageText(message.text)}
          </div>
          <div className="message-time">
            {formatTime(message.timestamp)}
          </div>
        </div>
      );
    } else {
      // Determine if this message is showing status or content
      const isShowingStatus = message.isStreaming && currentStatus && message.id === streamingMessageId;
      const hasContent = message.text && message.text.trim().length > 0 && !isShowingStatus;
      
      return (
        <div key={message.id} className="assistant-message-container">
          <div className="assistant-message-row">
            <PersonIcon />
            <div className={`assistant-message ${isShowingStatus ? 'status-message' : ''}`}>
              {isShowingStatus ? (
                // Show status with animated dots
                <>
                  <span className="status-text">{currentStatus}</span>
                  <div className="status-dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </>
              ) : hasContent ? (
                // Show formatted content
                <>
                  {formatMessageText(message.text)}
                  {message.isStreaming && (
                    <span className="streaming-cursor">|</span>
                  )}
                </>
              ) : (
                // Empty content, show loading state
                <>                              
                  <span className="status-text">Please wait ! I'll handle this for you</span>
                  <div className="status-dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Render order card attachment if present */}
          {message.attachment && (
            <div className="attachment-container">
              <OrderCard attachment={message.attachment} />
            </div>
          )}
          
          <div className="message-time assistant-time">
            {formatTime(message.timestamp)}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="chat-box-enhanced">
      {/* Header */}
      <div className="chat-header-enhanced">
        <div className="chat-header-content">
          <ChatIcon />
          <div className="chat-header-text">
            <div className="chat-title">Customer Assistant</div>
            <div className="chat-subtitle">
              You are now talking to your virtual AI assistant...
            </div>
          </div>
        </div>
        <button 
          className="chat-close-enhanced" 
          onClick={onClose} 
          aria-label="Close chat"
        >
          <ChevronDownIcon />
        </button>
      </div>

      {/* Messages Area */}
      <div className="chat-messages-enhanced" ref={chatBoxRef}>
        <div className="chat-welcome">
          *Customer Service AI assistant joined*
        </div>
        
        {messages.map(renderMessage)}
        
        {/* Loading Indicator - only show during initial loading */}
        {isLoading && (
          <div className="assistant-message-container">
            <div className="assistant-message-row">
              <PersonIcon />
              <div className="assistant-message loading-message">
                <span className="loader-text">{currentLoaderText}</span>
                <LoaderIcon />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="chat-input-area-enhanced">
        <div className="chat-input-row-enhanced">
          <input
            className="chat-input-enhanced"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type Your Message..."
            disabled={isLoading || streamingMessageId !== null}
          />
          <button 
            className="chat-send-enhanced" 
            onClick={handleSend}
            disabled={!input.trim() || isLoading || streamingMessageId !== null}
            aria-label="Send message"
          >
            <PaperAirplaneIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
