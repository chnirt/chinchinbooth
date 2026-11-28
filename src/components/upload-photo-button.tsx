import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Button } from "./ui/button";
import { ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface UploadPhotoButtonProps {
  onImageUpload: (imageData: string[]) => void;
  disabled?: boolean | undefined;
  maxFiles: number;
}

export default function UploadPhotoButton({
  onImageUpload,
  disabled,
  maxFiles,
}: UploadPhotoButtonProps) {
  const t = useTranslations("HomePage");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const activeReader = useRef<FileReader | null>(null);
  const [isReading, setIsReading] = useState(false);

  useEffect(() => {
    return () => {
      const reader = activeReader.current;
      activeReader.current = null;
      reader?.abort();
    };
  }, []);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (!files.length || disabled || activeReader.current) return;

    if (maxFiles <= 0) {
      toast(t("uploadLimitNotSet"));
      return;
    }

    if (files.length > maxFiles) {
      toast(
        t("uploadMaxFiles", {
          maxFiles,
          fileLabel: maxFiles === 1 ? t("fileLabel_one") : t("fileLabel_other"),
        }),
      );
      return;
    }

    const reader = new FileReader();
    activeReader.current = reader;
    setIsReading(true);
    try {
      const images: string[] = [];
      for (const file of files) {
        const image = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            if (typeof reader.result === "string") resolve(reader.result);
            else reject(new Error(file.name));
          };
          reader.onerror = () => reject(new Error(file.name));
          reader.onabort = () => reject(new Error(file.name));
          reader.readAsDataURL(file);
        });
        if (activeReader.current !== reader) return;
        images.push(image);
      }
      onImageUpload(images);
    } catch (error) {
      if (activeReader.current === reader) {
        const fileName = error instanceof Error ? error.message : "";
        toast(`Failed to read file: ${fileName}`);
      }
    } finally {
      if (activeReader.current === reader) {
        activeReader.current = null;
        setIsReading(false);
      }
    }
  };

  return (
    <>
      <Button
        onClick={() => fileInputRef.current?.click()}
        className="size-10 rounded-full"
        variant="outline"
        size="icon"
        disabled={disabled || isReading}
      >
        <ImagePlus className="h-4 w-4" />
        <span className="sr-only">Upload photo</span>
      </Button>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
      />
    </>
  );
}
