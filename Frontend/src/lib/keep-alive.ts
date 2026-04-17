// Ping le backend toutes les 10 minutes pour éviter le cold start Render
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function startKeepAlive() {
  const ping = () => {
    fetch(`${BACKEND_URL}/health`, { method: 'GET' }).catch(() => {});
  };

  // Ping immédiat au démarrage
  ping();

  // Puis toutes les 10 minutes
  setInterval(ping, 10 * 60 * 1000);
}
