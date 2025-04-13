import { useTranslations } from "next-intl";
import React from "react";
import { motion } from "framer-motion";

export default function Footer() {
  const t = useTranslations("HomePage");

  return (
    <motion.footer
      className="py-4 text-center text-sm text-gray-500"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      © {new Date().getFullYear()} @chinchinbooth. {t("all_rights_reserved")}
      .
      <br />
      <span className="text-xs">
        {t("version")}: {process.env.NEXT_PUBLIC_APP_VERSION}
      </span>
    </motion.footer>
  );
}
