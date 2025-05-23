import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("token");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/"); // Redirect to home/dashboard
    } else {
      navigate("/login?error=Authentication failed");
    }
  }, [location, navigate]);

  return <div className="text-center mt-20 text-lg">Authenticating...</div>;
};

export default AuthCallback;
