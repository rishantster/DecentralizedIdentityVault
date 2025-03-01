import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import { connectWallet, type WalletType } from "@/lib/web3";
import { Wallet } from "lucide-react";
import { SiPolkadot, SiKubernetes } from "react-icons/si";

export function WalletConnect({ onConnect }: { onConnect: (address: string, type: WalletType) => void }) {
  const [connecting, setConnecting] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleConnect = useCallback(async (type: WalletType) => {
    setConnecting(true);
    setVerifying(false);
    try {
      setVerifying(true);
      const address = await connectWallet(type);
      if (address) {
        onConnect(address, type);
      }
    } finally {
      setConnecting(false);
      setVerifying(false);
    }
  }, [onConnect]);

  const getButtonText = (type: string) => {
    if (connecting) return "Connecting...";
    if (verifying) return "Verifying...";
    return `Connect with ${type}`;
  };

  return (
    <div className="flex flex-col gap-2">
      <Button 
        onClick={() => handleConnect('metamask')} 
        disabled={connecting || verifying}
        variant="outline"
        className="gap-2"
      >
        <Wallet className="h-4 w-4" />
        {getButtonText("MetaMask")}
      </Button>

      <Button 
        onClick={() => handleConnect('polkadot')} 
        disabled={connecting || verifying}
        variant="outline"
        className="gap-2"
      >
        <SiPolkadot className="h-4 w-4" />
        {getButtonText("Polkadot.js")}
      </Button>

      <Button 
        onClick={() => handleConnect('sporran')} 
        disabled={connecting || verifying}
        variant="outline"
        className="gap-2"
      >
        <SiKubernetes className="h-4 w-4" />
        {getButtonText("Sporran")}
      </Button>
    </div>
  );
}