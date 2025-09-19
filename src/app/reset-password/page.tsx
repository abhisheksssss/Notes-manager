"use client"
import axios, { AxiosError } from "axios"
import React, { useEffect, useState, useCallback } from "react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { Lock, XCircle, Loader2, ArrowLeft } from "lucide-react"

interface TokenVerificationResponse {
  success: boolean;
  userId?: string;
  message?: string;
}

interface ResetPasswordRequest {
  password: string;
  confirmPassword: string;
  userId: string;
  token: string;
}

export default function ResetPasswordPage() {
  const router = useRouter();
  
  // State management
  const [token, setToken] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState<boolean>(true);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Password state
  const [passwords, setPasswords] = useState({
    password: "",
    confirmPassword: ""
  });
  const [userId, setUserId] = useState<string>("");

  // Extract token from URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      
      if (!urlToken) {
        setVerificationError("No reset token found in URL");
        setIsVerifying(false);
        return;
      }
      
      setToken(urlToken);
    }
  }, []);

  // Verify token when component mounts
  const verifyToken = useCallback(async (tokenToVerify: string) => {
    if (!tokenToVerify) return;

    try {
      setIsVerifying(true);
      setVerificationError("");
      
      // API endpoint for token verification (unchanged)
      const response = await axios.post<TokenVerificationResponse>("/api/users/reset-password", {
        token: tokenToVerify
      });

      if (response.data.message && response.data.userId) {
        setIsVerified(true);
        setUserId(response.data.userId);
        toast.success("Token verified successfully!");
      } else {
        throw new Error(response.data.message || "Token verification failed");
      }
    } catch (error) {
      console.error("Token verification error:", error);
      
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || "Invalid or expired reset token";
        setVerificationError(errorMessage);
        toast.error(errorMessage);
      } else {
        const errorMessage = "Failed to verify reset token";
        setVerificationError(errorMessage);
        toast.error(errorMessage);
      }
      
      setIsVerified(false);
    } finally {
      setIsVerifying(false);
    }
  }, []);

  useEffect(() => {
    if (token && token.trim() !== "") {
      verifyToken(token);
    }
  }, [token, verifyToken]);

  // Handle password input changes
  const handlePasswordChange = useCallback((field: 'password' | 'confirmPassword', value: string) => {
    setPasswords(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle password reset submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check if passwords are provided
    if (!passwords.password || !passwords.confirmPassword) {
      toast.error("Please fill in both password fields.");
      return;
    }

    // Enforce that both password fields must match
    if (passwords.password !== passwords.confirmPassword) {
      toast.error("Passwords do not match. Please try again.");
      return;
    }

    if (!userId || !token) {
      toast.error("Missing required information for password reset.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const newPassword: ResetPasswordRequest = {
        password: passwords.password,
        confirmPassword: passwords.confirmPassword,
        userId,
        token
      };

console.log(newPassword)

      // API endpoint for resetting the password (unchanged)
      const response = await axios.post("/api/users/resetPassword", newPassword);
      
      if (response.data) {
        toast.success(response.data.message || "Password reset successfully!");
        setPasswords({ password: "", confirmPassword: "" });
        
        toast.success("Redirecting to login page...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        throw new Error(response.data.message || "Password reset failed");
      }
      
    } catch (error) {
      console.error("Password reset error:", error);
      
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to reset password";
        toast.error(errorMessage);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying Token</h2>
          <p className="text-gray-600">Please wait while we verify your reset token...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (verificationError && !isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Reset Link</h2>
          <p className="text-gray-600 mb-6">{verificationError}</p>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/forgot-password")}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Request New Reset Link
            </button>
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Password reset form
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Lock className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">Enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={passwords.password}
              onChange={(e) => handlePasswordChange('password', e.target.value)}
              className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter new password"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              className="w-full text-black px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Confirm new password"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-lg font-medium transition-all bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Resetting...
              </div>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
