import type { AppProps } from "next/app";
import "@rainbow-me/rainbowkit/styles.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import "~~/styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider enableSystem>
      <ScaffoldEthAppWithProviders>
        <Component {...pageProps} />
        <Toaster position="top-center" />
      </ScaffoldEthAppWithProviders>
    </ThemeProvider>
  );
}

export default MyApp;
