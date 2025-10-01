import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Ensure saved primary color (if any) is applied as early as possible
import "@/lib/theme";

createRoot(document.getElementById("root")!).render(<App />);
