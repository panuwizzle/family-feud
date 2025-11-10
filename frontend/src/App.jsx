import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Host from './pages/Host';
import Display from './pages/Display';

function App() {
  return (
    <Router>
      <div className="h-screen bg-gray-900 text-white">
        <nav className="p-4 bg-gray-800 text-center">
          <Link to="/host" className="mr-4 p-2 bg-blue-500 rounded">Host View</Link>
          <Link to="/display" className="p-2 bg-green-500 rounded">Display View</Link>
        </nav>
        <Routes>
          <Route path="/host" element={<Host />} />
          <Route path="/display" element={<Display />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

function Home() {
    return (
        <div className="flex flex-col items-center justify-center h-full -mt-16">
            <h1 className="text-4xl mb-4">Welcome to Family Feud</h1>
            <p>Select a view from the navigation above.</p>
        </div>
    )
}

export default App;
