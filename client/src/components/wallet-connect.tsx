import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import { connectWallet } from "@/lib/web3";
import { Wallet } from "lucide-react";

export function WalletConnect({ onConnect }: { onConnect: (address: string) => void }) {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = useCallback(async () => {
    setConnecting(true);
    try {
      const address = await connectWallet();
      if (address) {
        onConnect(address);
      }
    } finally {
      setConnecting(false);
    }
  }, [onConnect]);

  return (
    <Button 
      onClick={handleConnect} 
      disabled={connecting}
      variant="outline"
      className="gap-2"
    >
      <Wallet className="h-4 w-4" />
      {connecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
