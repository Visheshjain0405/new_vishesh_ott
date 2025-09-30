import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../Assests/api/axiosInstance";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState("auth");
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    rememberMe: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const toggleAuthMode = () => {
    setIsLogin((v) => !v);
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      rememberMe: false,
    });
  };

 const handleSubmit = async () => {
    if (!formData.email || !formData.password) return alert("Please fill email and password");
    if (!isLogin) {
      if (!formData.firstName || !formData.lastName) return alert("Please fill first and last name");
      if (formData.password !== formData.confirmPassword) return alert("Passwords do not match");
      if (formData.password.length < 6) return alert("Password must be at least 6 characters");
    }

    if (isLogin) {
      const { ok, error, data } = await login(formData.email, formData.password, formData.rememberMe);
      if (!ok) return alert(error);
      alert(`Welcome back, ${data?.user?.firstName || data?.user?.email || "user"}!`);
      navigate("/homepage");
    } else {
      const { ok, error } = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      if (!ok) return alert(error);
      alert("Account created! You are now signed in.");
      navigate("/admin/dashboard");
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) return alert("Please enter your email address");
    try {
      await axiosInstance.post("/auth/forgot-password", { email: formData.email });
      alert("If an account exists, a reset link has been sent to your email.");
      setCurrentPage("auth");
      setFormData((p) => ({ ...p, email: "" }));
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Request failed");
    }
  };

  // If you use Google OAuth that redirects back with token in URL,
  // parse token in a callback page and call setAuthToken(token).
  const handleGoogleAuth = () => {
    const apiOrigin =
      (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
    window.open(`${apiOrigin}/api/auth/google`, "_self");
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left hero */}
      <div className="hidden lg:flex lg:w-[70%] relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1489599849637-2c2493ee7c13?auto=format&fit=crop&w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-red-900/40" />
        <div className="relative z-10 flex flex-col justify-center items-center text-center px-12 text-white">
          <div className="mb-8">
            <div className="w-20 h-20 bg-red-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
              </svg>
            </div>
            <h1 className="text-4xl font-black mb-2">MovieStream</h1>
            <p className="text-xl text-gray-300">Your Ultimate Entertainment Destination</p>
          </div>

          <div className="space-y-6 max-w-md">
            <Feature
              iconPath="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0v14a2 2 0 002 2h6a2 2 0 002-2V4m-9 0h10M9 8h6m-6 4h6m-6 4h3"
              title="Unlimited Movies"
              desc="Access thousands of movies and web series"
            />
            <Feature
              iconPath="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              title="Mobile Friendly"
              desc="Watch anywhere, anytime on any device"
              wrapperClass="bg-purple-600/20"
              iconColor="text-purple-400"
            />
            <Feature
              iconPath="M13 10V3L4 14h7v7l9-11h-7z"
              title="HD Quality"
              desc="Crystal clear streaming experience"
              wrapperClass="bg-blue-600/20"
              iconColor="text-blue-400"
            />
          </div>
        </div>
      </div>

      {/* Right: auth form */}
      <div className="w-full lg:w-[30%] flex items-center justify-center p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* mobile header */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-red-600 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-white mb-2">MovieStream</h1>
            <p className="text-gray-400">Your Entertainment Hub</p>
          </div>

          {currentPage === "forgotPassword" ? (
            <>
              <button
                onClick={() => setCurrentPage("auth")}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Sign In
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-red-600/20 border border-red-600/30 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v-2H7v-2H4a1 1 0 01-1-1v-4c0-5.523 4.477-10 10-10a10 10 0 019.542 7.058"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Forgot Password?</h2>
                <p className="text-gray-400 leading-relaxed">
                  Enter your email address and we’ll send you a secure reset link.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter your registered email"
                  />
                </div>

                <button
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>

                <div className="text-center">
                  <button
                    onClick={() => setCurrentPage("auth")}
                    className="py-2.5 px-4 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg text-gray-300 hover:text-white transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {isLogin ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="text-gray-400">
                  {isLogin ? "Sign in to continue to your account" : "Sign up to get started with MovieStream"}
                </p>
              </div>

              <div className="space-y-6">
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-4">
                    <TextInput
                      label="First Name *"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                    />
                    <TextInput
                      label="Last Name *"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                    />
                  </div>
                )}

                <TextInput
                  label="Email Address *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                />

                <PasswordInput
                  label="Password *"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  show={showPassword}
                  setShow={setShowPassword}
                  placeholder="Enter your password"
                />

                {!isLogin && (
                  <PasswordInput
                    label="Confirm Password *"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    show={showConfirmPassword}
                    setShow={setShowConfirmPassword}
                    placeholder="Confirm your password"
                  />
                )}

                {isLogin && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleInputChange}
                        className="w-4 h-4 bg-gray-800 border border-gray-600 rounded focus:ring-red-500 focus:ring-2 text-red-600"
                      />
                      <span className="text-sm text-gray-300">Remember me</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setCurrentPage("forgotPassword")}
                      className="text-sm text-red-400 hover:text-red-300"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all disabled:opacity-60"
                >
                  {loading ? (isLogin ? "Signing in..." : "Creating...") : isLogin ? "Sign In" : "Create Account"}
                </button>

                <Divider label="Or continue with" />

                {/* <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-semibold"
                >
                  <GoogleIcon />
                  Continue with Google
                </button> */}

                <div className="text-center">
                  <p className="text-gray-400">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                    <button
                      type="button"
                      onClick={toggleAuthMode}
                      className="ml-2 text-red-400 hover:text-red-300 font-semibold"
                    >
                      {isLogin ? "Sign up" : "Sign in"}
                    </button>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TextInput({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">{label}</label>
      <input
        {...props}
        className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
      />
    </div>
  );
}

function PasswordInput({ label, show, setShow, ...props }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-300 mb-2">{label}</label>
      <div className="relative">
        <input
          {...props}
          type={show ? "text" : "password"}
          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 pr-12"
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {show ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878L3 3m6.878 6.878L21 21"
              />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            )}
          </svg>
        </button>
      </div>
    </div>
  );
}

function Divider({ label }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-700" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-black text-gray-400">{label}</span>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC04" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function Feature({ iconPath, title, desc, wrapperClass = "bg-red-600/20", iconColor = "text-red-400" }) {
  return (
    <div className="flex items-center gap-4 text-left">
      <div className={`w-12 h-12 ${wrapperClass} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <svg className={`w-6 h-6 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
        </svg>
      </div>
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-gray-400">{desc}</p>
      </div>
    </div>
  );
}
