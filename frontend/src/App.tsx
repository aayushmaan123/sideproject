import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChatPage from './pages/ChatPage';
import RequirementPreviewPage from './pages/RequirementPreviewPage';
import Layout from './components/layout/Layout';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/requirements" element={<RequirementPreviewPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
