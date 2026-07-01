import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initAuthListener } from "./store/useAuthStore";

initAuthListener();

createRoot(document.getElementById("root")!).render(<App />);
