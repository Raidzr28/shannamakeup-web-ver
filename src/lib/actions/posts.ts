"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function gate(reasonEn: string, next: string): never {
  redirect(
    `/login?next=${encodeURIComponent(next)}&reason=${encodeURIComponent(reasonEn)}`
  );
}

export async function toggleLikeAction(formData: FormData) {
  const user = await getCurrentUser();
  const postId = String(formData.get("postId"));
  const next = String(formData.get("next") ?? "/looks");
  if (!user)
    gate("Likes are tied to an account so Shana knows whose taste it is.", next);

  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
  });
  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({ data: { userId: user.id, postId } });
  }
  revalidatePath(next);
}

export async function toggleSaveAction(formData: FormData) {
  const user = await getCurrentUser();
  const postId = String(formData.get("postId"));
  const next = String(formData.get("next") ?? "/looks");
  if (!user) gate("Saved looks live in your profile. Sign in to keep them.", next);

  const existing = await prisma.save.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
  });
  if (existing) {
    await prisma.save.delete({ where: { id: existing.id } });
  } else {
    await prisma.save.create({ data: { userId: user.id, postId } });
  }
  revalidatePath(next);
}

export async function createPostAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user)
    gate(
      "Posting to Looks needs an account — your photos are credited to you.",
      "/looks/compose"
    );

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const place = String(formData.get("place") ?? "").trim();
  const lookId = String(formData.get("lookId") ?? "") || null;
  const credit = formData.get("credit") === "on";
  const extras = formData.getAll("extras").map(String);
  // The browser uploads to Blob first and sends only the resulting URL, so the
  // photo bytes never pass through this action's 1 MB body budget.
  const submitted = String(formData.get("imageUrl") ?? "").trim();
  const imageUrl = submitted.startsWith("https://") ? submitted : null;

  await prisma.post.create({
    data: {
      userId: user.id,
      lookId,
      title: title || "Untitled look",
      description: description || "No description yet.",
      place: place || "Jakarta",
      credit,
      extras: JSON.stringify(extras),
      imageUrl,
    },
  });

  // New posts sort to the top of the feed, so no anchor is needed.
  revalidatePath("/looks");
  redirect("/looks");
}
