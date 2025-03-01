import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { WalletConnect } from "@/components/wallet-connect";
import { Header } from "@/components/header";
import { FileText, Shield, Share2, Plus, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { type WalletType } from "@/lib/web3";
import { useWallet } from "@/lib/wallet-context";
import type { Document } from "@shared/schema";

export default function Home() {
  const { address, walletType, connect } = useWallet();
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: [`/api/documents/creator/${address}`],
    enabled: !!address,
  });

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
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-background to-muted">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold tracking-tight">Decentralized Identity Vault</h1>
              <p className="text-muted-foreground text-lg">
                Secure your digital identity and documents with blockchain verification
              </p>
            </div>

            {!address ? (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Connect Wallet
                  </CardTitle>
                  <CardDescription>
                    Connect your wallet to create and verify your identity documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <WalletConnect onConnect={handleWalletConnect} />
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {!showCreate ? (
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">Your Documents</h2>
                    <Button onClick={() => setShowCreate(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create New Document
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => setShowCreate(false)} className="gap-2">
                    Back to Documents
                  </Button>
                )}

                {showCreate ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Create New Document
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Input
                        placeholder="Document Title"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <Textarea
                        placeholder="Enter your document content here..."
                        className="min-h-[200px]"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      />
                      <Button
                        className="w-full"
                        onClick={handleCreateDocument}
                        disabled={creating || !content.trim() || !name.trim()}
                      >
                        {creating ? "Creating..." : "Create & Sign Document"}
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-4">
                    {documents.length === 0 ? (
                      <Card className="p-6 text-center">
                        <p className="text-muted-foreground">No documents created yet.</p>
                        <Button onClick={() => setShowCreate(true)} className="mt-4 gap-2">
                          <Plus className="h-4 w-4" />
                          Create Your First Document
                        </Button>
                      </Card>
                    ) : (
                      documents.map((doc) => (
                        <Card key={doc.id} className="hover:bg-muted/50 transition-colors">
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle>{doc.name}</CardTitle>
                                <CardDescription>
                                  Status: {doc.status === 'signed' ? 'Signed' : 'Pending'}
                                </CardDescription>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setLocation(`/document/${doc.id}`)}
                                className="gap-2"
                              >
                                View Document
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {!showCreate && (
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
            )}
          </div>
        </div>
      </div>
    </>
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