import "@rainbow-me/rainbowkit/styles.css";
import "@rainbow-me/rainbowkit/styles.css";
import { Toaster } from "react-hot-toast";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";

export const metadata = {
  title: "SimpleSwap",
  description: "DEX tipo Uniswap con Scaffold-ETH 2",
};

const SimpleSwapDApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders>
            {children}
            <Toaster position="top-center" />
          </ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default SimpleSwapDApp;
