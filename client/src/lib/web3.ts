import { toast } from "@/hooks/use-toast";
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export type WalletType = 'metamask' | 'polkadot' | 'sporran';

export async function connectWallet(type: WalletType): Promise<string | null> {
  switch (type) {
    case 'metamask':
      return connectMetaMask();
    case 'polkadot':
    case 'sporran':
      return connectPolkadot(type);
    default:
      return null;
  }
}

async function connectMetaMask(): Promise<string | null> {
  if (!window.ethereum) {
    toast({
      title: "MetaMask not found",
      description: "Please install MetaMask to use this feature",
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
      title: "Failed to connect MetaMask",
      description: "Please try again",
      variant: "destructive"
    });
    return null;
  }
}

async function connectPolkadot(type: 'polkadot' | 'sporran'): Promise<string | null> {
  try {
    const extensions = await web3Enable('Decentralized Identity Vault');

    if (!extensions.length) {
      toast({
        title: `${type === 'polkadot' ? 'Polkadot.js' : 'Sporran'} not found`,
        description: `Please install the ${type === 'polkadot' ? 'Polkadot.js' : 'Sporran'} extension`,
        variant: "destructive"
      });
      return null;
    }

    const allAccounts = await web3Accounts();

    if (!allAccounts.length) {
      toast({
        title: "No accounts found",
        description: "Please create an account in your wallet",
        variant: "destructive"
      });
      return null;
    }

    // For Sporran, filter only sr25519 accounts
    const accounts = type === 'sporran' 
      ? allAccounts.filter(acc => acc.type === 'sr25519')
      : allAccounts;

    return accounts[0].address;
  } catch (error) {
    toast({
      title: "Failed to connect wallet",
      description: "Please try again",
      variant: "destructive"
    });
    return null;
  }
}

export async function signMessage(message: string, address: string, type: WalletType): Promise<string | null> {
  try {
    if (type === 'metamask') {
      return await window.ethereum.request({
        method: "personal_sign",
        params: [message, address]
      });
    } else {
      // Polkadot/Sporran signing will be implemented in the future
      toast({
        title: "Signing not yet implemented",
        description: "This feature will be available soon",
        variant: "destructive"
      });
      return null;
    }
  } catch (error) {
    toast({
      title: "Failed to sign message",
      description: "Please try again",
      variant: "destructive"
    });
    return null;
  }
}