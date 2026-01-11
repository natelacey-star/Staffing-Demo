import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Hero from './components/Hero';
import WorkflowDemo from './components/WorkflowDemo';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/workflow" element={<WorkflowDemo />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
