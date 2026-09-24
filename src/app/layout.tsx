import type { Metadata } from 'next';
import './globals.css'; // Adjust path depending on where your CSS lives

export const metadata: Metadata = {
  title: 'Product Management Dashboard',
  description: 'Admin dashboard for managing products',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">{children}</body>
    </html>
  );
}