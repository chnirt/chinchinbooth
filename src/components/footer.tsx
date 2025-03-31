import { useTranslations } from "next-intl";
import React from "react";

export default function Footer() {
  const t = useTranslations("HomePage");

  return (
    <footer className="py-4 text-center text-sm text-gray-500">
      © {new Date().getFullYear()} @chinchinbooth. {t("all_rights_reserved")}.
      <br />
      <span className="text-xs">
        {t("version")}: {process.env.NEXT_PUBLIC_APP_VERSION}
      </span>
    </footer>
  );
}
