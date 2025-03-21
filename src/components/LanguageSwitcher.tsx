import { useLocale, useTranslations } from "next-intl";
import LocaleSwitcherSelect from "./LocaleSwitcherSelect";

export default function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();

  return (
    <LocaleSwitcherSelect
      defaultValue={locale}
      items={[
        { value: "en", label: "🇬🇧" },
        { value: "vi", label: "🇻🇳" },
        { value: "th", label: "🇹🇭" },
        { value: "km", label: "🇰🇭" },
      ]}
      label={t("label")}
    />
  );
}
