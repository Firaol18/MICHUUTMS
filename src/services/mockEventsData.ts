// Ethiopian Events, Festivals & Travel Blog Data

export interface EthiopianEvent {
  id: string;
  title: string;
  date: string;           // YYYY-MM-DD
  endDate?: string;
  location: string;
  region: string;
  category: 'religious' | 'cultural' | 'nature' | 'music' | 'food' | 'sport';
  description: string;
  imageUrl: string;
  isFeatured: boolean;
  tipForVisitors?: string;
}

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;        // simplified, multi-paragraph
  author: string;
  authorAvatar: string;
  publishedAt: string;
  readMinutes: number;
  coverImage: string;
  tags: string[];
  category: 'itinerary' | 'tips' | 'culture' | 'nature' | 'food' | 'guide';
}

export const ETHIOPIAN_EVENTS: EthiopianEvent[] = [
  {
    id: 'evt-1',
    title: 'Timkat – Ethiopian Epiphany',
    date: '2027-01-19',
    endDate: '2027-01-20',
    location: 'Lalibela, Gondar, Addis Ababa',
    region: 'Nationwide',
    category: 'religious',
    description: 'The most spectacular Ethiopian Orthodox festival celebrating Christ\'s baptism. Colorfully robed priests carry ornate tabots (Ark of the Covenant replicas) in grand processions to water bodies, followed by mass baptism ceremonies at dawn.',
    imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&q=80&w=1000',
    isFeatured: true,
    tipForVisitors: 'Arrive 2 days early to get a good viewing spot. Gondar\'s ceremony is considered the grandest.',
  },
  {
    id: 'evt-2',
    title: 'Meskel – Finding of the True Cross',
    date: '2026-09-27',
    endDate: '2026-09-28',
    location: 'Meskel Square, Addis Ababa',
    region: 'Addis Ababa / Nationwide',
    category: 'religious',
    description: 'UNESCO-listed celebration marking the discovery of the True Cross. The eve features a massive bonfire (Demera) surrounded by thousands of worshippers chanting and dancing in traditional white shemas at Meskel Square.',
    imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1000',
    isFeatured: true,
    tipForVisitors: 'The Demera bonfire lighting at sunset on September 27 is the peak moment — arrive 2 hours early.',
  },
  {
    id: 'evt-3',
    title: 'Irreecha – Oromo Thanksgiving',
    date: '2026-10-04',
    location: 'Hora Arsedi, Bishoftu (Debre Zeit)',
    region: 'Oromia Region',
    category: 'cultural',
    description: 'The largest Oromo cultural celebration held annually at Lake Hora Arsedi in Bishoftu. Millions dress in traditional Oromo attire (Hariye), dip colorful grass and flowers into the lake, and give thanks to Waaqa (God) for the passing of the dark rainy season.',
    imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1000',
    isFeatured: true,
    tipForVisitors: 'Join early morning at Lake Hora before it gets crowded. Dress in white or colorful traditional clothes to fit in.',
  },
  {
    id: 'evt-4',
    title: 'Great Ethiopian Run',
    date: '2026-11-22',
    location: 'Meskel Square, Addis Ababa',
    region: 'Addis Ababa',
    category: 'sport',
    description: 'Africa\'s biggest road race: a festive 10km run through Addis Ababa at 2,400m altitude where tens of thousands of international and local runners participate in colorful costumes while Ethiopians line the streets cheering.',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000',
    isFeatured: false,
    tipForVisitors: 'Register well in advance at greatethiopianrun.com. Bring altitude acclimatization time of 2–3 days beforehand.',
  },
  {
    id: 'evt-5',
    title: 'Fasika – Ethiopian Easter',
    date: '2027-04-18',
    endDate: '2027-04-19',
    location: 'Lalibela & Nationwide',
    region: 'Nationwide',
    category: 'religious',
    description: 'The most important Ethiopian Orthodox holiday following 55 days of strict fasting. Midnight church services, traditional doro wot (spiced chicken stew) and injera feasts, colorful clothes, and joyful street celebrations mark the resurrection.',
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80&w=1000',
    isFeatured: false,
    tipForVisitors: 'Lalibela\'s Easter midnight mass inside the rock churches is a once-in-a-lifetime experience.',
  },
  {
    id: 'evt-6',
    title: 'Enkutatash – Ethiopian New Year',
    date: '2026-09-11',
    location: 'Addis Ababa & Nationwide',
    region: 'Nationwide',
    category: 'cultural',
    description: 'Ethiopian New Year (Enkutatash) falls on September 11, marking the end of the long rainy season. Children gift yellow Adey Abeba daisies and hand-painted greeting cards to neighbors while families gather for feasts and churches hold special services.',
    imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&q=80&w=1000',
    isFeatured: false,
    tipForVisitors: 'The streets of Addis are filled with children singing and handing out flowers. A joyful, very local experience.',
  },
];

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: 'blog-1',
    slug: 'ultimate-lalibela-pilgrimage-guide',
    title: 'The Ultimate Lalibela Pilgrimage Guide: Rock Churches, Routes & Reverence',
    excerpt: 'Carved from solid basalt rock in the 12th century, Lalibela\'s 11 monolithic churches are one of humanity\'s greatest architectural achievements. Here\'s everything you need to plan an unforgettable visit.',
    content: `Lalibela sits at 2,630 metres in the Lasta mountains of Amhara, a medieval city whose entire reason for existence is sacred. King Lalibela commissioned 11 churches hewn directly from red volcanic rock — not built on top, but carved downward and inward, creating subterranean cathedrals connected by tunnels and trenches.\n\nThe Northwestern Cluster contains Bet Medhane Alem, the world\'s largest monolithic church, supported by 36 exterior pillars. Nearby, the intimate Bet Maryam houses remarkable 12th-century frescoes.\n\nThe Southeastern Cluster includes the most famous of all: Bet Giyorgis (St George), a perfectly cruciform church carved in isolation down a steep rocky pit. Its geometric roof, etched with interlocking crosses, is visible from above before you descend the winding path.\n\nVisit during Gena (Ethiopian Christmas in January) or Fasika (Orthodox Easter) for unforgettable midnight masses with thousands of white-robed pilgrims holding candles in the ancient tunnels.`,
    author: 'Tigist Haile',
    authorAvatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=100',
    publishedAt: '2026-07-15',
    readMinutes: 8,
    coverImage: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&q=80&w=1200',
    tags: ['Lalibela', 'UNESCO', 'Rock Churches', 'Pilgrimage', 'Amhara'],
    category: 'guide',
  },
  {
    id: 'blog-2',
    slug: 'danakil-depression-survival-guide',
    title: 'Danakil Depression Survival Guide: Earth\'s Hottest Inhabited Place',
    excerpt: 'At 116 metres below sea level, the Danakil is one of the most extreme environments on the planet. Neon sulphur springs, active lava lakes, and ancient salt caravans await — if you\'re prepared.',
    content: `The Danakil Depression in Ethiopia\'s Afar Region is routinely measured as the hottest permanently inhabited place on Earth, with average annual temperatures of 34–35°C and spikes well above 50°C. It is also one of the most geologically active zones on the planet.\n\nDallol hydrothermal field — a surreal landscape of neon yellow, green, and orange sulphur pools, salt chimneys, and acid brine channels — looks like another planet. The colours come from extreme chemistry: pH levels near zero, temperatures above boiling.\n\nErta Ale is one of only five lava lakes in the world with a permanently active lava lake in its summit caldera. The night trek (2–4 hours each way across dark lava plains) rewards with an incandescent glow visible from kilometres away.\n\nAfaris of the salt caravans: Ancient Afar tribes still extract pure white salt slabs from the ancient dried lake bed using traditional hand tools, loading camel trains that walk for days to highland markets — unchanged for centuries.`,
    author: 'Mohammed Ahmed',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
    publishedAt: '2026-08-01',
    readMinutes: 10,
    coverImage: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=1200',
    tags: ['Danakil', 'Erta Ale', 'Dallol', 'Afar', 'Extreme Travel'],
    category: 'guide',
  },
  {
    id: 'blog-3',
    slug: '7-day-ethiopian-highlands-itinerary',
    title: '7-Day Ethiopian Highlands Itinerary: Simien, Wenchi & Gondar',
    excerpt: 'A week is just enough time to experience the dramatic escarpments of the Simien Mountains, the volcanic paradise of Wenchi Crater Lake, and the medieval castles of Gondar. Here\'s the perfect itinerary.',
    content: `Day 1–2: Fly into Gondar. Spend the first afternoon at Fasil Ghebbi — the Royal Enclosure of 17th-century stone castles built by Emperor Fasilides. Day 2 visit the Debre Birhan Selassie church, whose ceiling is covered in painted angel faces.\n\nDay 3–5: Drive to Debark (3 hours) and enter the Simien Mountains National Park. Hike from Sankaber to Geech camp, passing vertical cliff drops of over 1,000m. The Gelada baboon troops are the highlight — enormous social families of golden-maned primates grazing in full view on mountain meadows.\n\nDay 6: Return to Addis Ababa by evening flight. Day 7: Day trip west from Addis to Wenchi Crater Lake (2.5 hours). Motorboat across to the island monastery, soak in volcanic hot springs, horseback ride along the crater rim — all in one day before returning to Addis for a final farewell coffee ceremony.`,
    author: 'Abebe Bekele',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
    publishedAt: '2026-07-28',
    readMinutes: 7,
    coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1200',
    tags: ['Itinerary', 'Simien Mountains', 'Wenchi', 'Gondar', '7 Days'],
    category: 'itinerary',
  },
  {
    id: 'blog-4',
    slug: 'ethiopian-coffee-culture-guide',
    title: 'Ethiopian Coffee Culture: The Birthplace of Arabica',
    excerpt: 'Ethiopia is the birthplace of coffee. From wild Harenna forest plants to the elaborate three-round coffee ceremony, understanding Ethiopian coffee culture makes every cup more meaningful.',
    content: `The coffee plant (Coffea arabica) originated in the highlands of Ethiopia\'s Kaffa region — a fact preserved in the word "coffee" itself, derived from "Kaffa." Wild arabica trees still grow naturally in the Harenna Forest of Bale Mountains at 1,500–2,400 metres altitude.\n\nThe Ethiopian coffee ceremony (Bunna) is a 45–60 minute ritual performed three times daily in many homes. Green beans are washed and roasted over charcoal in front of guests, ground in a mortar, brewed in a clay jebena pot, and served in small ceramic cups (sini) with sugar, salt, or butter depending on the region.\n\nThree rounds are traditional: Abol (first, strongest), Tona (second, medium), and Baraka (third, "blessing"). Refusing any of the three rounds is considered impolite.\n\nHarar is home to some of Ethiopia\'s most distinctive coffee: small, dry-processed beans with wine-like, mocha notes grown on ancient terraced farms inside the walled city. Look for Harar Longberry coffee in the city market.`,
    author: 'Tigist Haile',
    authorAvatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=100',
    publishedAt: '2026-06-20',
    readMinutes: 6,
    coverImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80&w=1200',
    tags: ['Coffee', 'Culture', 'Harar', 'Bale', 'Ceremony'],
    category: 'culture',
  },
  {
    id: 'blog-5',
    slug: 'best-time-to-visit-ethiopia',
    title: 'Best Time to Visit Ethiopia: Month-by-Month Season Guide',
    excerpt: 'Ethiopia has two distinct seasons — dry and rainy — and knowing when to go is the difference between a muddy trail and a pristine highland trek. Here\'s a practical month-by-month breakdown.',
    content: `Ethiopia uses the Ge\'ez calendar with 13 months. The country straddles the equator but most highlands have a moderate climate year-round.\n\nOctober to February (Dry Season / Birr): The absolute best time to travel. Post-Meskel landscapes are lush and golden, wildlife is abundant, and hiking conditions are excellent. Timkat in January draws massive, colourful crowds.\n\nMarch to May (Short Rains / Belg): The south and lowlands get short rains. Still good for the north — Lalibela, Gondar, and Simien stay accessible. Wildflowers bloom on mountain slopes.\n\nJune to September (Main Rainy Season / Kiremt): Heavy rains in the highlands. Simien trails can be muddy and some roads become challenging. However, the landscape turns spectacularly green and waterfalls are at their most powerful — perfect for waterfall photography. Danakil remains accessible year-round (but even hotter in summer).`,
    author: 'Abebe Bekele',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
    publishedAt: '2026-05-10',
    readMinutes: 5,
    coverImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1200',
    tags: ['Season', 'Travel Tips', 'Weather', 'Planning', 'Best Time'],
    category: 'tips',
  },
];
