import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChatPage from './pages/ChatPage';
import RequirementPreviewPage from './pages/RequirementPreviewPage';
import { PreviewPage } from './pages/PreviewPage';
import Layout from './components/layout/Layout';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/requirements" element={<RequirementPreviewPage />} />
          <Route path="/preview/:session_id/:template_id" element={<PreviewPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
