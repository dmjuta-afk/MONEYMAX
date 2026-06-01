import "./globals.css";

export const metadata = {
  title: "MONEYMAX — AI Financial Counselor",
  description: "Your personal AI financial counselor",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
