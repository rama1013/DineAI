"use client";
import { useEffect } from "react";
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already signed in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      // If user is signed in, redirect to chat
      router.push('/chat');
    } else {
      // If not signed in, redirect to signin
      router.push('/signin');
    }
  }, [router]);

  // Show loading while redirecting
  return (
    <div 
      style={{
        backgroundImage: "url('/blur_bg_image_new.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <div style={{
        background: "rgba(255, 255, 255, 0.9)",
        padding: "20px",
        borderRadius: "8px",
        fontFamily: "'MacysSans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        Loading...
      </div>
    </div>
  );
}
