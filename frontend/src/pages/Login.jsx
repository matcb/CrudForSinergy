import { useState, useEffect } from "react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Label from "@/components/Label";
import Checkbox from "@/components/Checkbox";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { addUser, getUserByEmail, initDB } from "../../../db/db.js";

const Login = ({ onLogin }) => {
  const [dbReady, setDbReady] = useState(false);
  const navigate = useNavigate();

  const [dbError, setDbError] = useState(null);

  useEffect(() => {
    initDB()
      .then(() => setDbReady(true))
      .catch((err) => {
        console.error("DB Init Failed:", err);
        setDbError("Failed to load database. Please refresh the page.");
      });
  }, []);

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});

  const sanitizeInput = (input) => {
    if (typeof input !== "string") return input;
    return input.trim().replace(/[<>]/g, "");
  };

  const isValidEmail = (email) => {
    if (!email || typeof email !== "string") return false;
    
    const trimmedEmail = email.trim();
    const atIndex = trimmedEmail.indexOf("@");
    const lastDotIndex = trimmedEmail.lastIndexOf(".");
    
    if (atIndex <= 0) return false;
    if (lastDotIndex <= atIndex + 1) return false;
    if (lastDotIndex === trimmedEmail.length - 1) return false;
    if (trimmedEmail.includes(" ")) return false;
    
    const localPart = trimmedEmail.substring(0, atIndex);
    const domain = trimmedEmail.substring(atIndex + 1);
    
    return localPart.length > 0 && domain.length > 0 && domain.includes(".");
  };

  const MIN_PASSWORD_LENGTH = 6;
  const MAX_PASSWORD_LENGTH = 100;
  const MIN_NAME_LENGTH = 2;
  const MAX_NAME_LENGTH = 100;
  const MAX_EMAIL_LENGTH = 255;

  const validateForm = () => {
    const newErrors = {};

    const email = formData.email ? sanitizeInput(formData.email) : "";
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Email is invalid";
    } else if (email.length > MAX_EMAIL_LENGTH) {
      newErrors.email = "Email is too long";
    }

    const password = formData.password || "";
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      newErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    } else if (password.length > MAX_PASSWORD_LENGTH) {
      newErrors.password = "Password is too long";
    }

    if (!isLogin) {
      const name = formData.name ? sanitizeInput(formData.name) : "";
      if (!name) {
        newErrors.name = "Name is required";
      } else if (name.length < MIN_NAME_LENGTH) {
        newErrors.name = `Name must be at least ${MIN_NAME_LENGTH} characters`;
      } else if (name.length > MAX_NAME_LENGTH) {
        newErrors.name = "Name is too long";
      }

      if (password && password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const sanitizedEmail = sanitizeInput(formData.email);
      const sanitizedName = formData.name ? sanitizeInput(formData.name) : "";

      if (isLogin) {
        const user = await getUserByEmail(sanitizedEmail);
        if (!user) {
          setErrors({ email: "No account with this email" });
          return;
        }
        if (user.password !== formData.password) {
          setErrors({ password: "Incorrect password" });
          return;
        }
      } else {
        const existing = await getUserByEmail(sanitizedEmail);
        if (existing) {
          setErrors({ email: "Email already registered" });
          return;
        }
        await addUser({
          email: sanitizedEmail,
          password: formData.password,
          name: sanitizedName,
        });
      }

      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userEmail", formData.email);
      if (onLogin) onLogin();

      navigate("/tasks");
    } catch (err) {
      console.error("DB ERROR:", err);
      setErrors({ 
        general: err.message || "Database error occurred. Please try again." 
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  if (!dbReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {dbError ? (
            <>
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
                {dbError}
              </div>
              <button
                onClick={() => window.location.reload()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Reload Page
              </button>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p>Loading database...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isLogin ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-muted-foreground">
            {isLogin
              ? "Enter your credentials to access your account"
              : "Sign up to get started with your account"}
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
          {errors.general && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`pl-10 h-11 ${errors.name ? "border-destructive" : ""}`}
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`pl-10 h-11 ${errors.email ? "border-destructive" : ""}`}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`pl-10 h-11 ${errors.password ? "border-destructive" : ""}`}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className={`pl-10 h-11 ${
                    errors.confirmPassword ? "border-destructive" : ""
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onChange={(checked) => handleInputChange("rememberMe", checked)}
                  />
                  <label htmlFor="remember" className="text-sm text-foreground cursor-pointer">
                    Remember me
                  </label>
                </div>
                <Link to="#" className="text-sm text-primary hover:text-primary-hover transition-colors">
                  Forgot password?
                </Link>
              </div>
            )}

            <Button type="submit">
              {isLogin ? "Sign in" : "Create account"}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="text-primary hover:text-primary-hover font-medium transition-colors"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
