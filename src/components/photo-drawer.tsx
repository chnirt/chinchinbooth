"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "./ui/drawer";
import { Button } from "./ui/button";
import { useTranslations } from "next-intl";

interface PhotoDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layoutType: number;
  capturedImages: string[];
  selectedIndices: number[];
  toggleSelect: (idx: number) => void;
}

export function PhotoDrawer({
  open,
  onOpenChange,
  layoutType,
  capturedImages,
  selectedIndices,
  toggleSelect,
}: PhotoDrawerProps) {
  const t = useTranslations("HomePage");

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{t("select_photo")}</DrawerTitle>
          <DrawerDescription>
            {t("select_prompt", {
              count: layoutType,
              selectedCount: selectedIndices.length,
            })}
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-gray-200 bg-white p-2 sm:grid-cols-3 overflow-y-auto max-h-80">
            {capturedImages.map((img, index) => {
              const isSelected = selectedIndices.includes(index);
              const selectionIndex = selectedIndices.indexOf(index) + 1;

              return (
                <motion.div
                  key={index}
                  onClick={() => toggleSelect(index)}
                  className={cn(
                    "relative aspect-[4/3] cursor-pointer overflow-hidden rounded-lg border-2 transition-all duration-200",
                    isSelected ? "border-primary z-10" : "border-gray-200",
                  )}
                  whileTap={{ scale: 0.98 }}
                >
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`Photo ${index}`}
                    className="h-full w-full object-cover"
                  />
                  {isSelected && (
                    <div className="bg-primary text-primary-foreground absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold">
                      {selectionIndex}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">{t("closeButton")}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
