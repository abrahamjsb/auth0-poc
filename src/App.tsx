import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "./Login";
import LogoutButton from "./Logout";
import "./App.css";

const App: React.FC = () => {
  const { isLoading, error } = useAuth0();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Oops... {error.message}</div>;
  }
  return (
    <div className="app">
      <LoginButton />
      <LogoutButton />
    </div>
  );
};
export default App;
