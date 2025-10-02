import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { worker } from "./api/browser";

// Global error handler for debugging
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

// Start MSW worker with better error handling
async function startApp() {
  try {
    await worker.start({
      onUnhandledRequest: "bypass",
      quiet: false // Enable logging for debugging
    });
    console.log("✅ MSW worker started successfully");
  } catch (error) {
    console.error("❌ Failed to start MSW worker:", error);
    // Continue anyway - the app might still work without MSW in some cases
  }

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

startApp();
