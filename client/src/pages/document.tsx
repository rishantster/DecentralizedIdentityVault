import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { signMessage } from "@/lib/web3";
import { WalletConnect } from "@/components/wallet-connect";
import { Share2, Download } from "lucide-react";
import type { Document, Signature } from "@shared/schema";
import { type WalletType } from "@/lib/web3";
import { useWallet } from "@/lib/wallet-context";

export default function DocumentPage({ params }: { params: { id: string } }) {
  const { address, walletType, connect } = useWallet();
  const { toast } = useToast();

  const { data: docData } = useQuery<Document>({
    queryKey: [`/api/documents/${params.id}`],
  });

  const { data: signatures = [] } = useQuery<Signature[]>({
    queryKey: [`/api/documents/${params.id}/signatures`],
    enabled: !!docData,
  });

  const signatureMutation = useMutation({
    mutationFn: async () => {
      if (!address || !docData || !walletType) return;

      const message = `Signing document ${docData.id} - ${docData.name}`;
      const signature = await signMessage(message, address, walletType);

      if (!signature) return;

      const timestamp = new Date().toISOString();

      // Add signature to the signatures collection
      await apiRequest("POST", `/api/documents/${docData.id}/signatures`, {
        signerAddress: address,
        signature,
        timestamp,
      });

      // Split content to separate base content from signatures
      const [baseContent] = docData.content.split('\n\n=== SIGNATURES ===');

      // Create updated content with all signatures including the new one
      const updatedSignatures = [
        ...signatures,
        { signerAddress: address, signature, timestamp }
      ];

      const signatureBlocks = updatedSignatures.map(sig => 
        `Signer: ${sig.signerAddress}\nTime: ${new Date(sig.timestamp).toLocaleString()}\nSignature: ${sig.signature}\n----------------------------------------`
      ).join('\n\n');

      const updatedContent = `${baseContent || docData.content}\n\n=== SIGNATURES ===\n\n${signatureBlocks}`;

      // Update the document content to include the new signature
      await apiRequest("PATCH", `/api/documents/${docData.id}`, {
        content: updatedContent,
      });

      await queryClient.invalidateQueries({ queryKey: [`/api/documents/${docData.id}`] });
      await queryClient.invalidateQueries({ queryKey: [`/api/documents/${docData.id}/signatures`] });
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

  const handleWalletConnect = (address: string, type: WalletType) => {
    connect(address, type);
  };

  const handleDownload = () => {
    if (!docData) return;

    // Create a blob with the document content
    const blob = new Blob([docData.content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);

    // Create a temporary link and trigger download
    const link = window.document.createElement('a');
    link.href = url;
    link.download = `${docData.name}.txt`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (!docData) return null;

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{docData.name}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                navigator.clipboard.writeText(
                  `${window.location.origin}/share/${docData.shareableLink}`
                );
                toast({ title: "Share link copied to clipboard" });
              }}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            {!address ? (
              <WalletConnect onConnect={handleWalletConnect} />
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
            {docData.content}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}