import { toast } from "@/hooks/use-toast";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export async function connectWallet(): Promise<string | null> {
  if (!window.ethereum) {
    toast({
      title: "MetaMask not found",
      description: "Please install MetaMask to use this application",
      variant: "destructive"
    });
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });
    
    return accounts[0];
  } catch (error) {
    toast({
      title: "Failed to connect wallet",
      description: "Please try again",
      variant: "destructive"
    });
    return null;
  }
}

export async function signMessage(message: string, address: string): Promise<string | null> {
  try {
    const signature = await window.ethereum.request({
      method: "personal_sign",
      params: [message, address]
    });
    return signature;
  } catch (error) {
    toast({
      title: "Failed to sign message",
      description: "Please try again",
      variant: "destructive"
    });
    return null;
  }
}
