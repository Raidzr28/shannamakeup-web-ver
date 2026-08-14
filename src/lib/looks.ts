import { prisma } from "./prisma";
import type { Look } from "@prisma/client";

export type LookDTO = {
  id: string;
  order: number;
  title: string;
  titleId: string;
  category: string;
  categoryId: string;
  priceIdr: number;
  durationLabel: string;
  blurb: string;
  blurbId: string;
  includes: string[];
  includesId: string[];
  heroImage: string | null;
};

function parseLook(row: Look): LookDTO {
  return {
    ...row,
    includes: JSON.parse(row.includes),
    includesId: JSON.parse(row.includesId),
  };
}

export async function getLooks(): Promise<LookDTO[]> {
  const rows = await prisma.look.findMany({ orderBy: { order: "asc" } });
  return rows.map(parseLook);
}

export async function getLook(id: string): Promise<LookDTO | null> {
  const row = await prisma.look.findUnique({ where: { id } });
  return row ? parseLook(row) : null;
}
