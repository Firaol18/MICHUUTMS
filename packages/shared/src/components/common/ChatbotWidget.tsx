import React, { useState, useRef, useEffect } from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { MessageSquare, X, Send, Bot, Minimize2, RefreshCw } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPREHENSIVE KNOWLEDGE BASE — covers all TMS features, tours, booking,
// payments, cancellation, safety, visa, loyalty, guides, vehicles, events,
// blog, custom trips, suppliers, and support.
// ─────────────────────────────────────────────────────────────────────────────
const KNOWLEDGE_BASE = [
  // ── SEASON & WEATHER ──
  {
    keywords: ['best time', 'best season', 'when to visit', 'weather', 'climate', 'rainy', 'dry season', 'october', 'november', 'december', 'january', 'february'],
    reply: '🌤️ The ideal travel window for most Ethiopian highland destinations (Lalibela, Gondar, Simien Mountains, Wenchi) is **October through February** (the dry season). Rains fall June–September, making some roads impassable but the landscapes lush green. Danakil is best visited October–March before extreme summer heat.',
  },

  // ── DANAKIL DEPRESSION ──
  {
    keywords: ['danakil', 'erta ale', 'volcano', 'lava', 'afar', 'salt lake', 'hottest'],
    reply: '🌋 The **Danakil Depression** tour covers Erta Ale active lava lake, the Dallol sulfur springs, and the vast salt flats of the Afar Triangle — one of the most surreal landscapes on earth. Best visited October–March. All expeditions include certified Eco-Ranger guides, 4x4 Land Cruisers, and full camping equipment.',
  },

  // ── SIMIEN MOUNTAINS ──
  {
    keywords: ['simien', 'gelada', 'walia ibex', 'trekking', 'hiking', 'ras dashen', 'mountain', 'unesco'],
    reply: '⛰️ **Simien Mountains National Park** is a UNESCO World Heritage Site and home to the endangered Gelada baboon, Walia ibex, and Ethiopian wolf. MICHUU offers 3-day, 5-day, and 7-day trekking packages with certified ranger guides, mule porters, and comfortable camping or lodge options.',
  },

  // ── LALIBELA ──
  {
    keywords: ['lalibela', 'rock church', 'rock hewn', 'st george', 'bet giyorgis'],
    reply: '✝️ **Lalibela** is home to 11 remarkable medieval rock-hewn churches carved from solid volcanic rock in the 12th–13th centuries. MICHUU\'s Lalibela package includes flights from Addis Ababa, guided church tours with expert historians, and a traditional guesthouse stay.',
  },

  // ── WENCHI CRATER LAKE ──
  {
    keywords: ['wenchi', 'crater lake', 'horse', 'horse ride', 'blue nile', 'monastery'],
    reply: '🏞️ **Wenchi Crater Lake** is a stunning volcanic caldera 160km from Addis Ababa with horse-riding, boat rides to the island monastery, and scenic hiking trails. A great 1-2 day escape from Addis. MICHUU provides day-trip and overnight packages.',
  },

  // ── GONDAR ──
  {
    keywords: ['gondar', 'castle', 'fasilides', 'fasil ghebbi', 'royal enclosure'],
    reply: '🏰 **Gondar\'s Royal Enclosure (Fasil Ghebbi)** is a UNESCO-listed collection of medieval castles built by Emperor Fasilides in the 17th century. Often combined with Simien Mountains treks. MICHUU offers a 3-5 day Northern Historical Circuit that includes Gondar, Simien, Lalibela, and Axum.',
  },

  // ── HARAR ──
  {
    keywords: ['harar', 'hyena', 'feeding', 'walled city', 'jugol'],
    reply: '🦁 **Harar** is one of Islam\'s holiest cities, with 99 mosques and the famous nightly hyena feeding tradition. MICHUU offers 2-3 day Harar packages with the legendary hyena feeder experience, Jugol Old City walking tours, and Oromo coffee ceremony.',
  },

  // ── BALE MOUNTAINS ──
  {
    keywords: ['bale', 'bale mountains', 'wolf', 'ethiopian wolf', 'sanetti', 'harenna'],
    reply: '🐺 **Bale Mountains National Park** hosts the world\'s largest population of the endangered Ethiopian wolf on the Sanetti Plateau. MICHUU offers 3-5 day safari trekking packages with wildlife ranger guides, Harenna Forest walks, and mountain lodge accommodation.',
  },

  // ── AXUM ──
  {
    keywords: ['axum', 'aksum', 'obelisk', 'stele', 'ark of covenant', 'queen sheba', 'stelae'],
    reply: '🏛️ **Axum** was the ancient capital of the Aksumite Empire and is claimed to hold the original Ark of the Covenant. Key sights include the giant obelisks/stelae, Queen of Sheba\'s Bath, and St. Mary of Zion Cathedral. Included in MICHUU\'s Northern Historical Circuit.',
  },

  // ── OMO VALLEY ──
  {
    keywords: ['omo', 'omo valley', 'mursi', 'tribes', 'indigenous', 'karo', 'hamar'],
    reply: '🌍 **Omo Valley** in southern Ethiopia is home to over 20 indigenous ethnic groups including the Mursi (lip plate), Hamar (bull jumping ceremony), and Karo. MICHUU offers 5-8 day cultural expedition packages with ethical community engagement guidelines and local tribe guides.',
  },

  // ── TOUR BOOKING PROCESS ──
  {
    keywords: ['how to book', 'book a tour', 'booking process', 'reserve', 'reservation'],
    reply: '📋 **Booking a tour is easy:**\n1. Browse the Tour Catalog and select your package\n2. Click "Book Now" and choose your travel date + group size\n3. Fill in traveler details and any special requests\n4. Select your payment method and confirm\n5. You\'ll receive an email with your booking reference and QR e-ticket.\nYou can view and manage all bookings in **My Bookings** in your account dashboard.',
  },

  // ── BOOKING STATUS ──
  {
    keywords: ['booking status', 'booking confirmation', 'confirmed', 'pending booking', 'check booking'],
    reply: '📊 After submitting, your booking moves through: **Pending → Confirmed → Paid → Completed**. You can check the current status anytime in your **My Account → My Bookings** page. A confirmation email is sent automatically once the booking is confirmed by our team.',
  },

  // ── CANCELLATION ──
  {
    keywords: ['cancel', 'cancellation', 'refund', 'money back', 'cancel booking', 'cancel tour'],
    reply: '❌ **Cancellation Policy:**\n• 14+ days before departure: Full refund (100%)\n• 7–13 days before: 50% refund\n• Less than 7 days: No refund\nTo cancel, go to **My Account → My Bookings**, select the booking, and click Cancel. Our team reviews cancellations within 24 hours. Refunds are processed within 5–7 business days.',
  },

  // ── REFUND ──
  {
    keywords: ['refund', 'get money back', 'refund policy', 'refund status', 'when refund'],
    reply: '💰 Approved refunds are processed within **5–7 business days** via your original payment method (Telebirr, bank transfer, or card). You can track refund status in **My Bookings → Booking Detail**. Contact concierge@michuutours.et if you haven\'t received it after 7 days.',
  },

  // ── PAYMENT METHODS ──
  {
    keywords: ['payment', 'pay', 'telebirr', 'cbe', 'cbe birr', 'visa', 'mastercard', 'bank transfer', 'card', 'how to pay'],
    reply: '💳 **Accepted payment methods:**\n• 📱 **Telebirr** (Ethiopian mobile wallet)\n• 📱 **CBE Birr** (Commercial Bank of Ethiopia)\n• 💳 **Visa / Mastercard** (international cards)\n• 🏦 **Direct Bank Transfer** (ETB or USD)\nPayments can be made in Ethiopian Birr (ETB) or US Dollars (USD). All transactions are SSL-encrypted.',
  },

  // ── CURRENCY & PRICING ──
  {
    keywords: ['currency', 'price', 'cost', 'how much', 'etb', 'usd', 'dollar', 'birr', 'exchange'],
    reply: '💵 All MICHUU tour prices are displayed in both **ETB (Ethiopian Birr)** and **USD ($)**. Prices vary by tour type, duration, group size, and accommodation tier. Group discounts apply for 6+ travelers. Contact us for custom pricing on private charters.',
  },

  // ── VISA ──
  {
    keywords: ['visa', 'e-visa', 'evisa', 'entry', 'passport', 'visa on arrival', 'international travel'],
    reply: '🛂 **Ethiopian Tourist Visa:**\nMost international travelers can get an **E-Visa online** at evisa.gov.et (processed in 24–48 hours, costs $82 USD). Some nationalities qualify for **Visa on Arrival** at Addis Ababa Bole International Airport (ADD). African Union passport holders get free entry. Check your eligibility on the official site.',
  },

  // ── GUIDES ──
  {
    keywords: ['guide', 'tour guide', 'ranger', 'eco-ranger', 'certified guide', 'english speaking'],
    reply: '🧭 All MICHUU tours include **certified, multilingual Ethiopian Eco-Ranger Guides** who speak Amharic, Oromo, and English. Guides are licensed by the Ethiopian Tourism Organization, trained in first aid, and have deep local expertise in culture, history, and wildlife. You can view guide profiles and ratings before your tour.',
  },

  // ── GROUP SIZE & DISCOUNTS ──
  {
    keywords: ['group', 'group discount', 'family', 'corporate', 'private group', 'how many people'],
    reply: '👥 **Group & Family Bookings:**\n• 2–5 people: Standard pricing\n• 6–10 people: 10% group discount\n• 11–20 people: 15% discount\n• 20+ people: Custom corporate pricing\nContact concierge@michuutours.et for private group itineraries, corporate team-building trips, and family packages.',
  },

  // ── CHILDREN & FAMILY ──
  {
    keywords: ['children', 'kids', 'family', 'child price', 'child ticket', 'baby', 'infant'],
    reply: '👨‍👩‍👧 **Family Pricing:**\n• Children under 5: Free\n• Children 5–12: 40% discount on adult price\n• Children 13+: Adult pricing applies\nFamily-friendly tours include Wenchi Crater Lake, Timkat Festival, and the Northern Historical Circuit. All tours are rated by difficulty level on the tour detail page.',
  },

  // ── VEHICLES & TRANSPORT ──
  {
    keywords: ['4x4', 'land cruiser', 'transport', 'car', 'vehicle', 'driver', 'charter', 'transfer'],
    reply: '🚙 **Private 4x4 Charters:**\nAll MICHUU expedition tours use Toyota Land Cruiser 4x4 vehicles. You can add a **Private Land Cruiser Charter** directly in your booking cart. Vehicles are equipped with water, first aid kit, and satellite phone for remote areas. Licensed drivers are included in all packages.',
  },

  // ── ACCOMMODATION ──
  {
    keywords: ['hotel', 'accommodation', 'lodge', 'camp', 'camping', 'sleep', 'where stay'],
    reply: '🏨 **Accommodation options vary by tour:**\n• **Comfort**: 3-4 star hotels in cities, guesthouses at trailheads\n• **Adventure**: Safari-style tented camps (Simien, Danakil)\n• **Premium**: 5-star hotels (Addis Ababa) + eco-lodges\nYour selected accommodation tier is shown on the tour detail page. All accommodations are vetted by our team.',
  },

  // ── MEALS & FOOD ──
  {
    keywords: ['food', 'meal', 'meals', 'vegetarian', 'vegan', 'dietary', 'halal', 'breakfast', 'lunch', 'dinner'],
    reply: '🍽️ Most MICHUU packages include **breakfast daily** and some include full-board (breakfast + lunch + dinner). Dietary requirements (vegetarian, vegan, halal, gluten-free) can be specified in your profile under **Travel Preferences**. Ethiopian traditional injera cuisine is served on most expeditions.',
  },

  // ── LOYALTY PROGRAM ──
  {
    keywords: ['loyalty', 'rewards', 'bronze', 'silver', 'gold', 'platinum', 'points', 'tier', 'benefit'],
    reply: '🏆 **MICHUU Loyalty Program:**\n• 🥉 **Bronze** (1–2 trips): Free airport pick-up\n• 🥈 **Silver** (3–5 trips): 5% discount + priority booking\n• 🥇 **Gold** (6–10 trips): 10% discount + lounge access\n• 💎 **Platinum** (10+ trips): 15% discount + dedicated concierge + free upgrade\nYour tier is automatically calculated from your completed bookings. View progress in **My Account → Loyalty**.',
  },

  // ── REVIEWS ──
  {
    keywords: ['review', 'rating', 'star', 'feedback', 'leave review', 'write review', 'testimonial'],
    reply: '⭐ After completing a tour, you can leave a **star rating (1–5) and written review** in **My Account → My Reviews**. Reviews appear on the tour detail page after admin approval (usually within 24 hours). Honest reviews help other travelers plan better!',
  },

  // ── WISHLIST ──
  {
    keywords: ['wishlist', 'save tour', 'favourite', 'favorite', 'bookmark'],
    reply: '❤️ You can save any tour to your **Wishlist** by clicking the heart icon on a tour card. View saved tours anytime in **My Account → Wishlist** and book directly from there.',
  },

  // ── SUPPORT TICKETS ──
  {
    keywords: ['support', 'help', 'complaint', 'issue', 'problem', 'ticket', 'support ticket'],
    reply: '🎧 **Need help?** Submit a **Support Ticket** in **My Account → Support Tickets**. Categories include: Booking Issue, Payment Problem, Refund Request, Tour Quality Complaint, and General Inquiry. Our support team responds within **2 hours** during business hours (8AM–8PM EAT).',
  },

  // ── INVOICES ──
  {
    keywords: ['invoice', 'receipt', 'billing', 'tax', 'vat', 'download invoice'],
    reply: '🧾 Downloadable **invoices and receipts** for all confirmed payments are available in **My Account → Invoices**. Invoices include company letterhead, booking reference, tour details, tax breakdown, and payment confirmation. You can download as PDF.',
  },

  // ── QR TICKET ──
  {
    keywords: ['ticket', 'qr', 'qr code', 'e-ticket', 'digital ticket', 'boarding'],
    reply: '🎟️ Once your booking is confirmed and paid, a **digital QR-code e-ticket** is generated automatically. Find it in **My Bookings → Booking Detail → View Ticket**. The QR code is scanned by your guide at the tour start point for paperless check-in.',
  },

  // ── CUSTOM TRIP ──
  {
    keywords: ['custom trip', 'custom tour', 'custom itinerary', 'design', 'plan my own', 'tailor made', 'bespoke'],
    reply: '🗺️ **Custom Trip Builder** allows you to design your own Ethiopian adventure! Select destinations, accommodation tier, activities, travel dates, and group size. The system generates a live price estimate. Submit your custom request and our concierge team will finalize it within 24 hours.',
  },

  // ── EVENTS ──
  {
    keywords: ['event', 'festival', 'timkat', 'meskel', 'irreecha', 'run', 'cultural event', 'calendar'],
    reply: '📅 **Ethiopian Festivals & Events:**\n• **Timkat** (Jan 19) – Gondar & Lalibela\n• **Meskel** (Sep 27) – Addis Ababa\n• **Irreecha** (Oct) – Bishoftu\n• **Great Ethiopian Run** (Nov) – Addis Ababa\nView the full **Events Calendar** on the website to browse and book event tickets. Some events sell out early — book ahead!',
  },

  // ── HELICOPTER TRANSFER ──
  {
    keywords: ['helicopter', 'air', 'fly', 'flight', 'charter flight', 'aerial'],
    reply: '🚁 **Helicopter Transfers** are available for Danakil, Erta Ale, and remote highland destinations as a premium add-on. Contact our concierge for pricing and availability. Fixed-wing charter flights to Lalibela, Axum, and Mekelle are also available.',
  },

  // ── SAFETY ──
  {
    keywords: ['safe', 'safety', 'secure', 'dangerous', 'risk', 'is it safe', 'security'],
    reply: '🛡️ **Your safety is our top priority.** All MICHUU tours include:\n• Certified Eco-Ranger Guides with first-aid training\n• Satellite phones in remote areas\n• 24/7 emergency hotline: +251 911 00 22 33\n• Comprehensive travel insurance recommended\nEthiopia\'s main tourist regions are considered safe. We continuously monitor local conditions and update travel advisories.',
  },

  // ── INSURANCE ──
  {
    keywords: ['insurance', 'travel insurance', 'medical', 'emergency medical'],
    reply: '🏥 MICHUU strongly recommends **comprehensive travel insurance** covering medical evacuation, trip cancellation, and baggage loss. We partner with AIG Travel Guard and World Nomads — you can add insurance directly during the checkout process.',
  },

  // ── PHOTOGRAPHY ──
  {
    keywords: ['photography', 'photo', 'camera', 'drone', 'filming', 'photo tour'],
    reply: '📷 **Photography Tours** are available for Danakil, Simien, Omo Valley, and Meskel Festival. Dedicated photography expedition packages include extra time at key vantage points and a photography guide. Drone permits in national parks require advance application through Ethiopian Wildlife Conservation Authority.',
  },

  // ── BLOG ──
  {
    keywords: ['blog', 'article', 'travel blog', 'travel tips', 'inspiration', 'read'],
    reply: '✍️ Visit the **Travel Blog** section on our website for inspiring articles, travel guides, and tips on visiting Ethiopia\'s top destinations — written by our expert guides and seasoned travelers.',
  },

  // ── PROFILE & ACCOUNT ──
  {
    keywords: ['profile', 'account', 'my account', 'update profile', 'change name', 'avatar', 'photo', 'personal info'],
    reply: '👤 Manage your personal information in **My Account → Profile**. You can update your name, phone number, address, profile photo, travel preferences, dietary requirements, and emergency contact. Changes sync instantly across the entire platform.',
  },

  // ── PASSWORD ──
  {
    keywords: ['password', 'change password', 'forgot password', 'reset password', 'login', 'login issue'],
    reply: '🔐 Change your password in **My Account → Settings → Security**. Enter your current password, new password, and confirm. If you\'ve forgotten your password, click **Forgot Password** on the login page and we\'ll send a reset link to your email.',
  },

  // ── NEWSLETTER ──
  {
    keywords: ['newsletter', 'subscribe', 'email update', 'promotion', 'deal', 'offer', 'discount code'],
    reply: '📧 Subscribe to the **MICHUU Newsletter** at the bottom of any page to receive exclusive travel deals, early-bird tour offers, Ethiopia travel tips, and festival announcements. Use promo code **MICHUU15** for 15% off your first booking!',
  },

  // ── CONTACT & OFFICE ──
  {
    keywords: ['contact', 'phone number', 'office', 'headquarters', 'address', 'email', 'reach', 'call'],
    reply: '📞 **Contact MICHUU Tours:**\n• 📍 Tourism Plaza, 4th Floor, Bole Road, Addis Ababa\n• 📞 +251 911 00 22 33 (24/7 Support Hotline)\n• ✉️ concierge@michuutours.et\n• ⏰ Office hours: Mon–Sat 8AM–8PM (EAT)\nYou can also submit inquiries through the **Contact & FAQ** page on our website.',
  },

  // ── REGISTRATION / SIGN UP ──
  {
    keywords: ['register', 'sign up', 'create account', 'new account', 'join'],
    reply: '✅ **Creating an account is free and instant!** Click **Sign Up** in the top navigation, enter your name, email, and a password. You\'ll be able to book tours, track bookings, save wishlists, earn loyalty points, and manage your travel profile.',
  },

  // ── TOUR DURATION ──
  {
    keywords: ['duration', 'how long', 'days', 'nights', 'length of tour', 'itinerary days'],
    reply: '📅 Tour durations on MICHUU range from **1-day excursions** (Wenchi, Tiya) to **15-day grand expeditions** (Historic + South + East combined). Each tour detail page shows the exact day-by-day itinerary. Most popular multi-day packages: 3-day Danakil, 5-day Simien trek, 7-day Northern Historical Circuit.',
  },

  // ── DIFFICULTY LEVELS ──
  {
    keywords: ['difficulty', 'fitness', 'easy', 'moderate', 'hard', 'challenging', 'suitable', 'disabled'],
    reply: '🏃 MICHUU tours are rated by difficulty:\n• 🟢 **Easy**: Cultural city tours, Wenchi day trip\n• 🟡 **Moderate**: Simien 3-day trek, Bale wildlife safari\n• 🔴 **Challenging**: Danakil expedition, Simien 7-day summit\n• ♿ Accessible options available for most cultural tours. Contact us for accessibility requirements.',
  },

  // ── PACKING LIST ──
  {
    keywords: ['packing', 'what to pack', 'what to bring', 'luggage', 'clothing', 'gear', 'equipment'],
    reply: '🎒 **General packing tips for Ethiopia:**\n• Lightweight layers (cold nights in highlands)\n• Sturdy hiking boots for treks\n• Sun protection (hat, SPF 50+)\n• Modest clothing for churches and mosques\n• Water purification tablets\n• US Dollars cash for park fees\nYour tour guide will send a specific packing list after booking confirmation.',
  },

  // ── HEALTH & VACCINATIONS ──
  {
    keywords: ['vaccine', 'vaccination', 'yellow fever', 'malaria', 'health', 'medication', 'doctor', 'medical'],
    reply: '💉 **Health requirements for Ethiopia:**\n• **Yellow Fever certificate** required if arriving from endemic countries\n• **Malaria prophylaxis** recommended for lowland areas (Omo Valley, Awash)\n• **Altitude sickness** medication recommended for Simien (4000m+)\nConsult your doctor 4–6 weeks before travel. MICHUU guides carry basic first aid kits on all tours.',
  },

  // ── NORTHERN HISTORIC CIRCUIT ──
  {
    keywords: ['historic circuit', 'northern ethiopia', 'gondar lalibela', 'axum lalibela', 'historical tour'],
    reply: '🏛️ The **Northern Historical Circuit** is Ethiopia\'s most iconic route: **Addis Ababa → Gondar (castles) → Simien Mountains → Lalibela (rock churches) → Axum (obelisks)**. MICHUU offers 7-day, 10-day, and 14-day versions with internal flights, expert historian guides, and 3–4 star accommodation.',
  },

  // ── SOUTHERN ETHIOPIA ──
  {
    keywords: ['south ethiopia', 'southern tour', 'konso', 'arba minch', 'lake chamo', 'dorze'],
    reply: '🌿 **Southern Ethiopia** tours explore Arba Minch, Lake Chamo (Nile crocodiles & hippos), Dorze traditional villages, and the Konso Cultural Landscape (UNESCO). A 5-7 day route often combined with an Omo Valley extension.',
  },

  // ── BIRDS & BIRDING ──
  {
    keywords: ['birding', 'bird watching', 'birds', 'endemic birds', 'wattled crane', 'albatross'],
    reply: '🦅 Ethiopia is a **birder\'s paradise** with 860+ species, 20 of which are endemic. Top birding spots: Bale Mountains (Rouget\'s Rail, Ethiopian wolf), Lake Ziway (pelicans, flamingos), Awash (dry-country raptors). MICHUU offers dedicated birding itineraries with specialist ornithologist guides.',
  },

  // ── COFFEE ──
  {
    keywords: ['coffee', 'buna', 'coffee ceremony', 'coffee origin', 'kaffa', 'jimma'],
    reply: '☕ Ethiopia is the **birthplace of coffee**! MICHUU offers dedicated **Coffee Origin Tours** to Kaffa Forest (the original wild arabica forest), Jimma, and Yirgacheffe. Includes coffee farm visits, cupping sessions, and traditional Ethiopian coffee ceremony experiences.',
  },

  // ── GENERAL GREETING ──
  {
    keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'selam', 'salam'],
    reply: '👋 Hello and welcome to **MICHUU Concierge AI**! I can help you with tour information, booking questions, payment methods, visa requirements, cancellation policies, and much more. What would you like to know about your Ethiopian adventure?',
  },

  // ── THANK YOU ──
  {
    keywords: ['thank', 'thanks', 'thank you', 'appreciate', 'helpful'],
    reply: '🙏 You\'re very welcome! It\'s our pleasure to assist you plan your Ethiopian adventure. If you have more questions, feel free to ask — or contact our concierge team directly at **concierge@michuutours.et** or **+251 911 00 22 33**. Safe travels! ✈️🇪🇹',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// QUICK CHIPS — shown below messages as suggested questions
// ─────────────────────────────────────────────────────────────────────────────
const QUICK_CHIPS = [
  { emoji: '☀️', label: 'Best Season?', msg: 'When is the best time to visit Ethiopia?' },
  { emoji: '💳', label: 'Payments', msg: 'What payment methods do you accept?' },
  { emoji: '🛂', label: 'E-Visa', msg: 'How do I get an Ethiopian E-Visa?' },
  { emoji: '🌋', label: 'Danakil', msg: 'Tell me about the Danakil Depression tour' },
  { emoji: '❌', label: 'Cancellation', msg: 'What is the cancellation policy?' },
  { emoji: '🏆', label: 'Loyalty', msg: 'How does the loyalty rewards program work?' },
  { emoji: '🧭', label: 'Guides', msg: 'Are certified guides included in tours?' },
  { emoji: '📋', label: 'Book a Tour', msg: 'How do I book a tour?' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Smart response resolver — weighted multi-keyword matching
// ─────────────────────────────────────────────────────────────────────────────
function resolveReply(input: string): string {
  const lower = input.toLowerCase();

  // Score each entry by how many keywords match
  let best = { score: 0, reply: '' };
  for (const entry of KNOWLEDGE_BASE) {
    const score = entry.keywords.filter((kw) => lower.includes(kw)).length;
    if (score > best.score) {
      best = { score, reply: entry.reply };
    }
  }

  if (best.score > 0) return best.reply;

  // Fallback
  return "Thank you for your question! Our travel concierge team has received your message and will respond shortly.\n\n📞 For immediate assistance:\n• **Phone**: +251 911 00 22 33 (24/7)\n• **Email**: concierge@michuutours.et\n• **Hours**: Mon–Sat, 8AM–8PM (EAT)\n\nYou can also browse our **FAQ page** or **Contact Us** form for quick answers.";
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export const ChatbotWidget: React.FC = () => {
  const { currentLanguage } = useLanguageStore();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimised, setIsMinimised] = useState(false);

  const welcomeText =
    currentLanguage === 'om'
      ? 'Akkam! Baga nagaan dhuftan. Akkamitti isin gargaaruu?'
      : currentLanguage === 'am'
        ? 'ሰላም! እንኳን ደህና መጡ። እንዴት ልርዳዎት?'
        : 'Greetings! 👋 How can I help you?';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: welcomeText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMsg('');
    setIsTyping(true);

    // Simulate AI typing delay (600–1200ms based on reply length)
    const reply = resolveReply(text);
    const delay = Math.min(500 + reply.length * 2, 1400);

    setTimeout(() => {
      setIsTyping(false);
      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    }, delay);
  };

  const handleReset = () => {
    setMessages([
      {
        id: `welcome-reset-${Date.now()}`,
        sender: 'bot',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Render text with basic bold (**text**) and line-break support
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : part.split('\n').map((line, j) => (
          <span key={`${i}-${j}`}>
            {j > 0 && <br />}
            {line}
          </span>
        ))
    );
  };

  return (
    <>
      {/* ── Floating Launcher Button ── */}
      <button
        id="chatbot-launcher-btn"
        onClick={() => { setIsOpen(!isOpen); setIsMinimised(false); }}
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
          color: '#fff', border: 'none',
          boxShadow: '0 8px 24px rgba(37,99,235,0.35), 0 2px 8px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px) scale(1.06)';
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(37,99,235,0.4), 0 4px 10px rgba(0,0,0,0.18)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,99,235,0.35), 0 2px 8px rgba(0,0,0,0.15)';
        }}
        title="MICHUU Concierge AI — Live Travel Support"
        aria-label="Open chat support"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>

      {/* ── Chat Window ── */}
      {isOpen && (
        <div
          id="chatbot-window"
          style={{
            position: 'fixed', bottom: '92px', right: '24px', zIndex: 1000,
            width: '390px', maxWidth: 'calc(100vw - 2rem)',
            height: isMinimised ? 'auto' : '540px',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.18), 0 8px 24px rgba(0,0,0,0.1)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            animation: 'chatSlideIn 0.3s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <style>{`
            @keyframes chatSlideIn {
              from { opacity: 0; transform: translateY(16px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes typingDot {
              0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
              40% { transform: translateY(-4px); opacity: 1; }
            }
          `}</style>

          {/* Header */}
          <div style={{
            padding: '0.875rem 1.1rem',
            background: 'linear-gradient(135deg, #1d4ed8 0%, #06b6d4 100%)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Bot size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '13px', letterSpacing: '-0.01em' }}>
                  MICHUU Concierge AI
                </div>
                <div style={{ fontSize: '10px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '1px' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', flexShrink: 0 }} />
                  Online · EN / አማርኛ / Afaan Oromo
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                onClick={handleReset}
                title="Reset conversation"
                style={{ color: '#fff', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '6px', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => setIsMinimised(!isMinimised)}
                title={isMinimised ? 'Expand' : 'Minimise'}
                style={{ color: '#fff', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '6px', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <Minimize2 size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                style={{ color: '#fff', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '6px', width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {!isMinimised && (
            <>
              {/* Messages Body */}
              <div style={{
                flex: 1, padding: '1rem', overflowY: 'auto',
                display: 'flex', flexDirection: 'column', gap: '0.75rem',
                backgroundColor: 'var(--bg-primary)',
              }}>
                {messages.map((msg) => (
                  <div key={msg.id} style={{ alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
                    <div style={{
                      padding: '0.65rem 0.9rem',
                      borderRadius: msg.sender === 'user' ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
                      background: msg.sender === 'user'
                        ? 'linear-gradient(135deg, #2563eb, #1d4ed8)'
                        : 'var(--bg-secondary)',
                      color: msg.sender === 'user' ? '#fff' : 'var(--text-primary)',
                      fontSize: '12.5px', lineHeight: 1.55,
                      border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                      wordBreak: 'break-word',
                    }}>
                      {renderText(msg.text)}
                    </div>
                    <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '3px', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
                      {msg.timestamp}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div style={{ alignSelf: 'flex-start' }}>
                    <div style={{
                      padding: '0.65rem 0.9rem', borderRadius: '14px 14px 14px 3px',
                      background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                      display: 'flex', gap: '4px', alignItems: 'center',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    }}>
                      {[0, 1, 2].map((i) => (
                        <span key={i} style={{
                          width: 6, height: 6, borderRadius: '50%', backgroundColor: '#2563eb',
                          animation: `typingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }} />
                      ))}
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Quick Chip Suggestions */}
              <div style={{
                padding: '0.5rem 0.75rem', borderTop: '1px solid var(--border-color)',
                background: 'var(--bg-secondary)', display: 'flex', gap: '0.35rem',
                overflowX: 'auto', flexShrink: 0,
                scrollbarWidth: 'none',
              }}>
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => sendMessage(chip.msg)}
                    style={{
                      fontSize: '10.5px', padding: '0.28rem 0.65rem',
                      borderRadius: '100px', border: '1px solid var(--border-color)',
                      background: 'var(--bg-primary)', color: 'var(--text-secondary)',
                      whiteSpace: 'nowrap', cursor: 'pointer',
                      transition: 'all 0.15s ease', flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#2563eb';
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.borderColor = '#2563eb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--bg-primary)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                  >
                    {chip.emoji} {chip.label}
                  </button>
                ))}
              </div>

              {/* Input */}
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(inputMsg); }}
                style={{
                  padding: '0.65rem 0.75rem', background: 'var(--bg-secondary)',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex', gap: '0.5rem', flexShrink: 0,
                }}
              >
                <input
                  id="chatbot-input"
                  type="text"
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  placeholder="Ask about tours, booking, visa, payments..."
                  autoComplete="off"
                  style={{
                    flex: 1, padding: '0.5rem 0.875rem',
                    borderRadius: '100px', border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)', color: 'var(--text-primary)',
                    fontSize: '12.5px', outline: 'none',
                  }}
                />
                <button
                  type="submit"
                  id="chatbot-send-btn"
                  disabled={!inputMsg.trim()}
                  style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: inputMsg.trim() ? 'linear-gradient(135deg,#2563eb,#06b6d4)' : 'var(--bg-tertiary)',
                    color: inputMsg.trim() ? '#fff' : 'var(--text-muted)',
                    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: inputMsg.trim() ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};
