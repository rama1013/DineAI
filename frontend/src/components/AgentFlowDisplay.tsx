import React, { useRef, useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const ACTIVE_NODE_COLOR = "#CC0000";
const INACTIVE_NODE_COLOR = "#BDBDBD";
const LINE_COLOR = "#B0BEC5";
const PROCESSING_NODE_COLOR = "#FF4444"; // Brighter red for processing
const GLOW_COLOR = "#CC0000";

const AGENT_CONFIGS_BASE = [
  // Phase 1: Orchestrator Agent
  {
    name: "Orchestrator Agent",
    displayName: "Orchestrator Agent",
    type: "orchestrator",
    layoutPosition: { x: "15%", y: "50%" },
  },
  // Phase 2: Specialist Agents (stacked vertically)
  {
    name: "Return Agent",
    displayName: "Return Agent",
    type: "spoke",
    layoutPosition: { x: "50%", y: "20%" },
  },
  {
    name: "Refund Agent",
    displayName: "Refund Agent",
    type: "spoke",
    layoutPosition: { x: "50%", y: "35%" },
  },
  {
    name: "Order Modification Agent",
    displayName: "Order Mod. Agent",
    type: "spoke",
    layoutPosition: { x: "50%", y: "50%" },
  },
  {
    name: "General Agent",
    displayName: "General Agent",
    type: "spoke",
    layoutPosition: { x: "50%", y: "65%" },
  },
  {
    name: "Greeting Agent",
    displayName: "Greeting Agent",
    type: "spoke",
    layoutPosition: { x: "50%", y: "80%" },
  },
  // Phase 3: Conversational Agent
  {
    name: "Conversational Agent",
    displayName: "Conv. Agent",
    type: "conversational",
    layoutPosition: { x: "85%", y: "50%" },
  },
];

interface AgentNodeProps {
  agentConfig: {
    displayName: string;
    type: string;
    layoutPosition: { x: string; y: string };
  };
  isActive: boolean;
  isProcessing?: boolean;
}

const AgentNode = React.forwardRef<HTMLDivElement, AgentNodeProps>(({ agentConfig, isActive, isProcessing = false }, ref) => {
  const { displayName, type, layoutPosition } = agentConfig;
  const currentBgColor = isActive ? ACTIVE_NODE_COLOR : INACTIVE_NODE_COLOR;
  const isAnimated = isProcessing || isActive;

  let nodeShapeStyle: React.CSSProperties = {};
  let nodeWrapperSize = "70px";
  let visualNodeSize = type === "orchestrator" ? "38px" : "35px";

  nodeShapeStyle = {
    width: visualNodeSize,
    height: visualNodeSize,
    borderRadius: "50%",
    backgroundColor: isProcessing ? PROCESSING_NODE_COLOR : currentBgColor,
    border: `1px solid ${isActive ? ACTIVE_NODE_COLOR : INACTIVE_NODE_COLOR}`,
    margin: "auto",
  };

  return (
    <Box
      ref={ref}
      sx={{
        width: nodeWrapperSize,
        height: parseInt(visualNodeSize) + 20,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        textAlign: "center",
        position: "absolute",
        left: layoutPosition.x,
        top: layoutPosition.y,
        transform: "translate(-50%, -50%)",
        cursor: "default",
        transition: "transform 0.2s ease",
        "&:hover": { transform: "translate(-50%, -50%) scale(1.05)" },
      }}
    >
      <Box
        sx={{
          ...nodeShapeStyle,
          minHeight: visualNodeSize,
          boxShadow: isProcessing 
            ? `0 0 15px ${GLOW_COLOR}, 0 0 25px ${GLOW_COLOR}40` 
            : isActive 
              ? `0 0 8px ${ACTIVE_NODE_COLOR}` 
              : "none",
          transition: "background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      />
      <Typography
        variant="caption"
        sx={{
          color: "#3F3F3F",
          fontSize: "10px",
          fontWeight: type === "orchestrator" ? "bold" : "500",
          marginTop: "2px",
          whiteSpace: "nowrap",
        }}
        title={displayName}
      >
        {displayName}
      </Typography>
    </Box>
  );
});

AgentNode.displayName = "AgentNode";

interface AgentFlowDisplayProps {
  highlightedNodes: string[];
  flowSteps: any[];
}

export const AgentFlowDisplay: React.FC<AgentFlowDisplayProps> = ({
  highlightedNodes,
  flowSteps,
}) => {
  const displayAreaRef = useRef<HTMLDivElement>(null);
  const [nodePixelPositions, setNodePixelPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [drawnArrows, setDrawnArrows] = useState<any[]>([]);

  const allNodeConfigs = useMemo(() => AGENT_CONFIGS_BASE, []);

  useEffect(() => {
    if (!displayAreaRef.current || allNodeConfigs.length === 0) return;
    const { width, height } = displayAreaRef.current.getBoundingClientRect();
    if (width === 0 || height === 0) return;
    const positions: Record<string, { x: number; y: number }> = {};
    allNodeConfigs.forEach((config) => {
      const x = Math.round(parseFloat(config.layoutPosition.x) * width / 100);
      const y = Math.round(parseFloat(config.layoutPosition.y) * height / 100);
      positions[config.name] = { x, y };
    });
    setNodePixelPositions(positions);
  }, [allNodeConfigs, displayAreaRef.current?.offsetWidth, displayAreaRef.current?.offsetHeight]);

  useEffect(() => {
    if (Object.keys(nodePixelPositions).length === 0 || !displayAreaRef.current) return;
    const newArrows: any[] = [];
    // Flow step arrows
    flowSteps.forEach((step, index) => {
      if (step.from && step.to && nodePixelPositions[step.from] && nodePixelPositions[step.to]) {
        const fromPos = nodePixelPositions[step.from];
        const toPos = nodePixelPositions[step.to];
        newArrows.push({
          id: `flow_${index}`,
          x1: fromPos.x,
          y1: fromPos.y,
          x2: toPos.x,
          y2: toPos.y,
          isActive: true,
          isFlowArrow: true
        });
      }
    });
    // Static connections for 3-phase architecture
    const orchestratorConfig = AGENT_CONFIGS_BASE.find(c => c.type === "orchestrator");
    const conversationalConfig = AGENT_CONFIGS_BASE.find(c => c.name === "Conversational Agent");
    const specialistAgents = AGENT_CONFIGS_BASE.filter(c => c.type === "spoke" && c.name !== "Conversational Agent");
    const orchestratorPos = orchestratorConfig && nodePixelPositions[orchestratorConfig.name];
    const conversationalPos = conversationalConfig && nodePixelPositions[conversationalConfig.name];
    // Phase 1 to Phase 2: Orchestrator to all specialist agents (except conversational)
    if (orchestratorConfig && orchestratorPos && specialistAgents.length > 0) {
      specialistAgents.forEach((specialistAgent) => {
        const specialistPos = nodePixelPositions[specialistAgent.name];
        if (specialistPos) {
          // Light up orchestrator → specialist when specialist is highlighted
          const isSpecialistActive = highlightedNodes.includes(specialistAgent.name);
          newArrows.push({
            id: `orchestrator_to_${specialistAgent.name}`,
            x1: orchestratorPos.x,
            y1: orchestratorPos.y,
            x2: specialistPos.x,
            y2: specialistPos.y,
            isActive: isSpecialistActive,
            isFlowArrow: false
          });
        }
      });
    }
    // Phase 2 to Phase 3: All specialist agents to conversational
    if (conversationalConfig && conversationalPos) {
      specialistAgents.forEach((specialistAgent) => {
        const specialistPos = nodePixelPositions[specialistAgent.name];
        if (specialistPos) {
          // Light up specialist → conversational when both are highlighted
          const isSpecialistActive = highlightedNodes.includes(specialistAgent.name);
          const isConversationalActive = highlightedNodes.includes(conversationalConfig.name);
          newArrows.push({
            id: `${specialistAgent.name}_to_conversational`,
            x1: specialistPos.x,
            y1: specialistPos.y,
            x2: conversationalPos.x,
            y2: conversationalPos.y,
            isActive: isConversationalActive && isSpecialistActive,
            isFlowArrow: false
          });
        }
      });
    }
    setDrawnArrows(newArrows);
  }, [flowSteps, nodePixelPositions, allNodeConfigs, highlightedNodes]);

  return (
    <Box
      ref={displayAreaRef}
      sx={{
        width: "100%",
        height: "100%",
        minHeight: "650px",
        position: "relative",
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <defs>
          <marker
            id="arrowhead_flow_display_v3_active"
            markerWidth="6"
            markerHeight="4"
            refX="5.5"
            refY="2"
            orient="auto"
          >
            <polygon points="0 0, 6 2, 0 4" fill={ACTIVE_NODE_COLOR} />
          </marker>
          <marker
            id="arrowhead_flow_display_v3_inactive"
            markerWidth="6"
            markerHeight="4"
            refX="5.5"
            refY="2"
            orient="auto"
          >
            <polygon points="0 0, 6 2, 0 4" fill={LINE_COLOR} />
          </marker>
        </defs>
        {drawnArrows.map((arrow) => {
          const strokeColor = arrow.isActive ? ACTIVE_NODE_COLOR : LINE_COLOR;
          const strokeWidth = arrow.isActive ? "2" : "1.5";
          const opacity = arrow.isActive ? 1 : arrow.isFlowArrow ? 0.35 : 0.5;
          const marker = arrow.isFlowArrow
            ? arrow.isActive
              ? "url(#arrowhead_flow_display_v3_active)"
              : "url(#arrowhead_flow_display_v3_inactive)"
            : "none";
          return (
            <line
              key={arrow.id}
              x1={arrow.x1}
              y1={arrow.y1}
              x2={arrow.x2}
              y2={arrow.y2}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
              markerEnd={marker}
              style={{
                transition: "stroke 0.3s ease, stroke-width 0.3s ease, opacity 0.5s ease",
                opacity,
              }}
            />
          );
        })}
      </svg>
      {allNodeConfigs.map((agentConfig) => {
        const isActive = highlightedNodes.includes(agentConfig.name);
        const currentPosition = nodePixelPositions[agentConfig.name];
        return currentPosition ? (
          <AgentNode
            key={agentConfig.name}
            agentConfig={{ 
              ...agentConfig, 
              layoutPosition: { 
                x: `${currentPosition.x}px`, 
                y: `${currentPosition.y}px` 
              } 
            }}
            isActive={isActive}
          />
        ) : null;
      })}
    </Box>
  );
};
