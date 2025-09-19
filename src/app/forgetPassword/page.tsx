"use client"
import axios from 'axios'
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react'; // For the loading spinner

const ForgetPassword = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [messageSent, setMessageSent] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");

    const submitEmailHandler = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Prevent submission if already loading
        if (isLoading) return;

        // Basic email validation
        if (!email) {
            toast.error("Please enter your email address.");
            return;
        }

        setIsLoading(true);
        setMessageSent(false); // Reset message on new submission

        try {
            const response = await axios.post("/api/users/forgetPassword", { email });
            
            // Assuming the API returns a 'message' on success
            setResponseMessage(response.data.message || "If an account with that email exists, a reset link has been sent.");
            setMessageSent(true);
            toast.success("Request processed successfully!");
            setEmail(""); // Clear input after successful submission

        } catch (error) {
            console.log("Forgot Password Error:", error);
            // For security, you can show a generic message even on error
            setResponseMessage("If an account with that email exists, a reset link has been sent.");
            setMessageSent(true);
            toast.error("An error occurred. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='min-h-screen flex flex-col justify-center items-center bg-gray-50 p-4'>
            <div className='bg-white p-8 rounded-xl shadow-md w-full max-w-sm'>
                <div className='text-center mb-6'>
                    <h1 className='text-2xl font-bold text-gray-800'>Forgot Your Password?</h1>
                    <p className='text-gray-500 mt-2 text-sm'>No problem. Enter your email below and well send you a reset link.</p>
                </div>

                {/* Success Message Display */}
                {messageSent && (
                    <div className='bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-md mb-4 text-sm'>
                        <p>{responseMessage}</p>
                    </div>
                )}
                
                <form onSubmit={submitEmailHandler} className='space-y-5'>
                    <div>
                        <label htmlFor="email" className="sr-only">Email</label>
                        <input 
                            id="email"
                            type="email" 
                            className='w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500'
                            placeholder='Enter your email address'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading} // Disable input when loading
                        />
                    </div>
                    
                    <button 
                        type='submit' 
                        className='w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center disabled:bg-blue-400 disabled:cursor-not-allowed'
                        disabled={isLoading} // Disable button when loading
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            'Send Reset Link'
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ForgetPassword;
