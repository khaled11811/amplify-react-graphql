import type { Category } from "@/types/database.types";

export type CategoryNode = Category & { depth: number; children: CategoryNode[] };

export function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const nodes = new Map<string, CategoryNode>();
  for (const category of categories) {
    nodes.set(category.id, { ...category, depth: 0, children: [] });
  }

  const roots: CategoryNode[] = [];
  for (const node of nodes.values()) {
    if (node.parent_id && nodes.has(node.parent_id)) {
      nodes.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  function assignDepth(node: CategoryNode, depth: number) {
    node.depth = depth;
    for (const child of node.children) assignDepth(child, depth + 1);
  }
  for (const root of roots) assignDepth(root, 0);

  return roots;
}

export function flattenCategoryTree(nodes: CategoryNode[]): CategoryNode[] {
  const result: CategoryNode[] = [];
  for (const node of nodes) {
    result.push(node);
    result.push(...flattenCategoryTree(node.children));
  }
  return result;
}

export function collectDescendantIds(categories: Pick<Category, "id" | "parent_id">[], rootId: string): string[] {
  const childrenOf = new Map<string, string[]>();
  for (const c of categories) {
    if (c.parent_id) {
      if (!childrenOf.has(c.parent_id)) childrenOf.set(c.parent_id, []);
      childrenOf.get(c.parent_id)!.push(c.id);
    }
  }
  const ids: string[] = [rootId];
  const queue = [rootId];
  while (queue.length) {
    const id = queue.shift()!;
    for (const childId of childrenOf.get(id) ?? []) {
      ids.push(childId);
      queue.push(childId);
    }
  }
  return ids;
}
