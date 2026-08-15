"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_TITLE = 120;
const MAX_BODY = 4000;

async function requireArtist() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/manage/knowledge");
  if (user.role !== "ARTIST") redirect("/");
  return user;
}

function refresh() {
  revalidatePath("/manage/knowledge");
}

export async function createKnowledgeAction(formData: FormData) {
  await requireArtist();
  const title = String(formData.get("title") ?? "").trim().slice(0, MAX_TITLE);
  const body = String(formData.get("body") ?? "").trim().slice(0, MAX_BODY);
  if (!title || !body) return;

  // New notes go last; the artist reorders with the up control.
  const last = await prisma.knowledgeEntry.findFirst({
    orderBy: { order: "desc" },
    select: { order: true },
  });

  await prisma.knowledgeEntry.create({
    data: { title, body, order: (last?.order ?? 0) + 1 },
  });
  refresh();
}

export async function updateKnowledgeAction(formData: FormData) {
  await requireArtist();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim().slice(0, MAX_TITLE);
  const body = String(formData.get("body") ?? "").trim().slice(0, MAX_BODY);
  if (!id || !title || !body) return;

  await prisma.knowledgeEntry.updateMany({
    where: { id },
    data: { title, body },
  });
  refresh();
}

/** Unpublishing keeps the wording around for a fact that is only wrong this
 * season — the assistant simply stops being told about it. */
export async function toggleKnowledgeAction(formData: FormData) {
  await requireArtist();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const entry = await prisma.knowledgeEntry.findUnique({ where: { id } });
  if (!entry) return;

  await prisma.knowledgeEntry.update({
    where: { id },
    data: { enabled: !entry.enabled },
  });
  refresh();
}

export async function deleteKnowledgeAction(formData: FormData) {
  await requireArtist();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.knowledgeEntry.deleteMany({ where: { id } });
  refresh();
}

/** Swaps a note with the one above it. Order decides the sequence the facts
 * reach the model, so the artist can put the things clients ask most first. */
export async function moveKnowledgeUpAction(formData: FormData) {
  await requireArtist();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const entry = await prisma.knowledgeEntry.findUnique({ where: { id } });
  if (!entry) return;

  const above = await prisma.knowledgeEntry.findFirst({
    where: { order: { lt: entry.order } },
    orderBy: { order: "desc" },
  });
  if (!above) return;

  await prisma.$transaction([
    prisma.knowledgeEntry.update({
      where: { id: entry.id },
      data: { order: above.order },
    }),
    prisma.knowledgeEntry.update({
      where: { id: above.id },
      data: { order: entry.order },
    }),
  ]);
  refresh();
}
