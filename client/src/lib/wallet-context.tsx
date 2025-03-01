import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { type WalletType } from "@/lib/web3";

interface WalletContextType {
  address: string | null;
  walletType: WalletType | null;
  connect: (address: string, type: WalletType) => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType | null>(null);

  const connect = useCallback((address: string, type: WalletType) => {
    setAddress(address);
    setWalletType(type);
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setWalletType(null);
  }, []);

  return (
    <WalletContext.Provider value={{ address, walletType, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
