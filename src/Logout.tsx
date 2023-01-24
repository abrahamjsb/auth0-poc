import { useAuth0 } from "@auth0/auth0-react";

function LogoutButton() {
  const { isAuthenticated, logout } = useAuth0();

  return isAuthenticated ? (
    <button
      onClick={() => {
        logout();
      }}
    >
      Log out
    </button>
  ) : null;
}

export default LogoutButton;
