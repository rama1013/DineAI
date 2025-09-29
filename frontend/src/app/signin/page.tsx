"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Signin from '../../components/Signin';

export default function SigninPage() {
  const router = useRouter();

  const handleSignInSuccess = (userData: any) => {
    console.log('User signed in:', userData);
    // The Signin component will handle navigation to /chat
  };

  return (
    <div 
      style={{
        backgroundColor: "white",
        minHeight: "100vh",
        width: "100%"
      }}
    >
      {/* Signin Component */}
      <Signin 
        onSignInSuccess={handleSignInSuccess}
      />
    </div>
  );
}
