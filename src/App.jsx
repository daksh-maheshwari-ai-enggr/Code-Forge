import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import BrowsePage from "./pages/BrowsePage";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#FBF9F5]">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
        </Routes>
      </div>
    </Router>
  );
}