import { create } from 'zustand';

export type LanguageCode = 'en' | 'am' | 'om';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
  { code: 'am', label: 'Amharic', nativeLabel: 'አማርኛ', flag: '🇪🇹' },
  { code: 'om', label: 'Oromo', nativeLabel: 'Oromo', flag: '🌳' },
];

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    home: 'Home',
    explore_tours: 'Explore Tour Packages',
    tour_history: 'Tour History',
    events: 'Events',
    blog: 'Travel Blog',
    issue_tickets: 'Issue Tickets',
    admin_portal: 'Admin Portal',
    sign_in: 'Sign In',
    sign_up: 'Sign Up',
    welcome: 'Welcome',
    hero_badge: 'Land of Origins • Ethiopian Tourism Portal',
    hero_title_pre: 'Discover ',
    hero_title_brand: 'MICHUU',
    hero_title_post: ' Tourism & Curated Ethiopian Expeditions',
    hero_desc: 'From Wenchi Crater Lake thermal springs to Lalibela rock churches, Simien Mountains roof of Africa, and Danakil lava lakes.',
    search_placeholder: 'Search local Ethiopian destinations (e.g. Wenchi Crater Lake, Lalibela, Simien)...',
    find_tours: 'Find Tours',
    featured_tours: 'Featured Ethiopian Expeditions',
    featured_tours_sub: 'Hand-picked luxury packages with certified eco-ranger guides',
    all_packages: 'All Packages',
    faq_title: 'Frequently Asked Questions',
    contact_us: 'Contact Us',
    newsletter_title: 'Subscribe to MICHUU Tourism Newsletter',
    newsletter_sub: 'Get exclusive Ethiopian travel deals, seasonal discounts, and expedition guides sent to your inbox.',
    subscribe_btn: 'Subscribe Now',
    currency: 'Currency',
    chat_title: 'MICHUU AI Tourism Concierge',
    chat_welcome: 'Akkam! / Selam! How can I assist your Ethiopian travel plans today?',
  },
  am: {
    home: 'ዋና ገጽ',
    explore_tours: 'የጉብኝት ፓኬጆች',
    tour_history: 'የጉዞ ታሪክ',
    events: 'ሁነቶችና ፌስቲቫሎች',
    blog: 'የጉዞ ብሎግ',
    issue_tickets: 'የድጋፍ ጥያቄ',
    admin_portal: 'የአስተዳዳሪ ፖርታል',
    sign_in: 'ግቡ',
    sign_up: 'ተመዝገቡ',
    welcome: 'እንኳን ደህና መጡ',
    hero_badge: 'የሰው ልጅ መገኛ • የኢትዮጵያ ቱሪዝም ፖርታል',
    hero_title_pre: 'ልዩ የ',
    hero_title_brand: 'ሚቹ',
    hero_title_post: ' ቱሪዝምና የኢትዮጵያ ጉዞዎችን ይጎብኙ',
    hero_desc: 'ከወንጪ እሳተ ገሞራ ሐይቅና ፍልውሃዎች እስከ ላሊበላ ውቅር አብያተ ክርስቲያናት፣ የሰሜን ተሮችና ዳናኪል እሳተ ገሞራ።',
    search_placeholder: 'የኢትዮጵያ የጉብኝት ቦታዎችን ይፈልጉ (ምሳሌ፡ ወንጪ፣ ላሊበላ፣ ሰሜን)...',
    find_tours: 'ጉዞ ፈልግ',
    featured_tours: 'ተመርጠው የቀረቡ የኢትዮጵያ ጉዞዎች',
    featured_tours_sub: 'ከተመሰከረላቸው አስጎብኚዎች ጋር የተዘጋጁ የቅንጦት ፓኬጆች',
    all_packages: 'ሁሉም ፓኬጆች',
    faq_title: 'ተደጋግመው የሚጠየቁ ጥያቄዎች',
    contact_us: 'እኛን ለማግኘት',
    newsletter_title: 'ለሚቹ ቱሪዝም ዜና መጽሔት ይመዝገቡ',
    newsletter_sub: 'ልዩ የጉዞ ቅናሾችንና የኢትዮጵያ መዳረሻ መረጃዎችን በኢሜይልዎ ያግኙ።',
    subscribe_btn: 'አሁኑኑ ይመዝገቡ',
    currency: 'የገንዘብ ዓይነት',
    chat_title: 'የሚቹ AI ቱሪዝም ረዳት',
    chat_welcome: 'ሰላም! ዛሬ የኢትዮጵያ ጉዞዎን እንዴት ልርዳዎት?',
  },
  om: {
    home: 'Fuula Duraa',
    explore_tours: 'Pakeejjoota Daawwannaa',
    tour_history: 'Seenaa Imala',
    events: 'Aayyaanotaa fi Ayyaaneffannaa',
    blog: 'Bloogii Imala',
    issue_tickets: 'Waraqaa Gargaarsaa',
    admin_portal: 'Portaali Bulchiinsaa',
    sign_in: 'Seeni',
    sign_up: 'Galmaa\'i',
    welcome: 'Baga Nagaan Dhuftan',
    hero_badge: 'Madda Ka\'umsa Namaa • Portaali Turizimii Itoophiyaa',
    hero_title_pre: 'Daawwannaa ',
    hero_title_brand: 'MICHUU',
    hero_title_post: ' fi Imala Itoophiyaa Filatamaa Daawwadhaa',
    hero_desc: 'Haroo Hobaatii Qaraa Wenchi fi burqaa ho\'aa irraa kaasee hanga manneen qulqullummaa Lalibelaa, Gaarren Simien fi Haroo Daanaakil.',
    search_placeholder: 'Bakkeewwan daawwannaa Itoophiyaa barbaadi (fakkeenya: Wenchi, Lalibela, Simien)...',
    find_tours: 'Imala Barbaadi',
    featured_tours: 'Imala Filatamaa Itoophiyaa',
    featured_tours_sub: 'Pakeejjoota sadarkaa olaanaa ogeessota daawwachiistoota waliin zujajjaman',
    all_packages: 'Pakeejjoota Hundumaa',
    faq_title: 'Gaaffilee Yeroo Baay\'ee Gaafataman',
    contact_us: 'Nu Quunnamaa',
    newsletter_title: 'Oduu Turizimii MICHUU Qaqqabi',
    newsletter_sub: 'Gatiikaffaltii hir\'ifamaa fi odeeffannoo imala Itoophiyaa imeelii keessaniin qaqqabadhaa.',
    subscribe_btn: 'Amma Galmaa\'a',
    currency: 'Gosa Maallaqaa',
    chat_title: 'Gargaaraa Turizimii AI MICHUU',
    chat_welcome: 'Akkam! Karoora imala Itoophiyaa keessan har\'a akkamitti isin gargaaruu?',
  },
};

interface LanguageState {
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  currentLanguage: 'en',
  setLanguage: (lang) => set({ currentLanguage: lang }),
  t: (key) => {
    const lang = get().currentLanguage;
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
  },
}));
