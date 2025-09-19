"use client"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import toast from "react-hot-toast"
import { Mail, Lock, Loader2, LogIn as LoginIcon } from "lucide-react"

export default function LogInPage() {
  const router = useRouter()
  const [user, setUser] = useState({
    email: '',
    password: ""
  })

  const [buttonDisabled, setButtonDisabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  })

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: ''
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!user.email) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(user.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    // Password validation
    if (!user.password) {
      newErrors.password = 'Password is required'
    } else if (user.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error)
  }

  const logIn = async () => {
    if (!validateForm()) return

    try {
      setIsLoading(true)
      const response = await axios.post("/api/users/logIn", user)
      console.log("Login Success", response.data)
      toast.success("Welcome back!")
      router.push("/profile")
    } catch (error) {
        // Use type assertion to access 'response' property if available
        if (axios.isAxiosError(error)) {
            console.log("Login failed", error.message)
            toast.error(error.response?.data?.message || "Invalid credentials")
        } else if (error instanceof Error) {
            console.log("Login failed", error.message)
            toast.error("Invalid credentials")
        }
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setUser({ ...user, [field]: value })
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: '' })
    }
  }

  useEffect(() => {
    const isFormValid = user.email.length > 0 && user.password.length > 0
    setButtonDisabled(!isFormValid)
  }, [user])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
            <LoginIcon className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isLoading ? "Signing you in..." : "Welcome Back"}
          </h2>
          <p className="text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); logIn(); }}>
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email" 
                  id="email"
                  value={user.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`block text-black w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  id="password"
                  value={user.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`block text-black w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end">
              <Link 
                href="/forgetPassword" 
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium transition-colors duration-200"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              onClick={logIn}
              disabled={buttonDisabled || isLoading}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white transition-all duration-200 ${
                buttonDisabled || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 active:bg-indigo-800'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Dont have an account?{' '}
                <Link 
                  href="/signup" 
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
