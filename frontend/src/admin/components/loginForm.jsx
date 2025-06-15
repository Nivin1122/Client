import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  // Configure axios defaults
  axios.defaults.withCredentials = true;

  // Function to check if admin is already authenticated
  // const checkAuthStatus = async () => {
  //   try {
  //     const response = await axios.get(
  //       // "https://client-1-6rax.onrender.com/api/admin/verify-session",
  //       "http://localhost:9090/api/admin/verify-session",
  //       {
  //         withCredentials: true,
  //         headers: {
  //           'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
  //         }
  //       }
  //     );

  //     if (response.data.success) {
  //       // Admin is authenticated, redirect to dashboard
  //       navigate("/admin/dashboard", { replace: true });
  //       return true;
  //     }
  //   } catch (error) {
  //     // Not authenticated or error occurred
  //     console.log("Not authenticated:", error.response?.data?.message);
  //     // Clear any stale data
  //     localStorage.removeItem('adminToken');
  //     localStorage.removeItem('admin-logged');
  //   }
  //   return false;
  // };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        // "https://client-1-6rax.onrender.com/api/admin/adminlogin",
        "http://localhost:9090/api/admin/adminlogin",
        { 
          email: email.trim(), 
          password: password.trim() 
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("Login response:", response.data);

      // Check for successful response
      if (response.status === 200 && response.data) {
        // Store token in localStorage as backup
        if (response.data.token) {
          localStorage.setItem("adminToken", response.data.token);
          console.log("Token stored:", response.data.token);
        }
        
        // Store admin logged status
        localStorage.setItem("admin-logged", "true");
        
        // Store admin info
        if (response.data.admin) {
          localStorage.setItem("adminInfo", JSON.stringify(response.data.admin));
        }

        console.log("Login successful, navigating to dashboard...");
        setSuccess("Login successful! Redirecting to dashboard...");
        
        // Small delay to show success message and ensure localStorage is set
        setTimeout(() => {
          navigate("/admin/dashboard", { replace: true });
        }, 1000);
        
      } else {
        setError(response.data?.message || "Login failed!");
      }
    } catch (err) {
      console.error("Login error:", err);
      console.error("Error response:", err.response);
      
      // Handle different error scenarios
      if (err.response?.status === 401) {
        setError("Invalid email or password.");
      } else if (err.response?.status === 403) {
        setError("Your account has been deactivated.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.code === 'NETWORK_ERROR') {
        setError("Network error. Please check your connection.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Check authentication status on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      setCheckingAuth(true);
      
      // Check if we're already on the login page
      if (window.location.pathname === '/admin') {
        setCheckingAuth(false);
        return;
      }

      try {
        // Verify token with backend
        const response = await axios.get(
          'http://localhost:9090/api/admin/check-auth',
          { withCredentials: true }
        );
        
        if (!response.data.success) {
          // Token is invalid, clear localStorage
          localStorage.removeItem('adminToken');
          localStorage.removeItem('admin-logged');
          localStorage.removeItem('adminInfo');
          navigate('/admin');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // Only clear localStorage if we get an auth error
        if (error.response?.status === 401) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('admin-logged');
          localStorage.removeItem('adminInfo');
          navigate('/admin');
        }
      } finally {
        setCheckingAuth(false);
      }
    };

    initializeAuth();
  }, [navigate]);

  // Show loading spinner while checking authentication
  if (checkingAuth) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "85vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)",
        }}
      >
        <CircularProgress size={50} sx={{ color: "#000000" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "85vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%)",
        padding: "20px",
      }}
    >
      <Card
        sx={{
          width: { xs: "90%", sm: "70%", md: "40%", lg: "30%" },
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          background: "white",
          position: "relative",
          overflow: "visible",
          "&:before": {
            content: '""',
            position: "absolute",
            top: "-10px",
            left: "-10px",
            right: "-10px",
            bottom: "-10px",
            background: "linear-gradient(135deg, #000000 0%, #434343 100%)",
            zIndex: -1,
            borderRadius: "20px",
            opacity: 0.1,
          },
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4, textAlign: "center" }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#1a1a1a",
                mb: 1,
                fontFamily: "'Playfair Display', serif",
              }}
            >
              Emirah
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: "#333",
                fontWeight: 500,
              }}
            >
              Admin Portal
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#666",
                fontWeight: 400,
              }}
            >
              Access your administrative dashboard
            </Typography>
          </Box>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email Address"
              type="email"
              variant="outlined"
              fullWidth
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(""); // Clear error when user types
                if (success) setSuccess(""); // Clear success when user types
              }}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "#000000",
                  },
                },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: "#000000",
                  },
              }}
              required
              disabled={loading}
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(""); // Clear error when user types
                if (success) setSuccess(""); // Clear success when user types
              }}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "#000000",
                  },
                },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: "#000000",
                  },
              }}
              required
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{
                mt: 2,
                py: 1.5,
                backgroundColor: "#000000",
                color: "white",
                fontWeight: 600,
                letterSpacing: "0.5px",
                "&:hover": {
                  backgroundColor: "#333333",
                },
                "&:disabled": {
                  backgroundColor: "#cccccc",
                },
                transition: "all 0.3s ease",
                position: "relative",
              }}
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Default credentials info for development */}
          <Box sx={{ mt: 3, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
            <Typography variant="caption" sx={{ color: "#666", display: "block" }}>
              Default Credentials:
            </Typography>
            <Typography variant="caption" sx={{ color: "#666", display: "block" }}>
              Email: admin@gmail.com
            </Typography>
            <Typography variant="caption" sx={{ color: "#666" }}>
              Password: admin@123
            </Typography>
          </Box>
        </CardContent>
      </Card>
      
      {/* Error Notification */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setError("")} 
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>

      {/* Success Notification */}
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess("")}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccess("")} 
          severity="success"
          sx={{ width: '100%' }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginForm;