import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
// Import commands first to ensure registration before any component uses them
import "./commands";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
