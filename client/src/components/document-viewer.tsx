import { useState, useRef } from "react";
import { Document as PDFDocument, Page } from "react-pdf";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

interface DocumentViewerProps {
  documentUrl: string;
  onSignaturePosition?: (position: { x: number; y: number; page: number }) => void;
}

export function DocumentViewer({ documentUrl, onSignaturePosition }: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!onSignaturePosition || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    onSignaturePosition({ x, y, page: pageNumber - 1 });
  }

  return (
    <Card className="p-4">
      <div className="flex justify-between mb-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="flex items-center">
            Page {pageNumber} of {numPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
            disabled={pageNumber >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setScale(scale - 0.1)}
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setScale(scale + 0.1)}
            disabled={scale >= 2}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div 
        ref={containerRef}
        onClick={handleClick}
        className="overflow-auto border rounded-lg"
      >
        <PDFDocument
          file={documentUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          className="mx-auto"
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </PDFDocument>
      </div>
    </Card>
  );
}
