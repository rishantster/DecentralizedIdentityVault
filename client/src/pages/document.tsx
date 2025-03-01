import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { signMessage } from "@/lib/web3";
import { WalletConnect } from "@/components/wallet-connect";
import { Share2 } from "lucide-react";
import type { Document, Signature } from "@shared/schema";

export default function DocumentPage({ params }: { params: { id: string } }) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: document } = useQuery<Document>({
    queryKey: [`/api/documents/${params.id}`],
  });

  const { data: signatures = [] } = useQuery<Signature[]>({
    queryKey: [`/api/documents/${params.id}/signatures`],
    enabled: !!document,
  });

  const signatureMutation = useMutation({
    mutationFn: async () => {
      if (!walletAddress || !document) return;

      const message = `Signing document ${document.id} - ${document.name}`;
      const signature = await signMessage(message, walletAddress);

      if (!signature) return;

      const timestamp = new Date().toISOString();

      await apiRequest("POST", `/api/documents/${document.id}/signatures`, {
        signerAddress: walletAddress,
        signature,
        timestamp,
      });

      // Update document content with signature
      const updatedContent = `${document.content}\n\nSigned by ${walletAddress} at ${timestamp}`;
      await apiRequest("POST", `/api/documents/${document.id}`, {
        ...document,
        content: updatedContent,
      });

      // Invalidate queries to refetch data
      await queryClient.invalidateQueries({ queryKey: [`/api/documents/${document.id}`] });
      await queryClient.invalidateQueries({ queryKey: [`/api/documents/${document.id}/signatures`] });
    },
    onSuccess: () => {
      toast({
        title: "Document signed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to sign document",
        variant: "destructive",
      });
    },
  });

  if (!document) return null;

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{document.name}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/share/${document.shareableLink}`
                );
                toast({ title: "Share link copied to clipboard" });
              }}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            {!walletAddress ? (
              <WalletConnect onConnect={setWalletAddress} />
            ) : (
              <Button
                onClick={() => signatureMutation.mutate()}
                disabled={signatureMutation.isPending}
              >
                {signatureMutation.isPending ? "Signing..." : "Sign Document"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {signatures.length > 0 && (
            <div className="mb-4">
              <h3 className="font-medium mb-2">Signatures:</h3>
              <ul className="text-sm text-muted-foreground">
                {signatures.map((sig) => (
                  <li key={sig.id}>
                    {sig.signerAddress.slice(0, 6)}...{sig.signerAddress.slice(-4)} - {new Date(sig.timestamp).toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="border rounded-lg p-4 bg-muted/50 whitespace-pre-wrap font-mono text-sm">
            {document.content}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}