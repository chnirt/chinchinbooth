import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeCanvas } from "qrcode.react";
import { Smartphone, Download, Copy, Check, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
  copied: boolean;
  copyToClipboard: () => void;
  shareUrl: () => void;
}

export default function ShareDialog({
  open,
  onOpenChange,
  imageUrl,
  copied,
  copyToClipboard,
  shareUrl,
}: ShareDialogProps) {
  const t = useTranslations("HomePage");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        appearance="plain"
        className="max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden rounded-xl border-0 p-0 shadow-xl sm:max-w-[550px] md:max-w-[650px] lg:max-w-[750px]"
      >
        <div className="border-b">
          <DialogHeader className="px-5 pt-5 pr-12 pb-4 text-left sm:pl-6">
            <DialogTitle className="text-primary flex items-center text-xl font-bold">
              <Share2 aria-hidden="true" className="text-primary mr-2 h-5 w-5" />
              {t("share_title")}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-gray-600">
              {t("scan_content")}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-6">
          {imageUrl && (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <Smartphone aria-hidden="true" className="text-primary h-5 w-5" />
                <h3 className="text-base font-medium text-gray-800">
                  {t("scan_to_view_on_mobile")}
                </h3>
              </div>
              <div className="max-w-full rounded-lg border border-gray-200 bg-white p-4">
                <QRCodeCanvas
                  value={imageUrl}
                  size={200}
                  level="H"
                  marginSize={4}
                  className="h-auto max-w-full"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-row flex-wrap justify-end rounded-b-xl border-t bg-gray-50 px-5 py-4 sm:px-6">
          <Button
            variant="outline"
            onClick={
              imageUrl ? () => window.open(imageUrl, "_blank") : undefined
            }
          >
            <Download className="mr-1 h-3 w-3" />
            {t("open_link")}
          </Button>
          <Button variant="outline" onClick={copyToClipboard}>
            {copied ? (
              <Check className="mr-1 h-3 w-3" />
            ) : (
              <Copy className="mr-1 h-3 w-3" />
            )}
            {copied ? `${t("copied")}!` : t("copy_link")}
          </Button>
          {typeof window !== "undefined" &&
            navigator &&
            typeof navigator.share === "function" && (
              <Button variant="outline" onClick={shareUrl}>
                <Share2 className="mr-1 h-3 w-3" />
                {t("share")}
              </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
