import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";


import { AuthProvider } from "./context/AuthContext.jsx";
import { LightboxProvider } from "./context/LightBoxContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LightboxProvider>
        <App />
        </LightboxProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);