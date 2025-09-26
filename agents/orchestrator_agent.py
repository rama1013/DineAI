# agents/orchestrator_agent.py
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from typing import Literal

from .base import RestaurantAgent
from .menu_agent import MenuAgent
from .greeting_agent import GreetingAgent

class RouteQuery(BaseModel):
    """Route a user query to the most relevant agent."""
    
    destination: Literal["menu", "greeting", "general"] = Field(
        ...,
        description="Given a user query, route them to the most relevant agent.",
    )

class OrchestratorAgent(RestaurantAgent):
    def _build_graph(self):
        # No graph needed for the orchestrator, it just routes
        return None

    def get_runnable(self):
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", "You are an expert at routing a user query to the appropriate agent."),
                ("human", "{query}"),
            ]
        )
        
        structured_llm = self.llm.with_structured_output(RouteQuery)
        
        return prompt | structured_llm

    def get_agent_for_destination(self, destination: str):
        if destination == "menu":
            return MenuAgent(self.context)
        elif destination == "greeting":
            return GreetingAgent(self.context)
        # Add other agents here as they are created
        else:
            # For now, we'll just return a simple agent for general queries
            return GreetingAgent(self.context)