# agents/greeting_agent.py
from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage, HumanMessage
from typing import TypedDict, Annotated, Sequence
import operator

from .base import RestaurantAgent

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]

class GreetingAgent(RestaurantAgent):
    def _build_graph(self):
        workflow = StateGraph(AgentState)

        def call_model(state: AgentState):
            system_message = HumanMessage(
                content=f"You are a greeting assistant for {self.restaurant_name}. Your job is to provide a warm welcome to the user.",
                name="system"
            )
            messages = [system_message] + state['messages']
            response = self.llm.invoke(messages)
            return {"messages": [response]}

        workflow.add_node("agent", call_model)
        workflow.set_entry_point("agent")
        workflow.add_edge("agent", END)
        
        return workflow.compile()