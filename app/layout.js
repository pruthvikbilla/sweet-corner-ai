import "./globals.css";

export const metadata = {
  title: "Institutional Supplies Assistant",
  description: "B2B Healthcare, Hospitality & School Sourcing Assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}