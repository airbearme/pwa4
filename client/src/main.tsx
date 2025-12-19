import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("main.tsx loaded!");
// @ts-ignore
console.log(`🚀 AirBear Build: ${import.meta.env.__APP_VERSION__ || 'Production'}`);
console.log(`🛡️ Stripe Key: ${import.meta.env.VITE_STRIPE_PUBLIC_KEY ? 'Set' : 'MISSING'}`);

const container = document.getElementById("root");
console.log("Root container:", container);
if (!container) {
  console.error("Root element not found!");
  throw new Error("Root element not found");
}

const root = createRoot(container);
root.render(<App />);