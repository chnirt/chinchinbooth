"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SupportedLocale } from "@/constants/languages";
import { useTransition } from "react";
import { Locale } from "@/i18n/config";
import { setUserLocale } from "@/services/locale";
import { CheckIcon, LanguagesIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocaleSwitcherSelectProps {
  defaultValue: SupportedLocale;
  items: Array<{ value: SupportedLocale; label: string }>;
}

export default function LocaleSwitcherSelect({
  defaultValue,
  items,
}: LocaleSwitcherSelectProps) {
  const [isPending, startTransition] = useTransition();

  function onChange(value: string) {
    const locale = value as Locale;
    startTransition(() => {
      setUserLocale(locale);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isPending}>
        <LanguagesIcon className="h-5 w-5 text-slate-600 transition-colors group-hover:text-slate-900" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-40 min-w-0">
        {items.map((item) => (
          <DropdownMenuItem
            key={item.value}
            className={cn(
              "flex items-center gap-2 text-sm",
              defaultValue === item.value && "bg-muted font-medium",
            )}
            onSelect={() => onChange(item.value)}
          >
            <span className="text-base">{item.label}</span>
            {defaultValue === item.value && (
              <CheckIcon className="text-primary h-5 w-5" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
