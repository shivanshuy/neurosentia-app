const aiAgentContent = {
    header: "WHAT IS AN AI AGENT?",
    text: `AI Agents be described as a system that can use a LLM to reason through a problem, create a plan to solve the problem, and execute the plan with the help of a provided set of tools.`,
    contents: [
        {
            type: "header",
            text: "Chatbots, Workflows and Agents"
        },
        {
            type: "text",
            text: `"Chatbots" are great at answering simple questions and performing basic tasks.
            "Workflows" are systems where LLMs and tools are orchestrated through predefined code paths. Workflows automate tasks but lack reasoning and predefined paths cannot be altered.
            "Agents", on the other hand, are systems where LLMs dynamically direct their own processes and tool usage, maintaining control over how they accomplish tasks. They combine reasoning, action, and memory to pursue goals independently.`
        },
        {
            type: "header",
            text: "Agent Architectures"
        },
        {
            type: "text",
            text: `An agent uses an LLM not just to process information, but to decide what to do next. It reasons about a problem, chooses tools, observes results, and iterates until a goal is achieved. However, this reasoning process isn't arbitrary; it follows specific patterns or frameworks known as agent architectures. These architectures structure the agent's "thought process," influencing how it breaks down problems, interacts with tools, and synthesizes information. influential agent architectures commonly implemented and discussed - ReAct and Plan-and-Execute.`
        },
        {
            type: "subHeader",
            text: "ReAct (Reason and Act)"
        },
        {
            type: "text",
            text: "reasoning help the model induce, track, and update action plans as well as handle exceptions, while actions allow it to interface with external sources, such as knowledge bases or environments, to gather additional information."
        },
        {
            type: "code",
            code: `
+----------------------+
|      Use Query       |
|                      |
+----------+-----------+
           |
           v
+----------------------+
|       Thought        |
|   (Analyze Query)    |
|   (Decide Next Step) |
+----------+-----------+
           |
           v
+----------------------+
|        Action        |
|     (Select Tool,    |
|     Specify Input)   |
+----------+-----------+
           |
           | Execute Tool
           v
+----------------------+
|     Observation:     |
|(Receive Tool Output) |
+----------------------+
           |
           | Incorporate Result
           v
+----------------------+
|     Thought          |
|   (Analyze Query     |
|  Decide Next Step)   |
+----------------------+
           |
           v
   [Repeat Cycle]
`
        },
        {
            type: "reference",
            href: "https://arxiv.org/pdf/2210.03629",
            text: "SYNERGIZING REASONING AND ACTING IN LANGUAGE MODELS"
        },
         {
            type: "subHeader",
            text: "Plan-and-Execute (Decoupled Planning and Execution)"
        },
        {
            type: "text",
            text: 'The Plan-and-Execute architecture separates the task into two distinct phases: planning and execution. This setup works well for complex tasks that require a well-thought-out sequence of actions. Planning: A "Planner" (usually an LLM) looks at the users goal and creates a detailed, step-by-step plan. Each step outlines a specific action to take. Execution: An "Executor" follows the plan, carrying out each step in order. This might involve simple LLM calls focused on one step at a time, or direct use of tools mentioned in the plan. The outcome of each step is usually passed along to the next one.'
        },
        {
            type: "code",
            code: `
+----------------------+
|      Use Query       |
|                      |
+----------+-----------+
           |
           v
+----------------------+
|     Planner (LLM)    |
| (Step by Step Plan)  |
+----------+-----------+
           |
           | Output Plan
           v
+----------------------+
|        Plan          |
| 1. Action A (Tool X) |
| 2. Action B          |
+----------+-----------+
           |
           v
+----------------------+
|     Executor         |
|                      |
+----------------------+
           |
           v
+----------------------+
|     Execute Step 1   |
|  Action A (Tool X)   |
+----------------------+
           |
           | Result of Step 1
           v
+----------------------+
|     Execute Step 2   |
|         Action B     |
+----------------------+
           |
           | Result of Step 2
           v
   [Final Result]
`
        },
        {
            type: "reference",
            href: "https://apxml.com/courses/langchain-production-llm/chapter-2-sophisticated-agents-tools/agent-architectures",
            text: "agent-architectures"
        },
        {
            type: "link",
            href: "#/ai-agent-langchain",
            text: "ai agent using langchain langgraph"
        }
    ]
}
export default aiAgentContent;