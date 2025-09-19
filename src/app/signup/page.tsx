"use client"
import Link from "next/link"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import toast from "react-hot-toast"
import { Mail, User, Lock, Loader2 } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const [user, setUser] = useState({
    email: '',
    password: "",
    username: ""
  })

  const [buttonDisabled, setButtonDisabled] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    username: ''
  })

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
      username: ''
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!user.email) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(user.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    // Username validation
    if (!user.username) {
      newErrors.username = 'Username is required'
    } else if (user.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
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

  const onSignup = async () => {
    if (!validateForm()) return

    try {
      setIsLoading(true)
      const response = await axios.post("/api/users/signUp", user)
      console.log("SignUp successful", response.data)
      toast.success("Account created successfully!")
      router.push("/login")
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log("SignUp failed", error.message)
        toast.error(error.response?.data?.message || "Something went wrong!")
      } else if (error instanceof Error) {
        console.log("SignUp failed", error.message)
        toast.error("Something went wrong!")
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
    const isFormValid = user.email.length > 0 && 
                       user.password.length > 0 && 
                       user.username.length > 0
    setButtonDisabled(!isFormValid)
  }, [user])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center mb-4">
            <User className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isLoading ? "Creating Account..." : "Create Account"}
          </h2>
          <p className="text-sm text-gray-600">
            Join us today and get started
          </p>
        </div>

        {/* Form */}
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-gray-100">
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSignup(); }}>
            
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text" 
                  id="username"
                  value={user.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className={`block text-black w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${
                    errors.username ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                  placeholder="Enter your username"
                  disabled={isLoading}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username}</p>
              )}
            </div>

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

            {/* Submit Button */}
            <button
              type="submit"
              onClick={onSignup}
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
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors duration-200"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        {/* <p className="text-center text-xs text-gray-500">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="text-indigo-600 hover:text-indigo-500">
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500">
            Privacy Policy
          </Link>
        </p> */}
      </div>
    </div>
  )
}
