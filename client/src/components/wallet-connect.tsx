import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import { connectWallet, type WalletType } from "@/lib/web3";
import { Wallet } from "lucide-react";
import { SiPolkadot, SiKubernetes } from "react-icons/si";

export function WalletConnect({ onConnect }: { onConnect: (address: string, type: WalletType) => void }) {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = useCallback(async (type: WalletType) => {
    setConnecting(true);
    try {
      const address = await connectWallet(type);
      if (address) {
        onConnect(address, type);
      }
    } finally {
      setConnecting(false);
    }
  }, [onConnect]);

  return (
    <div className="flex flex-col gap-2">
      <Button 
        onClick={() => handleConnect('metamask')} 
        disabled={connecting}
        variant="outline"
        className="gap-2"
      >
        <Wallet className="h-4 w-4" />
        {connecting ? "Connecting..." : "Connect with MetaMask"}
      </Button>

      <Button 
        onClick={() => handleConnect('polkadot')} 
        disabled={connecting}
        variant="outline"
        className="gap-2"
      >
        <SiPolkadot className="h-4 w-4" />
        {connecting ? "Connecting..." : "Connect with Polkadot.js"}
      </Button>

      <Button 
        onClick={() => handleConnect('sporran')} 
        disabled={connecting}
        variant="outline"
        className="gap-2"
      >
        <SiKubernetes className="h-4 w-4" />
        {connecting ? "Connecting..." : "Connect with Sporran"}
      </Button>
    </div>
  );
}