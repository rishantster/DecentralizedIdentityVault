import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { WalletConnect } from "@/components/wallet-connect";
import { FileText, Shield, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type WalletType } from "@/lib/web3";
import { useWallet } from "@/lib/wallet-context";

export default function Home() {
  const { address, walletType, connect } = useWallet();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  async function handleCreateDocument() {
    if (!address || !content.trim() || !name.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setCreating(true);
    try {
      const res = await apiRequest("POST", "/api/documents", {
        name,
        content,
        createdBy: address,
        walletType
      });

      const document = await res.json();
      setLocation(`/document/${document.id}`);
    } catch (error) {
      toast({
        title: "Creation failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  }

  const handleWalletConnect = (address: string, type: WalletType) => {
    connect(address, type);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Decentralized Identity Vault</h1>
            <p className="text-muted-foreground text-lg">
              Secure your digital identity and documents with blockchain verification
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Create Identity Document
              </CardTitle>
              <CardDescription>
                Connect your wallet to create and verify your identity documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!address ? (
                <div className="text-center py-4">
                  <WalletConnect onConnect={handleWalletConnect} />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Connected: {address.slice(0, 6)}...{address.slice(-4)} ({walletType})
                    </p>
                    <Input
                      placeholder="Document Title"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Enter your document content here..."
                      className="min-h-[200px]"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleCreateDocument}
                    disabled={creating || !content.trim() || !name.trim()}
                  >
                    {creating ? "Creating..." : "Create & Sign Document"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Decentralized"
              description="Your identity, secured by blockchain technology"
            />
            <FeatureCard
              icon={<FileText className="h-8 w-8" />}
              title="Verifiable"
              description="Cryptographically signed identity documents"
            />
            <FeatureCard
              icon={<Share2 className="h-8 w-8" />}
              title="Shareable"
              description="Share your verified credentials securely"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="text-center p-6">
      <div className="flex justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
  );
}