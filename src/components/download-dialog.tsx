// components/DownloadDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";

interface DownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageDataUrl: string | null;
  layoutType?: number;
}

export default function DownloadDialog({
  open,
  onOpenChange,
  imageDataUrl,
  layoutType = 4,
}: DownloadDialogProps) {
  const t = useTranslations("HomePage");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl border-0 p-0 shadow-xl sm:max-w-[550px] md:max-w-[650px] lg:max-w-[750px]">
        <div className="border-b">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle>{t("save_image")}</DialogTitle>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[80vh] md:max-h-[90vh]">
          <div className="space-y-6 px-6 py-5">
            <Image
              src={imageDataUrl || ""}
              alt="Generated image"
              className={cn(
                "mx-auto overflow-hidden rounded-md border border-gray-200 shadow-md",
                layoutType === 4 ? "aspect-[1/3] w-1/2" : "aspect-[2/3] w-full",
              )}
            />
            <div className="mt-6 rounded-lg border border-amber-100 bg-amber-50 p-4 text-center">
              <h4 className="mb-2 font-medium text-amber-800">
                {t("save_instructions_title")}:
              </h4>
              <ol className="list-decimal space-y-2 pl-5 text-left text-sm text-amber-700">
                <li>{t("save_step_1")}</li>
                <li>{t("save_step_2")}</li>
                <li>{t("save_step_3")}</li>
              </ol>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="rounded-b-xl border-t bg-gray-50 px-6 py-4">
          <Button onClick={() => onOpenChange(false)}>
            {t("closeButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
