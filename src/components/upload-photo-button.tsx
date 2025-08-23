import React, { useRef, ChangeEvent } from "react";
import { Button } from "./ui/button";
import { ImagePlus } from "lucide-react";

interface UploadPhotoButtonProps {
  onImageUpload: (imageData: string | ArrayBuffer | null) => void;
  disabled?: boolean | undefined;
}

export default function UploadPhotoButton({
  onImageUpload,
  disabled,
}: UploadPhotoButtonProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click(); // mở hộp thoại chọn file
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result;
        if (imageData !== undefined) {
          onImageUpload(imageData);
        }
      };
      reader.readAsDataURL(file); // đọc file thành base64
    }
  };

  return (
    <>
      <Button
        onClick={handleButtonClick}
        className="flex h-10 w-10 items-center justify-center rounded-full p-0"
        variant="outline"
        size="icon"
        disabled={disabled}
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
      />
    </>
  );
}
