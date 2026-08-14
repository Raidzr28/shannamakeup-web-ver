export const DEPOSIT_RATE = 30;

export const EXTRAS = [
  {
    id: "lashes",
    name: "Strip-free lashes",
    nameId: "Bulu mata satuan",
    note: "Individually placed, 40 min",
    noteId: "Dipasang satuan, 40 mnt",
    price: 450000,
  },
  {
    id: "hair",
    name: "Hair styling",
    nameId: "Tata rambut",
    note: "Set, veil fitting included",
    noteId: "Sanggul, termasuk pemasangan veil",
    price: 1200000,
  },
  {
    id: "touch",
    name: "Standby touch-up",
    nameId: "Touch-up standby",
    note: "Artist stays 4 extra hours",
    noteId: "Artist menemani 4 jam tambahan",
    price: 1800000,
  },
  {
    id: "party",
    name: "Bridal party (per face)",
    nameId: "Keluarga (per wajah)",
    note: "Mother, sisters, bridesmaids",
    noteId: "Ibu, saudara, pengiring",
    price: 900000,
  },
  {
    id: "trial",
    name: "Trial session",
    nameId: "Sesi trial",
    note: "Studio, 2 hours, 6 weeks before",
    noteId: "Studio, 2 jam, 6 minggu sebelum",
    price: 1500000,
  },
] as const;

export const VENUES = [
  {
    id: "venue",
    name: "At the venue",
    nameId: "Di lokasi acara",
    note: "Jakarta included · outside +transport",
    noteId: "Jakarta termasuk · luar kota +transport",
  },
  {
    id: "studio",
    name: "Kemang studio",
    nameId: "Studio Kemang",
    note: "Jl. Bangka Raya · parking on site",
    noteId: "Jl. Bangka Raya · parkir tersedia",
  },
  {
    id: "hotel",
    name: "Hotel suite",
    nameId: "Kamar hotel",
    note: "Shana arrives 90 min before call",
    noteId: "Shana datang 90 mnt sebelum jadwal",
  },
] as const;

export const PAY_METHODS = [
  { id: "transfer", name: "Bank transfer · BCA", nameId: "Transfer bank · BCA" },
  { id: "va", name: "Virtual account", nameId: "Virtual account" },
  { id: "card", name: "Card · Visa, Mastercard", nameId: "Kartu · Visa, Mastercard" },
] as const;

export const TIME_SLOTS = ["03:00", "04:00", "05:00", "07:00", "09:00", "13:00"];

export const CATEGORIES = [
  { id: "All", name: "All", nameId: "Semua" },
  { id: "Bridal", name: "Bridal", nameId: "Pengantin" },
  { id: "Editorial", name: "Editorial", nameId: "Editorial" },
  { id: "Traditional", name: "Traditional", nameId: "Tradisional" },
  { id: "Everyday", name: "Everyday", nameId: "Harian" },
] as const;

export function extraById(id: string) {
  return EXTRAS.find((e) => e.id === id);
}

export function venueById(id: string) {
  return VENUES.find((v) => v.id === id) ?? VENUES[0];
}

export function nextOrderCode() {
  return "SHN-" + Math.floor(1000 + Math.random() * 9000);
}
