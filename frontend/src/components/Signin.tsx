"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { chatService } from '../services/chatService';
import './Signin.css';

interface UserData {
  userDetails: {
    email: string;
    sessionId: string;
  };
  sessionId: string;
}

interface SigninProps {
  onSignInSuccess?: (userData: UserData) => void;
}

function Signin({ onSignInSuccess }: SigninProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [apiResult, setApiResult] = useState<{ success: boolean; message?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      // Call the backend API for authentication using chatService
      const data = await chatService.signin(email, password);
      
      if (data.success) {
        // Store session data in localStorage
        const userData = {
          userDetails: {
            firstName: email.split('@')[0] || 'User',
            email: data.email
          },
          sessionId: data.session_id
        };

        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('sessionId', data.session_id);

        // Call the onSignInSuccess callback
        if (onSignInSuccess) {
          console.log('Calling onSignInSuccess with userData:', userData);
          onSignInSuccess(userData);
        }

        // Navigate to chat page
        console.log('Navigating to chat page...');
        router.push('/chat');
      } else {
        console.error('Authentication failed:', data.message);
        setApiResult({ error: 'Authentication failed' });
      }
      
    } catch (error) {
      console.error('Error during authentication:', error);
      setApiResult({ error: 'Failed to connect to server' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signInContainer">
      <div className="signInBox">
        <h2>Sign In & Earn Star Rewards</h2>
        <form onSubmit={handleSubmit}>
          <div className="formGroup">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
              placeholder="Enter Email Address"
              disabled={isLoading}
            />
          </div>
          <div className="formGroup">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-required="true"
              placeholder="Enter Password"
              disabled={isLoading}
            />
          </div>
          <div className="formOptions">
            <div className="checkboxContainer">
              <input
                type="checkbox"
                id="keepSignedIn"
                name="keepSignedIn"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
                disabled={isLoading}
              />
              <label htmlFor="keepSignedIn">Keep me signed in</label>
            </div>
            <a href="#" className="forgotPasswordLink">Forgot Your Password?</a>
          </div>
          <button type="submit" className="signInButton" disabled={isLoading}>
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <div className="starRewardsInfo">
          <p><strong>You can now use your email address or mobile number to sign in.</strong></p>
          <p>When you sign in or create an account, you agree to our <a href="#">terms & conditions</a> and <a href="#">privacy policy</a>.</p>
        </div>
        <div className="createAccountSection">
          <h3>Don't have an account?</h3>
          <button type="button" className="createAccountButton" disabled={isLoading}>
            Create Account
          </button>
          <p>Creating an account is fast, easy, and free. Enjoy faster checkout, easier order tracking & returns, exclusive perks, and more!</p>
        </div>
        {apiResult && (
          <div className="apiResult">
            {apiResult.error ? (
              <p style={{ color: 'red' }}>Error: {apiResult.error}</p>
            ) : (
              <p style={{ color: 'green' }}>Sign in successful!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Signin;
