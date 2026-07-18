import './App.css'
import { Routes, Route } from 'react-router';
import Home from './Home';
import AIBlog from './AIBlogItems';
import Blog from './Blog';
import ChatBot from './ChatBot';
import AIAgents from './AIAgents';
import ReactAgentWithLangGraph from './pages/ReactAgentWithLangGraph';
import FineTunePage from './pages/FineTunePage';
import FineTuningTechniques from './pages/FineTuningTechniques';
import LoraFineTuning from './pages/LoraFineTuning';
import LlmModelFiles from './pages/LlmModelFiles';
import GpuLlmInference from './pages/GpuLlmInference';
import LlmQuantization from './pages/LlmQuantization';
import LlmDatasets from './pages/LlmDatasets';
import LlamaCpp from './pages/LlamaCpp';


function App() {
  // const [count, setCount] = useState(0)

  return (

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chatterbug" element={<ChatBot />} />
        <Route path="/ai-blog-items" element={<AIBlog />} />
        <Route path="/ai-agents" element={<AIAgents />} />
        <Route path="/react-agent-langgraph" element={<ReactAgentWithLangGraph />} />
        <Route path="/fine-tuning-techniques" element={<FineTuningTechniques />} />
        <Route path="/lora-fine-tuning" element={<LoraFineTuning />} />
        <Route path="/llm-model-files" element={<LlmModelFiles />} />
        <Route path="/gpu-llm-inference" element={<GpuLlmInference />} />
        <Route path="/llm-quantization" element={<LlmQuantization />} />
        <Route path="/llm-datasets" element={<LlmDatasets />} />
        <Route path="/llama-cpp" element={<LlamaCpp />} />
        <Route path="/fine-tune" element={<FineTunePage />} />
        <Route path="/coding-blog" element={<FineTunePage />} />
        <Route path="/blog" element={<Blog />} />
      </Routes>

  )
}

export default App
