import "@rainbow-me/rainbowkit/styles.css";
import "@rainbow-me/rainbowkit/styles.css";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { GlobalErrorBoundary } from "~~/components/GlobalErrorBoundary";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";

export const metadata: Metadata = {
  title: "SimpleSwap DEX",
  description: "Intercambia tokens, añade liquidez y explora pools con una interfaz moderna estilo Uniswap.",
  metadataBase: new URL("https://simpleswap-dex.vercel.app/"),

  openGraph: {
    title: "SimpleSwap DEX",
    description: "Un DEX moderno y elegante para intercambiar tokens en Sepolia.",
    url: "https://simpleswap-dex.vercel.app/",
    siteName: "SimpleSwap",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SimpleSwap DEX UI",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SimpleSwap DEX",
    description: "Swap, liquidez y análisis en un solo lugar.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

const SimpleSwapDApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders>
            <GlobalErrorBoundary>{children}</GlobalErrorBoundary>
            <Toaster position="top-center" />
          </ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default SimpleSwapDApp;
