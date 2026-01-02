import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import WorkspacePage from './pages/WorkspacePage'
import ProcessingPage from './pages/ProcessingPage'
import AnalysisPage from './pages/AnalysisPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/workspace" element={<WorkspacePage />} />
      <Route path="/processing/:jobId" element={<ProcessingPage />} />
      <Route path="/analysis/:videoId" element={<AnalysisPage />} />
    </Routes>
  )
}

export default App
