import { Button } from "@/components/ui/button";
import { ChevronLeft, FileText } from "lucide-react";
import { useLocation } from "wouter";

interface HeaderProps {
  showBack?: boolean;
}

export function Header({ showBack }: HeaderProps) {
  const [, setLocation] = useLocation();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center gap-2">
          {showBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/')}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <div className="flex items-center gap-2 font-semibold">
            <FileText className="h-5 w-5" />
            <span>Identity Vault</span>
          </div>
        </div>
      </div>
    </header>
  );
}
