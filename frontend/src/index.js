import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { HrmsProvider } from "./context/HrmsContext";
import { AuthProvider } from "./context/AuthContext";

const root = ReactDOM.createRoot(
  document.getElementById("root")
);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <HrmsProvider>
        <App />
      </HrmsProvider>
    </AuthProvider>
  </React.StrictMode>
);