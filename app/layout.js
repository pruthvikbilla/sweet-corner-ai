import "./globals.css";

export const metadata = {
  title: "Sweet Corner Assistant",
  description: "AI-Powered Sweet Shop Counter",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
