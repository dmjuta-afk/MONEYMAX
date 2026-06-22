export const metadata = {
  title: "MONEYMAX — AI Financial Counselor",
  description: "MONEYMAX — your AI financial counselor. Budgeting, saving, debt payoff and investing guidance, with a saved record you can take to your advisor.",
  themeColor: "#C9A84C",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { height: 100%; }
          body { font-family: 'Inter', -apple-system, system-ui, sans-serif; background: #0E0F13; color: #ECECEC; -webkit-font-smoothing: antialiased; }
          input, button, textarea { font-family: inherit; }
          input:focus, textarea:focus { outline: none; }
          ::placeholder { color: #6B6F7A; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
