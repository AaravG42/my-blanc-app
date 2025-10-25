import "@rainbow-me/rainbowkit/styles.css";
import { BottomNav } from "~~/components/BottomNav";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Blanc - Social dApp",
  description: "Decentralized social media with verified moments",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  themeColor: "#6366f1",
  manifest: "/manifest.json",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html suppressHydrationWarning className={``}>
      <body suppressHydrationWarning>
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders>
            {children}
            <BottomNav />
          </ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
