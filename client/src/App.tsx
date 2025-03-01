import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { WalletProvider } from "./lib/wallet-context";
import { WalletStatus } from "@/components/wallet-status";
import { useWallet } from "@/lib/wallet-context";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Document from "@/pages/document";

function Layout({ children }: { children: React.ReactNode }) {
  const { address, walletType, disconnect } = useWallet();

  return (
    <div>
      {address && walletType && (
        <div className="fixed top-0 right-0 p-4 z-50">
          <WalletStatus
            address={address}
            type={walletType}
            onLogout={disconnect}
          />
        </div>
      )}
      {children}
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/document/:id" component={Document} />
        <Route path="/share/:link" component={Document} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <Router />
        <Toaster />
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;