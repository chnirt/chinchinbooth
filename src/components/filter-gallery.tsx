"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Ban, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { FilterValues } from "@/types/filters";
import { FILTER_COLLECTIONS } from "@/constants/filters";

// Generate filter style string from filter values
export const generateFilterStyle = (filter: FilterValues) => {
  return `brightness(${filter.brightness}%) contrast(${filter.contrast}%) grayscale(${filter.grayscale}%) sepia(${filter.sepia}%) saturate(${filter.saturate}%) hue-rotate(${filter.hueRotate}deg)`;
};

interface FilterGalleryProps {
  onFilterChange: (filter: FilterValues) => void;
  currentFilter: FilterValues;
  sampleImageUrl?: string;
  className?: string;
}

export function FilterGallery({
  onFilterChange,
  currentFilter,
  sampleImageUrl = "/placeholder.jpg",
  className,
}: FilterGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<string>("normal");
  const categoriesContainerRef = useRef<HTMLDivElement>(null);
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Find the current filter in collections
  const getCurrentFilterId = useCallback(() => {
    for (const category in FILTER_COLLECTIONS) {
      const filters =
        FILTER_COLLECTIONS[category as keyof typeof FILTER_COLLECTIONS];
      for (const filter of filters) {
        if (JSON.stringify(filter.filter) === JSON.stringify(currentFilter)) {
          return filter.id;
        }
      }
    }
    return "normal";
  }, [currentFilter]);

  const currentFilterId = getCurrentFilterId();

  // Get all categories
  const categories = Object.keys(FILTER_COLLECTIONS);

  // Add a function to find the category of a filter
  const findFilterCategory = (filterId: string): string => {
    for (const category in FILTER_COLLECTIONS) {
      const filters =
        FILTER_COLLECTIONS[category as keyof typeof FILTER_COLLECTIONS];
      if (filters.some((filter) => filter.id === filterId)) {
        return category;
      }
    }
    return "normal";
  };

  // Handle category change - scroll to the category section
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);

    // Scroll to the category section
    if (categoryRefs.current[category]) {
      categoryRefs.current[category]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    }

    // Highlight the first filter in the category if not already selected
    const firstFilter =
      FILTER_COLLECTIONS[category as keyof typeof FILTER_COLLECTIONS]?.[0];
    if (firstFilter && firstFilter.id !== currentFilterId) {
      onFilterChange(firstFilter.filter);
    }
  };

  // Handle normal filter selection
  const handleNormalClick = () => {
    handleCategoryChange("normal");
  };

  // Scroll to center the active category button
  useEffect(() => {
    if (categoriesContainerRef.current) {
      const container = categoriesContainerRef.current;
      const activeButton = container.querySelector(
        `[data-category="${activeCategory}"]`,
      ) as HTMLElement;

      if (activeButton && activeCategory !== "normal") {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();

        // Calculate the scroll position to center the button
        const scrollLeft =
          buttonRect.left -
          containerRect.left -
          containerRect.width / 2 +
          buttonRect.width / 2;

        container.scrollTo({
          left: container.scrollLeft + scrollLeft,
          behavior: "smooth",
        });
      } else {
        container.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      }
    }
  }, [activeCategory]);

  // Update the useEffect to track changes to currentFilter and update activeCategory
  useEffect(() => {
    const currentId = getCurrentFilterId();
    const category = findFilterCategory(currentId);

    if (category !== activeCategory) {
      setActiveCategory(category);
    }
  }, [currentFilter, activeCategory, getCurrentFilterId]);

  return (
    <div className={cn("w-full", className)}>
      {/* Category navigation with fixed Normal button */}
      <div className="mb-3 flex items-center gap-1">
        {/* Fixed Normal button */}
        <div>
          <Button
            onClick={handleNormalClick}
            variant="ghost"
            size="icon"
            aria-pressed={activeCategory === "normal"}
            className="text-muted-foreground aria-pressed:border-primary/25 aria-pressed:bg-accent aria-pressed:text-primary size-8 rounded-full border border-transparent"
          >
            <Ban className="h-3 w-3" />
            <span className="sr-only">Normal Filter</span>
          </Button>
        </div>

        {/* Scrollable categories */}
        <div
          ref={categoriesContainerRef}
          className="hide-scrollbar flex min-w-0 gap-1 overflow-x-auto"
        >
          {categories
            .filter((cat) => cat !== "normal")
            .map((category) => (
              <Button
                key={category}
                data-category={category}
                onClick={() => handleCategoryChange(category)}
                variant="ghost"
                size="sm"
                aria-pressed={activeCategory === category}
                className="text-muted-foreground aria-pressed:border-primary/25 aria-pressed:bg-accent aria-pressed:text-primary rounded-full border border-transparent px-3 text-xs capitalize aria-pressed:font-semibold"
              >
                {category}
              </Button>
            ))}
        </div>
      </div>

      {/* All filters in a single scrollable container */}
      <div className="hide-scrollbar overflow-x-auto pb-2">
        <div className="flex w-max">
          {/* Render all categories and their filters */}
          {categories.map((category) => {
            const filters =
              FILTER_COLLECTIONS[category as keyof typeof FILTER_COLLECTIONS];

            return (
              <div
                key={category}
                ref={(el) => {
                  categoryRefs.current[category] = el;
                }}
                className={cn(
                  "flex-shrink-0",
                  category !== "normal" && "ml-2 pl-2",
                )}
              >
                {/* Filters in this category */}
                <div className="flex gap-0.5">
                  {filters.map((filter) => {
                    const isSelected = currentFilterId === filter.id;

                    return (
                      <button
                        key={filter.id}
                        type="button"
                        data-filter-id={filter.id}
                        aria-pressed={isSelected}
                        className="focus-visible:outline-ring relative mb-1 aspect-[3/4] w-16 shrink-0 cursor-pointer overflow-hidden text-center focus-visible:outline-2 focus-visible:-outline-offset-2 sm:w-20"
                        onClick={() => onFilterChange(filter.filter)}
                      >
                        <img
                          src={sampleImageUrl}
                          alt=""
                          loading="eager"
                          className={cn(
                            "absolute inset-0 block h-full w-full object-cover",
                            !isSelected && "opacity-80",
                          )}
                          style={{
                            filter: generateFilterStyle(filter.filter),
                          }}
                          crossOrigin="anonymous"
                        />
                        {isSelected && (
                          <span className="bg-primary/10 pointer-events-none absolute inset-0 grid place-items-center">
                            <span className="bg-primary text-primary-foreground grid size-5 place-items-center rounded-full">
                              <Check aria-hidden="true" className="size-3" />
                            </span>
                          </span>
                        )}
                        <span className="bg-primary/75 absolute inset-x-0 bottom-0 px-0.5 text-xs leading-4 font-medium [overflow-wrap:anywhere] text-white">
                          {filter.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
