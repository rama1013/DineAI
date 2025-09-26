# mcp-server/mcp_server.py
from fastmcp import FastMCP
from app.dummy_db import DUMMY_MENU_DB

app = FastMCP(name="DineAI_Context_Server")

@app.tool
def get_restaurant_context(restaurant_id: str) -> dict:
    """
    This tool provides the 'context' for a given restaurant, 
    including its name and full menu.
    """
    print(f"--- Server: Received request for restaurant '{restaurant_id}' ---")
    restaurant_data = DUMMY_MENU_DB.get(restaurant_id)

    if not restaurant_data:
        # Return a dictionary with an error or empty values
        return {"error": "Restaurant not found"}

    # The fastmcp tool should return the data payload directly
    return {
        "restaurant_id": restaurant_id,
        "restaurant_name": restaurant_data.get("restaurant_name"),
        "menu": restaurant_data
    }

if __name__ == "__main__":
    # Note: The default port for fastmcp's http transport is 8000
    app.run(transport="http", host="0.0.0.0", port=8000)
