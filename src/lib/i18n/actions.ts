"use server";

import { cookies } from "next/headers";
import type { Lang } from "./translations";

export async function setLanguage(lang: Lang) {
  const jar = await cookies();
  jar.set("lang", lang, { path: "/", maxAge: 60 * 60 * 24 * 365 });
}
