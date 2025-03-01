import { Button } from "@/components/ui/button";
import { ChevronLeft, FileText } from "lucide-react";
import { useLocation } from "wouter";

interface HeaderProps {
  showBack?: boolean;
}

export function Header({ showBack }: HeaderProps) {
  const [, setLocation] = useLocation();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex h-16 max-w-screen-xl items-center">
        <div className="flex flex-1 items-center gap-6">
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
          <div className="flex items-center gap-3 font-semibold">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg">Identity Vault</span>
          </div>
        </div>
      </div>
    </header>
  );
}