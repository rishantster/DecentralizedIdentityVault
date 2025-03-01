import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { type WalletType } from "@/lib/web3";

interface WalletStatusProps {
  address: string;
  type: WalletType;
  onLogout: () => void;
}

export function WalletStatus({ address, type, onLogout }: WalletStatusProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground">
        {address.slice(0, 6)}...{address.slice(-4)} ({type})
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={onLogout}
        className="gap-2"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}
