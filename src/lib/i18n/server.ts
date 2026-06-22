import { cookies } from "next/headers";
import type { Lang } from "./translations";

export async function getLang(): Promise<Lang> {
  const jar = await cookies();
  const val = jar.get("lang")?.value;
  return val === "ar" ? "ar" : "en";
}
