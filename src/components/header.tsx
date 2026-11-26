import React from "react";
import { ArrowLeft, Download, Share } from "lucide-react";
import { Button } from "./ui/button";
import { Spinner } from "./ui/spinner";

interface HeaderProps {
  retake: () => void;
  download: () => void;
  downloadDisabled?: boolean;
  share: () => void;
  shareDisabled?: boolean;
  isDownloading?: boolean;
  isUploading?: boolean;
}

export default function Header({
  retake,
  download,
  downloadDisabled = false,
  share,
  shareDisabled = false,
  isDownloading = false,
  isUploading = false,
}: HeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          className="flex h-8 w-8 items-center justify-center rounded-full p-0 font-bold"
          variant="ghost"
          size="icon"
          onClick={retake}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Retake</span>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Button
          className="flex h-8 w-8 items-center justify-center rounded-full p-0 font-bold"
          size="icon"
          onClick={download}
          disabled={downloadDisabled}
        >
          {isDownloading ? (
            <Spinner className="h-5 w-5" />
          ) : (
            <Download className="h-5 w-5" />
          )}
          <span className="sr-only">Download</span>
        </Button>
        <Button
          className="flex h-8 w-8 items-center justify-center rounded-full p-0 font-bold"
          variant="ghost"
          size="icon"
          onClick={share}
          disabled={shareDisabled}
        >
          {isUploading ? (
            <Spinner className="h-5 w-5" />
          ) : (
            <Share className="h-5 w-5" />
          )}
          <span className="sr-only">Share</span>
        </Button>
      </div>
    </div>
  );
}
