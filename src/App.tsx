import './App.css'
import { Routes, Route } from 'react-router';
import Home from './Home';
import AIBlog from './AIBlogItems';
import Blog from './Blog';
import ChatBot from './ChatBot';
import AIAgents from './AIAgents';
import ReactAgentWithLangGraph from './pages/ReactAgentWithLangGraph';


function App() {
  // const [count, setCount] = useState(0)

  return (

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chatterbug" element={<ChatBot />} />
        <Route path="/ai-blog-items" element={<AIBlog />} />
        <Route path="/ai-agents" element={<AIAgents />} />
        <Route path="/react-agent-langgraph" element={<ReactAgentWithLangGraph />} />
        <Route path="/blog" element={<Blog />} />
      </Routes>

  )
}

export default App
