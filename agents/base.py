# agents/base.py
from langchain_google_genai import ChatGoogleGenerativeAI

class RestaurantAgent:
    def __init__(self, context: dict):
        self.context = context
        self.llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro-latest")
        self.graph = self._build_graph()

    def _build_graph(self):
        raise NotImplementedError("Subclasses must implement _build_graph")

    def get_runnable(self):
        return self.graph

    @property
    def restaurant_name(self):
        return self.context.get("restaurant_name", "the restaurant")
