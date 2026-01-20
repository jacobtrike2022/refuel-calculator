import './globals.css';

export const metadata = {
  title: 'Refuel Operating Company - Interactive Cost Calculator',
  description: 'Training Cost Calculator - RTO360 vs Trike',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
