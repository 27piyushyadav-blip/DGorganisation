"use client";

import { useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, QrCode, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const CLIENT_BASE = process.env.NEXT_PUBLIC_CLIENT_URL;

interface QRCodeCardProps {
  orgId: string;
  orgName: string;
  logoUrl?: string;
}

export default function QRCodeCard({ orgId, orgName, logoUrl }: QRCodeCardProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const profileUrl = `${CLIENT_BASE}/main/specific/${orgId}`;

  const handleDownload = useCallback(() => {
    if (!qrRef.current) return;

    const svgElement = qrRef.current.querySelector("svg");
    if (!svgElement) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High-res export (4x for crisp prints)
    const scale = 4;
    const size = 256 * scale;
    canvas.width = size;
    canvas.height = size + 80 * scale; // Extra space for org name

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw QR code
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);

      // Draw org name below QR
      ctx.fillStyle = "#18181b";
      ctx.font = `bold ${14 * scale}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(
        orgName.length > 30 ? orgName.substring(0, 30) + "…" : orgName,
        size / 2,
        size + 30 * scale
      );

      // Draw "Scan to visit" text
      ctx.fillStyle = "#71717a";
      ctx.font = `${10 * scale}px sans-serif`;
      ctx.fillText("Scan to visit our page", size / 2, size + 55 * scale);

      // Download
      const link = document.createElement("a");
      link.download = `${orgName.replace(/[^a-zA-Z0-9]/g, "_")}_QR_Code.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast.success("QR Code downloaded successfully!");
    };
    img.src = url;
  }, [orgName, orgId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <QrCode className="h-5 w-5" />
          <span>QR Code</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col items-center space-y-4">
        {/* QR Code */}
        <div
          ref={qrRef}
          className="bg-white p-4 rounded-xl border shadow-sm"
        >
          <QRCodeSVG
            value={profileUrl}
            size={180}
            level="H"
            includeMargin={false}
            imageSettings={
              logoUrl
                ? {
                    src: logoUrl,
                    x: undefined,
                    y: undefined,
                    height: 36,
                    width: 36,
                    excavate: true,
                  }
                : undefined
            }
          />
        </div>

        {/* Org name label */}
        <p className="text-xs text-muted-foreground text-center font-medium truncate max-w-full">
          {orgName}
        </p>

        {/* URL preview */}
        <p className="text-[10px] text-muted-foreground text-center break-all leading-relaxed px-2">
          {profileUrl}
        </p>

        {/* Actions */}
        <div className="w-full space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleDownload}
          >
            <Download className="mr-2 h-4 w-4" />
            Download QR Code
          </Button>

          <Button
            variant="ghost"
            className="w-full text-xs"
            onClick={() => {
              window.open(profileUrl, "_blank");
            }}
          >
            <ExternalLink className="mr-2 h-3 w-3" />
            Open Profile Page
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
