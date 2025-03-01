import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WalletConnect } from "@/components/wallet-connect";
import { FileUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!walletAddress || !e.target.files?.[0]) return;

    setUploading(true);
    try {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        
        const res = await apiRequest("POST", "/api/documents", {
          name: file.name,
          content: base64,
          createdBy: walletAddress
        });
        
        const document = await res.json();
        setLocation(`/document/${document.id}`);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Document Signing Platform</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!walletAddress ? (
            <div className="text-center">
              <WalletConnect onConnect={setWalletAddress} />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
              </p>
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  className="gap-2"
                  disabled={uploading}
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <FileUp className="h-4 w-4" />
                  {uploading ? "Uploading..." : "Upload PDF"}
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
