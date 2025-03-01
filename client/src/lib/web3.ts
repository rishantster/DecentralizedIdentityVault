import { toast } from "@/hooks/use-toast";
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export type WalletType = 'metamask' | 'polkadot' | 'sporran';

export async function verifyWalletOwnership(address: string, type: WalletType): Promise<boolean> {
  const message = `Sign this message to verify your identity with Decentralized Identity Vault\nTimestamp: ${Date.now()}`;
  const signature = await signMessage(message, address, type);
  return signature !== null;
}

export async function verifyDocumentSignature(documentContent: string, signer: string, signature: string, type: WalletType): Promise<boolean> {
  try {
    if (type === 'metamask') {
      if (!window.ethereum) {
        toast({
          title: "MetaMask not found",
          description: "Please install MetaMask to verify signatures",
          variant: "destructive"
        });
        return false;
      }

      // Get the message part from the document content (everything before === SIGNATURES ===)
      const [message] = documentContent.split('\n\n=== SIGNATURES ===');

      // For MetaMask, we need to use the same message format as when signing
      const signedMessage = `Signing document with content:\n${message}`;

      // Recover the address from the signature using personal_ecRecover
      const recoveredAddress = await window.ethereum.request({
        method: "personal_ecRecover",
        params: [signedMessage, signature]
      });

      return recoveredAddress.toLowerCase() === signer.toLowerCase();
    } else {
      // For Polkadot/Sporran, signature verification will be implemented later
      toast({
        title: "Signature verification not implemented",
        description: "This feature will be available soon for Polkadot and Sporran wallets",
        variant: "destructive"
      });
      return false;
    }
  } catch (error) {
    console.error('Signature verification error:', error);
    toast({
      title: "Failed to verify signature",
      description: "There was an error verifying the signature",
      variant: "destructive"
    });
    return false;
  }
}

export async function connectWallet(type: WalletType): Promise<string | null> {
  let address: string | null = null;

  switch (type) {
    case 'metamask':
      address = await connectMetaMask();
      break;
    case 'polkadot':
    case 'sporran':
      address = await connectPolkadot(type);
      break;
    default:
      return null;
  }

  if (!address) return null;

  // Verify wallet ownership through signature
  const isVerified = await verifyWalletOwnership(address, type);
  if (!isVerified) {
    toast({
      title: "Verification failed",
      description: "Please sign the message to verify your identity",
      variant: "destructive"
    });
    return null;
  }

  return address;
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
    // Request permission to connect and get accounts
    await window.ethereum.request({
      method: "wallet_requestPermissions",
      params: [{ eth_accounts: {} }]
    });

    // This will trigger MetaMask's account selector
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    if (!accounts || accounts.length === 0) {
      toast({
        title: "No account selected",
        description: "Please select an account in MetaMask",
        variant: "destructive"
      });
      return null;
    }

    // Listen for account changes
    window.ethereum.on('accountsChanged', function (accounts: string[]) {
      if (accounts.length === 0) {
        window.location.reload(); // Refresh the page when user disconnects
      }
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
      // For documents, we want to include the content in the message
      const signedMessage = `Signing document with content:\n${message}`;

      return await window.ethereum.request({
        method: "personal_sign",
        params: [signedMessage, address]
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