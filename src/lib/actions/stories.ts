"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Not exported: a "use server" file may only export async functions, and a
// plain value here makes Next throw on module load, before any action runs.
const STORY_LIFETIME_MS = 24 * 60 * 60 * 1000;

const MAX_CAPTION = 280;

export async function createStoryAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user)
    redirect(
      `/login?next=${encodeURIComponent("/looks/story")}&reason=${encodeURIComponent(
        "Stories are posted under your name, so they need an account."
      )}`
    );

  const caption = String(formData.get("caption") ?? "")
    .trim()
    .slice(0, MAX_CAPTION);
  const submitted = String(formData.get("imageUrl") ?? "").trim();
  const imageUrl = submitted.startsWith("https://") ? submitted : null;

  const now = Date.now();
  await prisma.story.create({
    data: {
      userId: user.id,
      caption: caption || "Behind the chair today.",
      imageUrl,
      expiresAt: new Date(now + STORY_LIFETIME_MS),
    },
  });

  // Opportunistic sweep so expired rows do not pile up; reads already ignore them.
  await prisma.story.deleteMany({ where: { expiresAt: { lte: new Date(now) } } });

  revalidatePath("/looks");
  redirect("/looks");
}

export async function updateStoryCaptionAction(id: string, caption: string) {
  const user = await getCurrentUser();
  if (!user) return;

  // Matching on expiresAt as well means an expired story can no longer be
  // edited, even though its row may still be sitting there awaiting the sweep.
  const { count } = await prisma.story.updateMany({
    where: { id, userId: user.id, expiresAt: { gt: new Date() } },
    data: { caption: caption.trim().slice(0, MAX_CAPTION) || "Behind the chair today." },
  });
  if (count) revalidatePath("/looks");
}

/** Records that the signed-in viewer has opened a story, which drops it to the
 * right of the rail on their next visit.
 *
 * Deliberately does NOT revalidate: re-sorting the rail while the viewer is
 * still paging through it would slide stories out from under them. The new
 * order lands on the next load, which is when a rail order is actually read. */
export async function markStoryViewedAction(storyId: string) {
  const user = await getCurrentUser();
  if (!user) return;

  try {
    await prisma.storyView.createMany({
      data: [{ userId: user.id, storyId }],
      skipDuplicates: true,
    });
  } catch {
    // The story expired or its owner deleted it between the open and this call.
    // There is nothing left to mark, and the viewer does not need to know.
  }
}

export async function deleteStoryAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return;

  const { count } = await prisma.story.deleteMany({
    where: { id, userId: user.id },
  });
  if (count) revalidatePath("/looks");
}
