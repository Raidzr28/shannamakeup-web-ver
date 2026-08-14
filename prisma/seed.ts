import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const LOOKS = [
  {
    id: "akad",
    order: 0,
    title: "Akad Pagi",
    titleId: "Akad Pagi",
    category: "Bridal",
    categoryId: "Pengantin",
    priceIdr: 8500000,
    durationLabel: "3 hr 30",
    blurb:
      "Dawn ceremony face built to survive tears, prayer and photographers. Skin first, structure second, colour last.",
    blurbId:
      "Wajah akad subuh yang tahan tangis, doa dan kamera. Kulit dulu, struktur kedua, warna terakhir.",
    includes: [
      "Full skin prep and barrier treatment",
      "Hijab or hair styling",
      "Lashes, individually placed",
      "Touch-up kit in your colours",
      "Artist stays through the akad",
    ],
    includesId: [
      "Persiapan kulit menyeluruh",
      "Tata hijab atau rambut",
      "Bulu mata satuan",
      "Kit touch-up sesuai warnamu",
      "Artist menemani sampai akad",
    ],
  },
  {
    id: "resepsi",
    order: 1,
    title: "Resepsi Malam",
    titleId: "Resepsi Malam",
    category: "Bridal",
    categoryId: "Pengantin",
    priceIdr: 9500000,
    durationLabel: "3 hr",
    blurb:
      "Evening reception look — deeper eye, sculpted cheek, flash-tested under stage lighting.",
    blurbId:
      "Tampilan resepsi malam — mata lebih dalam, pipi terpahat, teruji di bawah lampu panggung.",
    includes: [
      "Flash-tested base",
      "Sculpted contour and highlight",
      "Lashes and liner",
      "One outfit-change refresh",
    ],
    includesId: [
      "Base teruji flash",
      "Kontur dan highlight terpahat",
      "Bulu mata dan liner",
      "Satu kali refresh ganti busana",
    ],
  },
  {
    id: "prewed",
    order: 2,
    title: "Prewedding Editorial",
    titleId: "Prewedding Editorial",
    category: "Editorial",
    categoryId: "Editorial",
    priceIdr: 5500000,
    durationLabel: "2 hr",
    blurb:
      "Built for a lens, not a room. Matte skin, graphic brow, one deliberate colour.",
    blurbId:
      "Dibuat untuk lensa, bukan ruangan. Kulit matte, alis grafis, satu warna yang disengaja.",
    includes: [
      "Two looks in one session",
      "On-location kit",
      "Colour direction with your photographer",
    ],
    includesId: [
      "Dua tampilan dalam satu sesi",
      "Kit di lokasi",
      "Arahan warna bersama fotografermu",
    ],
  },
  {
    id: "sangjit",
    order: 3,
    title: "Sangjit",
    titleId: "Sangjit",
    category: "Traditional",
    categoryId: "Tradisional",
    priceIdr: 4500000,
    durationLabel: "2 hr",
    blurb:
      "Red-and-gold family day. Warm base, clean lid, everything legible in daylight photos.",
    blurbId:
      "Hari keluarga merah dan emas. Base hangat, kelopak bersih, semua terbaca di foto siang.",
    includes: [
      "Warm-tone base match",
      "Traditional hair set",
      "Family touch-ups (up to 2)",
    ],
    includesId: [
      "Penyesuaian base nada hangat",
      "Sanggul tradisional",
      "Touch-up keluarga (maks 2)",
    ],
  },
  {
    id: "campaign",
    order: 4,
    title: "Campaign Beauty",
    titleId: "Campaign Beauty",
    category: "Editorial",
    categoryId: "Editorial",
    priceIdr: 6500000,
    durationLabel: "4 hr",
    blurb:
      "Agency day rate. Skin retouched in-camera, briefs read before the call sheet.",
    blurbId:
      "Tarif harian agensi. Kulit selesai di kamera, brief dibaca sebelum call sheet.",
    includes: [
      "Day rate, up to 6 models",
      "Continuity notes per frame",
      "Assistant included",
    ],
    includesId: [
      "Tarif harian, hingga 6 model",
      "Catatan kontinuitas per frame",
      "Termasuk asisten",
    ],
  },
  {
    id: "grad",
    order: 5,
    title: "Graduation Clean",
    titleId: "Graduation Clean",
    category: "Everyday",
    categoryId: "Harian",
    priceIdr: 2200000,
    durationLabel: "1 hr 15",
    blurb:
      "One hour, one face, no theatre. The look you would want in ten years of photographs.",
    blurbId:
      "Satu jam, satu wajah, tanpa drama. Tampilan yang tetap kamu suka sepuluh tahun lagi.",
    includes: ["Skin prep and base", "Soft lash", "Lip in two finishes"],
    includesId: [
      "Persiapan kulit dan base",
      "Bulu mata natural",
      "Lipstik dua finish",
    ],
  },
];

async function main() {
  for (const look of LOOKS) {
    await prisma.look.upsert({
      where: { id: look.id },
      update: {},
      create: {
        ...look,
        includes: JSON.stringify(look.includes),
        includesId: JSON.stringify(look.includesId),
      },
    });
  }

  const artistPass = await bcrypt.hash("shana2026", 10);
  const artist = await prisma.user.upsert({
    where: { email: "shana@shanamakeup.id" },
    // Repeated in update so re-seeding an existing database also fills these in,
    // not just a fresh one.
    update: {
      username: "shana.mua",
      bio: "Bridal and editorial makeup, Jakarta. Skin first, structure second, colour last.",
      city: "Jakarta",
    },
    create: {
      name: "Shana Prameswari",
      email: "shana@shanamakeup.id",
      passwordHash: artistPass,
      role: "ARTIST",
      username: "shana.mua",
      bio: "Bridal and editorial makeup, Jakarta. Skin first, structure second, colour last.",
      city: "Jakarta",
    },
  });

  const clientPass = await bcrypt.hash("aruna2026", 10);
  const client = await prisma.user.upsert({
    where: { email: "aruna@studio.co" },
    update: { username: "aruna.p", city: "Jakarta" },
    create: {
      name: "Aruna Prameswari",
      email: "aruna@studio.co",
      passwordHash: clientPass,
      role: "CLIENT",
      username: "aruna.p",
      city: "Jakarta",
    },
  });

  const posts = [
    {
      userId: artist.id,
      lookId: "akad",
      title: "Akad Pagi",
      description:
        "05:00 call, one chair, natural light only. Skin prep took longer than the makeup.",
      place: "Kemang studio · Jakarta",
      credit: true,
    },
    {
      userId: client.id,
      lookId: "resepsi",
      title: "Resepsi Malam",
      description: "Flash-tested before the reception. Held through every dance.",
      place: "Menteng · Jakarta",
      credit: true,
    },
    {
      userId: artist.id,
      lookId: "prewed",
      title: "Prewedding Editorial",
      description:
        "Matte skin, graphic brow, one deliberate colour. Straight out of camera.",
      place: "Bandung",
      credit: true,
    },
    {
      userId: client.id,
      lookId: "sangjit",
      title: "Sangjit",
      description: "Warm tones for a red-and-gold family day.",
      place: "Pantai Indah Kapuk",
      credit: true,
    },
  ];
  for (const p of posts) {
    const existing = await prisma.post.findFirst({
      where: { userId: p.userId, lookId: p.lookId },
    });
    if (!existing) {
      await prisma.post.create({ data: { ...p, extras: JSON.stringify([]) } });
    }
  }

  const existingBooking = await prisma.booking.findUnique({
    where: { code: "SHN-2481" },
  });
  if (!existingBooking) {
    await prisma.booking.create({
      data: {
        code: "SHN-2481",
        userId: client.id,
        lookId: "akad",
        date: new Date("2026-08-22T05:00:00"),
        timeLabel: "05:00",
        venue: "venue",
        extras: JSON.stringify(["lashes"]),
        totalIdr: 8950000,
        depositIdr: 2700000,
        method: "transfer",
        status: "confirmed",
        name: "Aruna Prameswari",
        phone: "+62 812 0000 0000",
        email: "aruna@studio.co",
        city: "Jakarta Selatan",
      },
    });
  }

  console.log("Seed complete.");
  console.log("Artist login: shana@shanamakeup.id / shana2026");
  console.log("Client login: aruna@studio.co / aruna2026");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
