import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";

// import App from './App'
import "./index.css";

const App = React.lazy(() => import("./App"));

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Auth0Provider
      domain="abrahamjsb.us.auth0.com"
      clientId="VCJtHyREXvIchWmSKROuGbmFOZYrhzI9"
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);
