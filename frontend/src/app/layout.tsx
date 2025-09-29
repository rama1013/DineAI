import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meg, The Virtual Assistance",
  description: "Your intelligent virtual assistant for customer service",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
