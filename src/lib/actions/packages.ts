"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Every action here mutates the public price list, so the artist role is
 * re-checked server-side rather than trusted from the UI that rendered it. */
async function requireArtist() {
  const user = await getCurrentUser();
  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent("/manage")}&reason=${encodeURIComponent(
        "Sign in as the artist to manage packages."
      )}`
    );
  }
  if (user.role !== "ARTIST") redirect("/");
  return user;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** Splits the textarea format used for the "what's included" lists. */
function toLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function readForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const titleId = String(formData.get("titleId") ?? "").trim() || title;
  const category = String(formData.get("category") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim() || category;
  const blurb = String(formData.get("blurb") ?? "").trim();
  const blurbId = String(formData.get("blurbId") ?? "").trim() || blurb;
  const durationLabel = String(formData.get("durationLabel") ?? "").trim();
  const priceIdr = Number(formData.get("priceIdr") ?? 0);
  const includes = toLines(String(formData.get("includes") ?? ""));
  const includesIdRaw = toLines(String(formData.get("includesId") ?? ""));
  const heroImage = String(formData.get("heroImage") ?? "").trim();
  const order = Number(formData.get("order") ?? 0);

  return {
    title,
    titleId,
    category,
    categoryId,
    blurb,
    blurbId,
    durationLabel,
    priceIdr,
    includes,
    includesId: includesIdRaw.length ? includesIdRaw : includes,
    heroImage: heroImage.startsWith("https://") ? heroImage : null,
    order: Number.isFinite(order) ? order : 0,
  };
}

function validate(values: ReturnType<typeof readForm>) {
  if (!values.title) return "Give the package a title.";
  if (!values.category) return "Give the package a category.";
  if (!values.durationLabel) return "Add how long the session runs.";
  if (!Number.isFinite(values.priceIdr) || values.priceIdr <= 0)
    return "Set a price above zero.";
  return null;
}

export async function createPackageAction(formData: FormData) {
  await requireArtist();
  const values = readForm(formData);

  const problem = validate(values);
  if (problem) {
    redirect(`/manage/new?error=${encodeURIComponent(problem)}`);
  }

  // Look.id is the public slug used in URLs, so keep it readable and unique.
  const base = slugify(values.title) || "package";
  let id = base;
  for (let i = 2; await prisma.look.findUnique({ where: { id } }); i++) {
    id = `${base}-${i}`;
  }

  const last = await prisma.look.findFirst({ orderBy: { order: "desc" } });

  await prisma.look.create({
    data: {
      id,
      order: values.order || (last?.order ?? 0) + 1,
      title: values.title,
      titleId: values.titleId,
      category: values.category,
      categoryId: values.categoryId,
      priceIdr: Math.round(values.priceIdr),
      durationLabel: values.durationLabel,
      blurb: values.blurb,
      blurbId: values.blurbId,
      includes: JSON.stringify(values.includes),
      includesId: JSON.stringify(values.includesId),
      heroImage: values.heroImage,
    },
  });

  revalidatePath("/manage");
  revalidatePath("/manage/packages");
  revalidatePath("/book");
  revalidatePath("/");
  redirect("/manage/packages");
}

export async function updatePackageAction(formData: FormData) {
  await requireArtist();
  const id = String(formData.get("id") ?? "");
  const values = readForm(formData);

  const problem = validate(values);
  if (problem) {
    redirect(`/manage/${id}?error=${encodeURIComponent(problem)}`);
  }

  await prisma.look.update({
    where: { id },
    data: {
      order: values.order,
      title: values.title,
      titleId: values.titleId,
      category: values.category,
      categoryId: values.categoryId,
      priceIdr: Math.round(values.priceIdr),
      durationLabel: values.durationLabel,
      blurb: values.blurb,
      blurbId: values.blurbId,
      includes: JSON.stringify(values.includes),
      includesId: JSON.stringify(values.includesId),
      heroImage: values.heroImage,
    },
  });

  revalidatePath("/manage");
  revalidatePath("/manage/packages");
  revalidatePath("/book");
  revalidatePath("/");
  revalidatePath(`/l/${id}`);
  redirect("/manage/packages");
}

export async function deletePackageAction(formData: FormData) {
  await requireArtist();
  const id = String(formData.get("id") ?? "");

  // Bookings carry a required lookId and are financial records — removing the
  // package would orphan them, so the delete is refused instead.
  const bookings = await prisma.booking.count({ where: { lookId: id } });
  if (bookings > 0) {
    redirect(
      `/manage/packages?error=${encodeURIComponent(
        `That package has ${bookings} booking${bookings === 1 ? "" : "s"} against it and cannot be deleted. Edit it instead.`
      )}`
    );
  }

  // Posts only tag a package, so they survive with the tag cleared.
  await prisma.post.updateMany({ where: { lookId: id }, data: { lookId: null } });
  await prisma.look.delete({ where: { id } });

  revalidatePath("/manage");
  revalidatePath("/manage/packages");
  revalidatePath("/book");
  revalidatePath("/");
  redirect("/manage/packages");
}
