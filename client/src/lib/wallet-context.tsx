import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { type WalletType } from "@/lib/web3";

interface WalletContextType {
  address: string | null;
  walletType: WalletType | null;
  connect: (address: string, type: WalletType) => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType | null>(null);

const STORAGE_KEY = 'wallet_connection';

interface StoredWalletData {
  address: string;
  type: WalletType;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType | null>(null);

  // Load stored wallet data on mount
  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        const { address, type } = JSON.parse(storedData) as StoredWalletData;
        setAddress(address);
        setWalletType(type);
      } catch (error) {
        console.error('Failed to parse stored wallet data:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const connect = useCallback((address: string, type: WalletType) => {
    setAddress(address);
    setWalletType(type);
    // Store wallet data
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ address, type }));
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setWalletType(null);
    // Clear stored wallet data
    localStorage.removeItem(STORAGE_KEY);
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