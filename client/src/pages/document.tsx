import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { signMessage, verifyDocumentSignature } from "@/lib/web3";
import { WalletConnect } from "@/components/wallet-connect";
import { Header } from "@/components/header";
import { Share2, Download, Shield, CheckCircle2, XCircle } from "lucide-react";
import type { Document, Signature } from "@shared/schema";
import { type WalletType } from "@/lib/web3";
import { useWallet } from "@/lib/wallet-context";
import MDEditor from '@uiw/react-md-editor';

interface VerificationStatus {
  [key: number]: boolean;
}

export default function DocumentPage({ params }: { params: { id: string } }) {
  const { address, walletType, connect } = useWallet();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({});

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

      // Get the base content without signatures
      const [baseContent] = docData.content.split('\n\n=== SIGNATURES ===');
      const contentToSign = baseContent || docData.content;

      const signature = await signMessage(contentToSign, address, walletType);

      if (!signature) return;

      const timestamp = new Date().toISOString();

      // Add signature to the signatures collection
      await apiRequest("POST", `/api/documents/${docData.id}/signatures`, {
        signerAddress: address,
        signature,
        timestamp,
      });

      // Create updated content with all signatures including the new one
      const updatedSignatures = [
        ...signatures,
        { signerAddress: address, signature, timestamp }
      ];

      const signatureBlocks = updatedSignatures.map(sig =>
        `Signer: ${sig.signerAddress}\nTime: ${new Date(sig.timestamp).toLocaleString()}\nSignature: ${sig.signature}\n----------------------------------------`
      ).join('\n\n');

      const updatedContent = `${contentToSign}\n\n=== SIGNATURES ===\n\n${signatureBlocks}`;

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

  const handleVerifySignatures = async () => {
    if (!docData || !signatures.length) return;

    setVerifying(true);
    try {
      const results = await Promise.all(
        signatures.map(async (sig) => {
          const isValid = await verifyDocumentSignature(
            docData.content,
            sig.signerAddress,
            sig.signature,
            'metamask' // Currently only supporting MetaMask verification
          );
          return { id: sig.id, isValid };
        })
      );

      const newVerificationStatus = results.reduce((acc, { id, isValid }) => {
        acc[id] = isValid;
        return acc;
      }, {} as VerificationStatus);

      setVerificationStatus(newVerificationStatus);

      const validCount = results.filter(r => r.isValid).length;
      toast({
        title: `Signature Verification Result`,
        description: `${validCount} out of ${results.length} signatures are valid.`,
        variant: validCount === results.length ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Failed to verify signatures",
        description: "An error occurred during verification",
        variant: "destructive"
      });
    } finally {
      setVerifying(false);
    }
  };

  if (!docData) return null;

  return (
    <>
      <Header showBack />
      <div className="container mx-auto p-4 space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{docData.name}</CardTitle>
            <div className="flex flex-wrap gap-2">
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
              {signatures.length > 0 && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleVerifySignatures}
                  disabled={verifying}
                >
                  <Shield className="h-4 w-4" />
                  {verifying ? "Verifying..." : "Verify Signatures"}
                </Button>
              )}
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
              <div className="mb-4 p-4 border rounded-lg bg-muted/30">
                <h3 className="font-medium mb-2">Signatures:</h3>
                <div className="grid gap-2">
                  {signatures.map((sig) => (
                    <div key={sig.id} className="text-sm text-muted-foreground break-all flex items-start gap-2">
                      <div className="mt-1">
                        {verificationStatus[sig.id] !== undefined && (
                          verificationStatus[sig.id] ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Signer:</span> {sig.signerAddress}
                        <br />
                        <span className="font-medium">Time:</span> {new Date(sig.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="border rounded-lg p-4 bg-muted/50">
              <div data-color-mode="light">
                <MDEditor.Markdown source={docData.content} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}