"use client";

import { Check, Copy, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const contactEmail = "trinhchinchin@gmail.com";

export default function PolicyDialog() {
  const t = useTranslations("HomePage");

  const [open, setOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<
    "copied" | "copy_email_failed" | null
  >(null);

  useEffect(() => {
    if (!open || copyStatus !== "copied") return;

    const timer = setTimeout(() => setCopyStatus(null), 2000);
    return () => clearTimeout(timer);
  }, [copyStatus, open]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) setCopyStatus(null);
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(contactEmail);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("copy_email_failed");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer rounded-full text-gray-700 transition-colors hover:bg-transparent"
        >
          <Shield className="h-5 w-5 cursor-pointer text-slate-600 transition-colors group-hover:text-slate-900" />
          <span className="sr-only">Privacy Policy</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        appearance="plain"
        className="max-h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden rounded-xl border-0 p-0 shadow-xl sm:max-w-[550px] md:max-w-[650px] lg:max-w-[750px]"
      >
        {/* Header with gradient matching the app's style */}
        <div className="border-b">
          <DialogHeader className="px-5 pt-5 pr-12 pb-4 text-left sm:pl-6">
            <DialogTitle className="text-primary flex items-center text-xl font-bold">
              <Shield className="text-primary mr-2 h-5 w-5" />
              {t("privacyPolicyTitle")}
            </DialogTitle>
            <DialogDescription className="mt-1 text-sm text-gray-600">
              {t("yourPrivacyPriority")}
            </DialogDescription>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[70dvh] min-h-0">
          <div className="space-y-6 px-5 py-5 sm:px-6">
            {/* Main commitment statement */}
            <div className="rounded-lg border border-rose-100 bg-gradient-to-r from-rose-50 to-teal-50 p-4">
              <p className="text-primary text-base font-medium">
                {t("commitmentStatement")}
              </p>
            </div>

            {/* No Data Collection Policy */}
            <div className="space-y-3">
              <h3 className="flex items-center text-base font-semibold text-gray-800">
                <span className="mr-2 inline-block h-5 w-1.5 rounded-full bg-pink-500"></span>
                {t("noDataCollectionPolicy")}
              </h3>
              <div className="space-y-2 pl-4">
                <p className="text-sm text-gray-600">
                  {t("noDataCollectionPolicyDescription")}
                </p>
                <ul className="list-disc space-y-1.5 pl-5">
                  <li className="text-sm text-gray-600">
                    {t("noDataCollectionPolicy1")}
                  </li>
                  <li className="text-sm text-gray-600">
                    {t("noDataCollectionPolicy2")}
                  </li>
                  <li className="text-sm text-gray-600">
                    {t("noDataCollectionPolicy3")}
                  </li>
                  <li className="text-sm text-gray-600">
                    {t("noDataCollectionPolicy4")}
                  </li>
                  <li className="text-sm text-gray-600">
                    {t("noDataCollectionPolicy5")}
                  </li>
                </ul>
              </div>
            </div>

            {/* Photo Privacy */}
            <div className="space-y-3">
              <h3 className="flex items-center text-base font-semibold text-gray-800">
                <span className="mr-2 inline-block h-5 w-1.5 rounded-full bg-teal-400"></span>
                {t("photoPrivacy")}
              </h3>
              <div className="space-y-2 pl-4">
                <p className="text-sm text-gray-600">
                  {t("photoPrivacyDescription")}
                </p>
                <ul className="list-disc space-y-1.5 pl-5">
                  <li className="text-sm text-gray-600">
                    {t("photoPrivacy1")}
                  </li>
                  <li className="text-sm text-gray-600">
                    {t("photoPrivacy2")}
                  </li>
                  <li className="text-sm text-gray-600">
                    {t("photoPrivacy3")}
                  </li>
                  <li className="text-sm text-gray-600">
                    {t("photoPrivacy4")}
                  </li>
                </ul>
              </div>
            </div>

            {/* Our Technology */}
            <div className="space-y-3">
              <h3 className="flex items-center text-base font-semibold text-gray-800">
                <span className="mr-2 inline-block h-5 w-1.5 rounded-full bg-rose-400"></span>
                {t("ourTechnology")}
              </h3>
              <div className="space-y-2 pl-4">
                <p className="text-sm text-gray-600">
                  {t("ourTechnologyDescription")}
                </p>
                <ul className="list-disc space-y-1.5 pl-5">
                  <li className="text-sm text-gray-600">
                    {t("ourTechnology1")}
                  </li>
                  <li className="text-sm text-gray-600">
                    {t("ourTechnology2")}
                  </li>
                  <li className="text-sm text-gray-600">
                    {t("ourTechnology3")}
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mt-8 rounded-lg border border-gray-100 bg-gray-50 p-4">
              <h3 className="mb-2 text-base font-semibold text-gray-800">
                {t("contactUs")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("contactUsDescription")}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-primary inline-flex min-w-0 items-center gap-2 rounded-sm text-sm font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <Mail aria-hidden="true" className="size-4 shrink-0" />
                  <span className="break-all">{contactEmail}</span>
                </a>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-8"
                  aria-label={t("copy_email")}
                  title={t("copy_email")}
                  onClick={copyEmail}
                >
                  {copyStatus === "copied" ? (
                    <Check aria-hidden="true" className="text-emerald-700" />
                  ) : (
                    <Copy aria-hidden="true" />
                  )}
                </Button>
              </div>
              <p
                role="status"
                className={
                  copyStatus === "copy_email_failed"
                    ? "mt-1 text-sm text-gray-600"
                    : "sr-only"
                }
              >
                {copyStatus && t(copyStatus)}
              </p>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="rounded-b-xl border-t bg-gray-50 px-6 py-4">
          <Button onClick={() => setOpen(false)}>{t("closeButton")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
