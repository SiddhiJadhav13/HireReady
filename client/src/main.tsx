import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";

console.log("🚀 React app initializing...");

const root = document.getElementById("root");
if (!root) {
  console.error("❌ FATAL: #root element not found in index.html");
  document.body.innerHTML = "<h1>Error: Root element not found</h1>";
} else {
  try {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </React.StrictMode>
    );
    console.log("✅ React app mounted successfully");
  } catch (error) {
    console.error("❌ Error mounting React app:", error);
    document.body.innerHTML = `<h1>Error: ${error instanceof Error ? error.message : "Unknown error"}</h1>`;
  }
}
