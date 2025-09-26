# app/main.py
import os
import asyncio
from typing import TypedDict, Annotated, Sequence
import operator
from dotenv import load_dotenv

from langchain_core.messages import BaseMessage, HumanMessage
from fastmcp import Client as MCPClient

from agents.orchestrator_agent import OrchestratorAgent

load_dotenv()

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]

async def main():
    """Main entry point for the application."""
    restaurant_id = "bobs-bistro-11234"
    mcp_server_url = os.getenv("MCP_URL", "http://127.0.0.1:8000/mcp")
    mcp_client = MCPClient(mcp_server_url)

    try:
        print(f"--- Client: Fetching context from {mcp_server_url} ---")
        async with mcp_client:
            context = await mcp_client.call_tool(
                "get_restaurant_context", {"restaurant_id": restaurant_id}
            )
        
        print("--- Client: Raw context from MCP: ---")
        print(context)

        if hasattr(context, "error"):
            print(f"--- Client: Error fetching context: {context.error} ---")
            return
        
        context_data = context.structured_content

        if not context_data or not isinstance(context_data, dict):
            print(f"--- Client: Error fetching context: Invalid context received ---")
            return
        print("--- Client: Context received successfully! ---")
    except Exception as e:
        print(f"--- Client: Failed to fetch context from MCP server: {e} ---")
        print("--- Client: Please ensure the mcp_server.py is running. ---")
        return

    orchestrator = OrchestratorAgent(context_data)
    orchestrator_runnable = orchestrator.get_runnable()

    # Initial greeting
    greeting_agent = orchestrator.get_agent_for_destination("greeting")
    greeting_runnable = greeting_agent.get_runnable()
    initial_message = {"messages": [HumanMessage(content="")]}
    
    final_output = None
    async for output in greeting_runnable.astream(initial_message):
        final_output = output
    
    ai_response = final_output['agent']['messages'][-1].content
    print(f"Agent: {ai_response}")
    
    while True:
        user_input = await asyncio.to_thread(input, "You: ")
        if user_input.lower() in ["exit", "quit"]:
            print("Agent: Goodbye!")
            break
        
        # Route the query
        route = orchestrator_runnable.invoke({"query": user_input})
        print(f"--- Orchestrator: Routing to '{route.destination}' agent ---")
        
        # Get the appropriate agent
        agent = orchestrator.get_agent_for_destination(route.destination)
        agent_runnable = agent.get_runnable()
        
        inputs = {"messages": [HumanMessage(content=user_input)]}
        
        final_output = None
        async for output in agent_runnable.astream(inputs):
            final_output = output
        
        ai_response = final_output['agent']['messages'][-1].content
        print(f"Agent: {ai_response}")

if __name__ == "__main__":
    asyncio.run(main())