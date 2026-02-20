import "./globals.css";

export const metadata = {
  title: "Home Tutor Admin",
  description: "Admin website for Home Tutor platform"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

