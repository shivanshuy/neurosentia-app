const aiAgentContent = {
    header: "ReAct Agent with LangGraph",
     text: `Code Example of a ReAct Agent using LangGraph and Ollama's Mistral model. This agent can perform arithmetic operations and return a decorated response.`,
    contents: [
        {
            type: "code",
            code: `
from langchain_core.tools import tool
from langchain_ollama import ChatOllama
from langgraph.prebuilt import create_react_agent


@tool
def add(x: int, y: int) -> int:
    """Adds 2 numbers and returns the result"""
    return x + y


@tool
def multiply(x: int, y: int) -> int:
    """Multiplies 2 numbers and returns the result"""
    return x * y


@tool
def response_decorator(x: str) -> int:
    """Show the decorated response"""
    return f"********************** Hello User!!!. {x} **********************"


tools = [add, multiply, response_decorator]

model = ChatOllama(
    model="mistral:latest",
    temperature=0,
)

prompt = "You are a helpful assistant, always use the tools provided to answer the user's question."
messages = {
    "messages": [
        {
            "role": "user",
            "content": "Add 2 and 3, then multiply the result by 4. Then show decorated response",
        }
    ]
}

agent = create_react_agent(
    model=model,
    tools=tools,
    prompt=prompt,
)

# Run the agent
answer = agent.invoke(messages)
print(answer)

`
        }
    ]
}
export default aiAgentContent;