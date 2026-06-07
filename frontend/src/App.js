import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/lib/i18n";
import Home from "@/pages/Home";
import About from "@/pages/About";
import ContactPage from "@/pages/ContactPage";
import ProjectsPage from "@/pages/ProjectsPage";
import CoordinatorJoinPage from "@/pages/CoordinatorJoinPage";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";
import MusicPlayer from "@/components/ddls/MusicPlayer";

function MusicGate() {
  const location = useLocation();
  if (location.pathname.startsWith("/admin")) return null;
  return <MusicPlayer />;
}

function App() {
  return (
    <LanguageProvider>
      <div className="App">
        <Toaster position="top-center" richColors />
        <BrowserRouter>
          <MusicGate />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/join" element={<CoordinatorJoinPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </BrowserRouter>
      </div>
    </LanguageProvider>
  );
}

export default App;
