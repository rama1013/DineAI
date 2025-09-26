# agents/menu_agent.py
import json
from langchain_core.tools import tool
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_core.messages import BaseMessage, HumanMessage
from typing import TypedDict, Annotated, Sequence
import operator

from .base import RestaurantAgent

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]

class MenuAgent(RestaurantAgent):
    
    def _build_graph(self):
        
        @tool
        def get_full_menu() -> str:
            """
            Use this tool to get the full menu for the current restaurant.
            This returns the menu as a JSON string.
            """
            if not self.context or "menu" not in self.context:
                return "Sorry, the restaurant context is not available."
                
            print(f"--- Tool: Using context for restaurant '{self.restaurant_name}' ---")
            
            return json.dumps(self.context['menu'])

        workflow = StateGraph(AgentState)
        
        tools = [get_full_menu]
        tool_node = ToolNode(tools)
        llm_with_tools = self.llm.bind_tools(tools)

        def call_model(state: AgentState):
            system_message = HumanMessage(
                content=f"You are a menu assistant for {self.restaurant_name}. The user is a customer.",
                name="system"
            )
            messages = [system_message] + state['messages']
            response = llm_with_tools.invoke(messages)
            return {"messages": [response]}

        def should_continue(state: AgentState):
            if state['messages'][-1].tool_calls:
                return "continue"
            return "end"

        workflow.add_node("agent", call_model)
        workflow.add_node("action", tool_node)
        workflow.set_entry_point("agent")
        workflow.add_conditional_edges("agent", should_continue, {"continue": "action", "end": END})
        workflow.add_edge("action", "agent")
        
        return workflow.compile()