const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:postgres123@localhost:5432/first_nest_api',
});

const ALL_13_EVENTS = [
  {
    title: 'Timkat – Ethiopian Epiphany',
    eventDate: '2027-01-19',
    endDate: '2027-01-20',
    location: 'Fasilides Bath (Gondar) & Rock Churches (Lalibela) (Amhara)',
    category: 'religious',
    description: "The most spectacular Ethiopian Orthodox festival celebrating Christ's baptism. Colorfully robed priests carry ornate tabots (Ark of the Covenant replicas) in grand processions to historic water baths (Fasilides Bath), followed by joyous mass baptism ceremonies at dawn.",
    imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&q=80&w=1000',
    isActive: true,
    isFree: true,
    price: 0,
    status: 'upcoming',
    tags: ['Amhara', 'Tir 11 (ጥር ፲፩)', 'UNESCO', 'Religious'],
  },
  {
    title: 'Meskel – Demera Finding of the True Cross',
    eventDate: '2026-09-27',
    endDate: '2026-09-28',
    location: 'Meskel Square, Addis Ababa (Finfinnee) (Addis Ababa (Finfinnee))',
    category: 'religious',
    description: 'UNESCO-inscribed celebration marking the discovery of the True Cross by Queen Helena. Features the ceremonial lighting of the towering conical Demera bonfire as hundreds of thousands chant in unison at sunset in central Addis Ababa.',
    imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1000',
    isActive: true,
    isFree: true,
    price: 0,
    status: 'upcoming',
    tags: ['Addis Ababa (Finfinnee)', 'Meskerem 17 (መስከረም ፲፯)', 'UNESCO', 'Demera'],
  },
  {
    title: 'Irreecha Malkaa Finfinnee – Oromo Thanksgiving',
    eventDate: '2026-10-03',
    endDate: null,
    location: 'Hora Finfinnee (Near Meskel Square & ECA), Finfinnee (Addis Ababa (Finfinnee))',
    category: 'cultural',
    description: 'The historic urban Irreecha celebration held at the heart of Finfinnee (Addis Ababa). Millions of Oromo pilgrims from across Oromia and the diaspora gather in vibrant traditional attire at Hora Finfinnee to dip wet green grass into the water, give thanks to Waaqa (God), and welcome the blossoming spring season.',
    imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1000',
    isActive: true,
    isFree: true,
    price: 0,
    status: 'upcoming',
    tags: ['Addis Ababa (Finfinnee)', 'Meskerem 23 (መስከረም ፳፫)', 'Oromo', 'Thanksgiving'],
  },
  {
    title: 'Irreecha Malkaa Arsedi – Grand Lake Thanksgiving',
    eventDate: '2026-10-04',
    endDate: null,
    location: 'Lake Hora Arsedi, Bishoftu (Debre Zeit) (Oromia)',
    category: 'cultural',
    description: 'The colossal climax of Irreecha thanksgiving celebrated at the sacred volcanic Lake Hora Arsedi in Bishoftu. Abbaa Gadaas (Gadaa leaders) and Haadha Siinqees lead sacred prayers of gratitude at the lakefront with horses, singing, and Adey Abeba flowers.',
    imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1000',
    isActive: true,
    isFree: true,
    price: 0,
    status: 'upcoming',
    tags: ['Oromia', 'Meskerem 24 (መስከረም ፳፬)', 'Oromo', 'Bishoftu'],
  },
  {
    title: 'Ashenda / Shadey / Solel Festival of Women',
    eventDate: '2026-08-22',
    endDate: '2026-08-26',
    location: 'Mekelle, Axum & Lalibela (Tigray)',
    category: 'cultural',
    description: 'A vibrant, colorful UNESCO-celebrated northern festival dedicated to girls and young women. Women dress in Tilfi embroidered dresses, braid intricate Albaso hairstyles, and tie green Ashenda sedge grass around their waists, singing and drumming through city streets.',
    imageUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=1000',
    isActive: true,
    isFree: true,
    price: 0,
    status: 'upcoming',
    tags: ['Tigray', 'Nehase 16–20 (ነሐሴ ፲፮–፳)', 'Women', 'Cultural'],
  },
  {
    title: 'Fichee-Chambalaalla – Sidama New Year Festival',
    eventDate: '2026-06-25',
    endDate: '2026-06-27',
    location: 'Gudumaale Sacred Ground, Hawassa (Sidama)',
    category: 'cultural',
    description: 'UNESCO Intangible Cultural Heritage celebrated by the Sidama people. Astrologers (Ayanto) determine the precise date from lunar cycles, followed by communal gatherings at Gudumaale in Hawassa, sharing traditional Bursame dish, and energetic Qetta dancing.',
    imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1000',
    isActive: true,
    isFree: true,
    price: 0,
    status: 'upcoming',
    tags: ['Sidama', 'Sene 18 (ሰኔ ፲፰)', 'UNESCO', 'New Year'],
  },
  {
    title: 'Shawal Eid & Jugol Cultural Festival',
    eventDate: '2027-04-10',
    endDate: '2027-04-12',
    location: 'Harar Jugol Historic Walled City (Harari)',
    category: 'cultural',
    description: 'A distinct three-day festival celebrated inside the ancient walled city of Harar immediately following the six days of voluntary Shawwal fasting. Features traditional Harari wedding dances, colorful attire, and nocturnal hyena ceremonies.',
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80&w=1000',
    isActive: true,
    isFree: false,
    price: 500,
    status: 'upcoming',
    tags: ['Harari', 'Miyazya 2 (ሚያዝያ ፪)', 'Harar', 'Jugol'],
  },
  {
    title: 'Hamar Bull Jumping Rite of Passage (Ukuli Bula)',
    eventDate: '2026-11-15',
    endDate: null,
    location: 'Turmi & Dimeka, Lower Omo Valley (Southern Ethiopia)',
    category: 'cultural',
    description: 'An ancient rite of passage ceremony where young Hamar men run across the backs of castrated bulls four times to prove their manhood and gain permission to marry, surrounded by Evangadi nighttime dancing.',
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=1000',
    isActive: true,
    isFree: false,
    price: 1800,
    status: 'upcoming',
    tags: ['Southern Ethiopia', 'Hidar 6 (ኅዳር ፮)', 'Omo Valley', 'Tradition'],
  },
  {
    title: 'Dallol & Erta Ale Salt Caravan Gathering',
    eventDate: '2026-12-10',
    endDate: null,
    location: 'Lake Karum (Assale) & Dallol, Afar Depression (Afar)',
    category: 'nature',
    description: 'Gathering of hundreds of traditional camel salt caravans across the blinding white salt flats of Lake Karum in Afar, where miners extract salt slabs using ancient hand tools beneath glowing volcanic horizons.',
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=1000',
    isActive: true,
    isFree: false,
    price: 2500,
    status: 'upcoming',
    tags: ['Afar', 'Tahsas 1 (ታኅሣሥ ፩)', 'Danakil', 'Caravan'],
  },
  {
    title: 'Gurage Meskel & Enset Harvest Celebration',
    eventDate: '2026-09-26',
    endDate: '2026-09-30',
    location: 'Welkite & Butajira (Central Ethiopia)',
    category: 'cultural',
    description: 'The Gurage cultural homecoming festival where hundreds of thousands travel from across Ethiopia back to their ancestral highlands for week-long feasts of Kitfo, Kocho, and traditional dance rituals.',
    imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1000',
    isActive: true,
    isFree: false,
    price: 600,
    status: 'upcoming',
    tags: ['Central Ethiopia', 'Meskerem 16–20 (መስከረም ፲፮–፳)', 'Gurage', 'Harvest'],
  },
  {
    title: 'Kaffa Wild Rainforest Coffee Origin Festival',
    eventDate: '2026-12-05',
    endDate: null,
    location: 'Bonga & Harenna Forest (South West Ethiopia)',
    category: 'food',
    description: 'Held in the birthplace of Arabica coffee (Kaffa Biosphere Reserve). Local forest communities demonstrate ancient harvesting of wild canopy coffee beans followed by authentic multi-round Bunna brewing ceremonies.',
    imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1000',
    isActive: true,
    isFree: false,
    price: 1200,
    status: 'upcoming',
    tags: ['South West Ethiopia', 'Hidar 26 (ኅዳር ፮)', 'Coffee', 'Kaffa'],
  },
  {
    title: 'Great Ethiopian Run (10k International Road Race)',
    eventDate: '2026-11-22',
    endDate: null,
    location: 'Meskel Square & Bole Rd, Finfinnee (Addis Ababa (Finfinnee))',
    category: 'sport',
    description: "Africa's largest road race founded by Olympic champion Haile Gebrselassie. Over 45,000 international and local runners take over the high-altitude streets of Finfinnee (Addis Ababa) in an electrifying street carnival.",
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000',
    isActive: true,
    isFree: false,
    price: 3000,
    status: 'upcoming',
    tags: ['Addis Ababa (Finfinnee)', 'Hidar 13 (ኅዳር ፲፫)', 'Running', '10K'],
  },
  {
    title: 'Enkutatash – Ethiopian New Year Celebration',
    eventDate: '2026-09-11',
    endDate: null,
    location: 'Addis Ababa (Finfinnee) & Nationwide (Nationwide)',
    category: 'cultural',
    description: 'Celebrates the arrival of spring sunshine after 3 months of rainy season. Children sing traditional songs with yellow Adey Abeba daisies while families feast on Doro Wot and freshly brewed Ethiopian coffee.',
    imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&q=80&w=1000',
    isActive: true,
    isFree: true,
    price: 0,
    status: 'upcoming',
    tags: ['Nationwide', 'Meskerem 1 (መስከረም ፩)', 'New Year'],
  },
];

async function seed() {
  await client.connect();
  console.log('Connected to DB');

  // Update column definition if necessary
  await client.query('ALTER TABLE "events" ALTER COLUMN "price" SET DEFAULT 0');
  await client.query('UPDATE "events" SET "price" = 0 WHERE "price" IS NULL');

  // Clear existing events to re-seed clean 13 full festivals
  await client.query('DELETE FROM "events"');
  console.log('Cleared old events');

  for (const item of ALL_13_EVENTS) {
    await client.query(
      `INSERT INTO "events" ("title", "eventDate", "endDate", "location", "category", "description", "imageUrl", "isActive", "isFree", "price", "status", "tags")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      [
        item.title,
        item.eventDate,
        item.endDate,
        item.location,
        item.category,
        item.description,
        item.imageUrl,
        item.isActive !== false,
        item.isFree !== false,
        item.price ?? 0,
        item.status || 'upcoming',
        JSON.stringify(item.tags || []),
      ]
    );
  }

  const { rows } = await client.query('SELECT count(*), min(price), max(price) FROM "events"');
  console.log('Total events in DB now:', rows[0]);
  await client.end();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
