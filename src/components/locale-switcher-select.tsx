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
import { Button } from "./ui/button";

interface LocaleSwitcherSelectProps {
  defaultValue: SupportedLocale;
  items: Array<{ value: SupportedLocale; label: string; flag: string }>;
}

export default function LocaleSwitcherSelect({
  defaultValue,
  items,
}: LocaleSwitcherSelectProps) {
  const [isPending, startTransition] = useTransition();

  const current = items.find((item) => item.value === defaultValue) ?? items[0];

  function onChange(value: SupportedLocale) {
    const locale = value as Locale;
    startTransition(async () => {
      await setUserLocale(locale);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={isPending}>
        <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer rounded-full text-gray-700 transition-colors hover:bg-transparent"
          aria-label={`Language Selection: ${current?.label ?? ""}`}
        >
          <LanguagesIcon
            aria-hidden="true"
            className="h-5 w-5 cursor-pointer text-slate-600 transition-colors group-hover:text-slate-900"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        collisionPadding={12}
        className="z-40 w-52 max-w-[calc(100vw-1.5rem)]"
      >
        {items.map((item) => {
          const isSelected = defaultValue === item.value;

          return (
            <DropdownMenuItem
              key={item.value}
              className={cn(
                "flex items-center gap-2 text-sm",
                isSelected && "bg-accent font-medium",
              )}
              aria-current={isSelected ? "true" : undefined}
              textValue={item.label}
              onSelect={() => onChange(item.value)}
            >
              <span
                aria-hidden="true"
                className="grid size-4 shrink-0 place-items-center leading-none"
              >
                {item.flag}
              </span>
              <span className="min-w-0 flex-1 truncate" title={item.label}>
                {item.label}
              </span>
              {isSelected && (
                <CheckIcon aria-hidden="true" className="text-primary size-4" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
