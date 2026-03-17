import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Wake-up du backend Render dès le chargement (évite le cold start de 30-60s)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
fetch(`${API_URL}/health`, { method: 'GET' }).catch(() => {});

createRoot(document.getElementById("root")!).render(<App />);
