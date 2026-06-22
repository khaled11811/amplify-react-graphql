"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { CategoryNode } from "@/lib/categories";
import { t, type Lang } from "@/lib/i18n/translations";

function findPath(nodes: CategoryNode[], slug: string): CategoryNode[] {
  for (const node of nodes) {
    if (node.slug === slug) return [node];
    const childPath = findPath(node.children, slug);
    if (childPath.length) return [node, ...childPath];
  }
  return [];
}

function findNodeById(nodes: CategoryNode[], id: string): CategoryNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNodeById(node.children, id);
    if (found) return found;
  }
  return null;
}

export function CategoryDropdown({
  slug,
  categories,
  currentCategory,
  currentQ,
  lang,
}: {
  slug: string;
  categories: CategoryNode[];
  currentCategory: string | undefined;
  currentQ: string | undefined;
  lang: Lang;
}) {
  const router = useRouter();

  const [selections, setSelections] = useState<string[]>(() => {
    if (!currentCategory) return [""];
    return findPath(categories, currentCategory).map((n) => n.id);
  });

  useEffect(() => {
    if (!currentCategory) { setSelections([""]); return; }
    const path = findPath(categories, currentCategory);
    setSelections(path.length ? path.map((n) => n.id) : [""]);
  }, [currentCategory, categories]);

  function navigate(categorySlug: string | null) {
    const q = currentQ ? `&q=${encodeURIComponent(currentQ)}` : "";
    if (!categorySlug) {
      router.push(`/store/${slug}${currentQ ? `?q=${encodeURIComponent(currentQ)}` : ""}`);
    } else {
      router.push(`/store/${slug}?category=${categorySlug}${q}`);
    }
  }

  function handleChange(level: number, selectedId: string) {
    const newSelections = selections.slice(0, level);
    newSelections.push(selectedId);
    setSelections(newSelections);

    if (!selectedId) {
      if (level === 0) {
        navigate(null);
      } else {
        const parentNode = findNodeById(categories, newSelections[level - 1]);
        navigate(parentNode?.slug ?? null);
      }
      return;
    }

    const node = findNodeById(categories, selectedId);
    navigate(node?.slug ?? null);
  }

  const levels: CategoryNode[][] = [categories];
  for (let i = 0; i < selections.length; i++) {
    if (!selections[i]) break;
    const node = findNodeById(categories, selections[i]);
    if (node && node.children.length > 0) {
      levels.push(node.children);
    } else {
      break;
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {levels.map((levelCategories, level) => (
        <select
          key={level}
          value={selections[level] ?? ""}
          onChange={(e) => handleChange(level, e.target.value)}
          className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm focus:outline-2 focus:outline-[var(--store-primary)]"
        >
          <option value="">{level === 0 ? t(lang, "all_categories_option") : t(lang, "all_subcategories_option")}</option>
          {levelCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
