import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tour } from '../tours/entities/tour.entity';
import { Event } from '../events/entities/event.entity';
import { BlogPost } from '../blog/entities/blog-post.entity';
import { Enquiry } from '../enquiries/entities/enquiry.entity';
import { Issue } from '../issues/entities/issue.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Tour) private tourRepo: Repository<Tour>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(BlogPost) private blogRepo: Repository<BlogPost>,
    @InjectRepository(Enquiry) private enquiryRepo: Repository<Enquiry>,
    @InjectRepository(Issue) private issueRepo: Repository<Issue>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedTours();
    await this.seedEvents();
    await this.seedBlog();
    await this.seedEnquiries();
    await this.seedIssues();
  }

  private async seedTours() {
    const count = await this.tourRepo.count();
    if (count > 0) return;

    this.logger.log('🌱 Seeding initial Tours...');
    const tours: Partial<Tour>[] = [
      {
        title: 'Wenchi Crater Lake Eco-Resort & Equestrian Expedition',
        slug: 'wenchi-crater-lake-expedition',
        category: 'mountain',
        summary: 'Explore the emerald alpine caldera lake of Wenchi on horseback, trek across volcanic hot springs, visit ancient island monasteries, and unwind at an eco-lodge.',
        destinationName: 'Wenchi Crater Lake',
        destinationCountry: 'Ethiopia',
        destinationRegion: 'Oromia Region',
        destinationImageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1000',
        destinationDescription: 'Breathtaking volcanic crater lake surrounded by lush alpine greenery, hot mineral thermal springs, waterfall trails, and island monasteries.',
        pricePerPerson: 42000,
        originalPrice: 48000,
        discountPercent: 12,
        durationDays: 3,
        maxGroupSize: 12,
        difficulty: 'moderate',
        rating: 4.95,
        reviewCount: 48,
        imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1000',
        galleryImages: [
          'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1000'
        ],
        included: ['Luxury eco-lodge accommodation', 'All organic farm-to-table meals', 'Private horseback riding guides', 'Lake wooden canoe transfers', 'Park conservation permits'],
        excluded: ['Addis Ababa airport transfers (optional add-on)', 'Alcoholic beverages outside dinner wine', 'Personal travel insurance'],
        itinerary: [
          { dayNumber: 1, title: 'Scenic Drive to Ambo & Crater Rim Ascent', description: 'Depart Addis Ababa through the Great Rift Valley western escarpments towards Ambo town. Ascend the Wenchi crater rim for lunch.' },
          { dayNumber: 2, title: 'Equestrian Trails & Island Monastery Crossing', description: 'Mount well-trained mountain horses for a gentle descent down the pine-forested slopes to the lakeside.' },
          { dayNumber: 3, title: 'Hot Springs Sunrise Walk & Return to Addis', description: 'Dawn nature walk past bubbling natural mineral thermal springs and valley waterfalls.' }
        ],
        isFeatured: true,
        status: 'active',
        offerTag: 'Popular Choice',
        hasOffer: true,
        assignedGuideName: 'Abebe Bekele',
      },
      {
        title: 'Danakil Depression, Dallol & Erta Ale Lava Expedition',
        slug: 'danakil-depression-erta-ale-expedition',
        category: 'extreme' as any,
        summary: 'Journey into the planet’s lowest continental trench: hike the bubbling Erta Ale shield volcano summit, cross surreal acid pools at Dallol, and witness camel salt caravans.',
        destinationName: 'Danakil Depression & Erta Ale',
        destinationCountry: 'Ethiopia',
        destinationRegion: 'Afar Region',
        destinationImageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=1000',
        destinationDescription: 'One of the lowest and hottest places on Earth featuring glowing neon Dallol salt springs, traditional salt miners caravans, and active lava lakes.',
        pricePerPerson: 88000,
        originalPrice: 95000,
        discountPercent: 7,
        durationDays: 4,
        maxGroupSize: 8,
        difficulty: 'extreme',
        rating: 4.98,
        reviewCount: 94,
        imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=1000',
        galleryImages: [
          'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1000'
        ],
        included: ['Heavy-duty 4x4 Land Cruisers with AC', 'Full mobile desert camp setup', 'Private Afar armed scout protection', 'Cook & chef team with bottled water', 'Erta Ale summit camping gear'],
        excluded: ['Domestic flights (Semera or Mekele)', 'Personal extreme adventure insurance', 'Sleeping bags'],
        itinerary: [
          { dayNumber: 1, title: 'Semera to Afdera Salt Lake & Erta Ale Base', description: 'Meet in Semera, capital of Afar. Drive through black volcanic basalt fields towards Lake Afdera.' },
          { dayNumber: 2, title: 'Erta Ale Lava Lake & Night Trek to Summit', description: 'Spend the day in the caldera area. In late afternoon, hike up the gentle slope of active volcano Erta Ale.' },
          { dayNumber: 3, title: 'Neon Mineral Hydrothermal Springs of Dallol', description: 'Drive to the otherworldly neon-green, yellow, and red geothermal fields of Dallol.' },
          { dayNumber: 4, title: 'Lake Assal Salt Miners & Return to Semera', description: 'Witness traditional salt extractors carving salt blocks before returning to Semera for flights.' }
        ],
        isFeatured: true,
        status: 'active',
        offerTag: 'Top Rated',
        hasOffer: true,
        assignedGuideName: 'Mohammed Ahmed',
      },
      {
        title: 'Lalibela 11 Monolithic Rock-Hewn Churches & Heritage Trail',
        slug: 'lalibela-rock-churches-heritage',
        category: 'cultural',
        summary: 'Step back to the 12th century and explore the world’s most magnificent rock-cut architectural marvels, hidden subterranean catacombs, and ancient Ge’ez chanting ceremonies.',
        destinationName: 'Lalibela Rock Churches',
        destinationCountry: 'Ethiopia',
        destinationRegion: 'Amhara Region',
        destinationImageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&q=80&w=1000',
        destinationDescription: 'World-famous UNESCO World Heritage site boasting 11 monolithic churches carved directly out of solid red basalt rock.',
        pricePerPerson: 52000,
        durationDays: 3,
        maxGroupSize: 15,
        difficulty: 'easy',
        rating: 4.96,
        reviewCount: 112,
        imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&q=80&w=1000',
        galleryImages: [
          'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&q=80&w=1000'
        ],
        included: ['Boutique heritage hotel stay in Lalibela', 'All breakfasts & gourmet traditional dinners', 'Licensed senior historian guide', 'All UNESCO site church admission passes', 'Private traditional coffee ceremony'],
        excluded: ['Domestic flight tickets', 'Camera permits for special ceremonies', 'Tips & gratuities'],
        itinerary: [
          { dayNumber: 1, title: 'Arrival & Northern Group of Rock Churches', description: 'Arrive at Lalibela airport. Tour Bet Medhane Alem, Bet Maryam, and Bet Meskel.' },
          { dayNumber: 2, title: 'Southeastern Group & Iconic Bet Giyorgis', description: 'Explore the eastern cluster linked by labyrinthine dark tunnels, culminating in the cross-shaped Bet Giyorgis.' },
          { dayNumber: 3, title: 'Yimrhane Kristos Cave Church & Departure', description: 'Morning excursion to Yimrhane Kristos cave church built inside a massive natural cave.' }
        ],
        isFeatured: true,
        status: 'active',
        assignedGuideName: 'Tewodros Kassahun',
      },
      {
        title: 'Simien Mountains Roof of Africa Trek & Wildlife Safari',
        slug: 'simien-mountains-roof-of-africa-trek',
        category: 'safari',
        summary: 'Traverse dramatic serrated escarpments, encounter thousands of endemic Gelada grass-eating baboons, Walia ibex, and marvel at Jinbar waterfall plunges.',
        destinationName: 'Simien Mountains National Park',
        destinationCountry: 'Ethiopia',
        destinationRegion: 'Gonder / Amhara',
        destinationImageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000',
        destinationDescription: 'Dramatic serrated mountain escarpments, deep precipitous gorges, endemic Gelada baboon troops, and Ras Dashen peak.',
        pricePerPerson: 75000,
        originalPrice: 85000,
        discountPercent: 11,
        durationDays: 5,
        maxGroupSize: 10,
        difficulty: 'challenging',
        rating: 4.92,
        reviewCount: 68,
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000',
        galleryImages: [
          'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000'
        ],
        included: ['Park scout & wildlife tracker fees', 'Quality 4-season camping gear', 'Experienced backcountry mountain chef', 'Mule and handler pack logistics', 'All park admissions & 4WD transfers from Gonder'],
        excluded: ['Warm clothing / sleeping mats', 'Trekking poles', 'Personal medication'],
        itinerary: [
          { dayNumber: 1, title: 'Gonder to Debark & Sankaber Camp', description: 'Drive from Gonder to Debark park HQ, register, then start gentle acclimation hike into Sankaber camp.' },
          { dayNumber: 2, title: 'Sankaber to Geech via Jinbar Waterfall', description: 'Trek along massive cliff edges with sheer 800m drops. Stop at Jinbar waterfall gorge.' },
          { dayNumber: 3, title: 'Imet Gogo 360 Panoramic View & Chennek', description: 'Pre-dawn summit of Imet Gogo (3,926m) for one of the finest mountain panoramic views on earth.' },
          { dayNumber: 4, title: 'Bwahit Peak (4,430m) & Walia Ibex Spotting', description: 'Ascend Bwahit Pass to spot the endangered Walia ibex on the rock faces.' },
          { dayNumber: 5, title: 'Chennek to Gonder Farewell Lunch', description: 'Morning sunrise views over the deep valley below, followed by scenic 4WD drive back to Gonder.' }
        ],
        isFeatured: false,
        status: 'active',
        offerTag: 'Adventure Pick',
        hasOffer: true,
        assignedGuideName: 'Girma Assefa',
      }
    ];

    for (const t of tours) {
      await this.tourRepo.save(this.tourRepo.create(t));
    }
    this.logger.log(`✅ Seeded ${tours.length} Tours`);
  }

  private async seedEvents() {
    const count = await this.eventRepo.count();
    if (count > 0) return;

    this.logger.log('🌱 Seeding initial Events...');
    const events: Partial<Event>[] = [
      {
        title: 'Timkat – Ethiopian Epiphany',
        description: 'Spectacular UNESCO-inscribed celebration of the Baptism of Jesus with sacred Tabot processions, white Shemma robes, and ritual blessing ceremonies.',
        eventDate: '2027-01-19',
        location: 'Lalibela, Gondar & Addis Ababa',
        category: 'religious',
        imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1000',
        isFree: true,
        isActive: true,
        status: 'upcoming',
        tags: ['UNESCO', 'Religious', 'Cultural', 'Procession'],
      },
      {
        title: 'Irreecha – Oromo Thanksgiving Festival',
        description: 'Millions gather in vibrant traditional Oromo attire with freshly plucked green grass (Coqorsa) to thank Waaqayyo for spring blessings by sacred lakes.',
        eventDate: '2026-10-04',
        location: 'Hora Finfinnee (Addis Ababa) & Hora Harsadi (Bishoftu)',
        category: 'cultural',
        imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1000',
        isFree: true,
        isActive: true,
        status: 'upcoming',
        tags: ['Oromo', 'Thanksgiving', 'Tradition', 'Cultural'],
      },
      {
        title: 'Great Ethiopian Run 10K',
        description: 'Africa’s largest mass participation road race founded by Haile Gebrselassie, uniting 45,000+ runners across the colorful streets of Addis Ababa.',
        eventDate: '2026-11-15',
        location: 'Addis Ababa (Meskel Square)',
        category: 'sport',
        imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80&w=1000',
        price: 2500,
        isFree: false,
        isActive: true,
        status: 'upcoming',
        tags: ['Running', 'Athletics', 'Carnival', '10K'],
      }
    ];

    for (const e of events) {
      await this.eventRepo.save(this.eventRepo.create(e));
    }
    this.logger.log(`✅ Seeded ${events.length} Events`);
  }

  private async seedBlog() {
    const count = await this.blogRepo.count();
    if (count > 0) return;

    this.logger.log('🌱 Seeding initial Blog posts...');
    const posts: Partial<BlogPost>[] = [
      {
        title: 'The Ultimate 10-Day Northern Historical Circuit Itinerary',
        slug: 'ultimate-10-day-northern-circuit-itinerary',
        excerpt: 'How to perfectly link Addis Ababa, Bahir Dar, Gondar castles, Simien Mountains, and Lalibela rock churches in one seamless epic expedition.',
        content: 'Ethiopia’s Northern Circuit is one of the most culturally and geographically staggering road trips on the African continent. Start with a morning flight to Bahir Dar on the shores of Lake Tana, explore 14th-century island monasteries, then continue by private 4WD to the medieval castles of Gondar, the majestic Simien Mountains, and the sacred monolithic churches of Lalibela.',
        authorName: 'Dr. Selamawit Bekele',
        authorAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        coverImageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&q=80&w=1200',
        category: 'itinerary',
        tags: ['Itinerary', 'Historical Circuit', 'Lalibela', 'Simien', 'Gondar'],
        readTimeMinutes: 9,
        isFeatured: true,
        isPublished: true,
      },
      {
        title: 'What to Pack for Danakil Depression: An Expedition Leader’s Guide',
        slug: 'danakil-depression-packing-guide',
        excerpt: 'Surviving extreme heat, volcanic sulfur fumes, and salt dust storms in one of earth’s lowest continental rifts.',
        content: 'The Danakil Depression drops down to 125 meters below sea level with midday temperatures regularly soaring past 45°C. Packing the right hydration gear, UV protection, breathable linen layers, and sturdy volcanic trail boots is the difference between an unforgettable journey and misery.',
        authorName: 'Yared Hailu',
        authorAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        coverImageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=1200',
        category: 'tips',
        tags: ['Packing Guide', 'Danakil', 'Adventure Travel', 'Tips'],
        readTimeMinutes: 6,
        isFeatured: false,
        isPublished: true,
      }
    ];

    for (const p of posts) {
      await this.blogRepo.save(this.blogRepo.create(p));
    }
    this.logger.log(`✅ Seeded ${posts.length} Blog Posts`);
  }

  private async seedEnquiries() {
    const count = await this.enquiryRepo.count();
    if (count > 0) return;

    this.logger.log('🌱 Seeding initial Enquiries...');
    const enquiries: Partial<Enquiry>[] = [
      {
        name: 'David Miller',
        email: 'david.m@example.com',
        mobile: '+1 (555) 441-2091',
        subject: 'Private Danakil Lava Lake Expedition',
        message: 'Looking for a private 8-person charter to Danakil & Erta Ale in October.',
        status: 'unread',
      },
      {
        name: 'Claire Dupont',
        email: 'claire.d@example.fr',
        mobile: '+33 1 42 68 55 00',
        subject: 'Corporate Retreat at Wenchi Eco-Lodge',
        message: 'Inquiring about resort room block reservations for 25 executives in Oromia.',
        status: 'read',
      }
    ];

    for (const e of enquiries) {
      await this.enquiryRepo.save(this.enquiryRepo.create(e));
    }
    this.logger.log(`✅ Seeded ${enquiries.length} Enquiries`);
  }

  private async seedIssues() {
    const count = await this.issueRepo.count();
    if (count > 0) return;

    this.logger.log('🌱 Seeding initial Issues...');
    const issues: Partial<Issue>[] = [
      {
        ticketId: 'ISS-801',
        reportedBy: 'Eleanor Vance',
        email: 'eleanor.vance@example.com',
        issueType: 'Booking Issues',
        description: 'Deposit clarification for Wenchi Crater Lake tour.',
        status: 'open',
      },
      {
        ticketId: 'ISS-802',
        reportedBy: 'Liam Hemsworth',
        email: 'liam.h@example.co.uk',
        issueType: 'Cancellation',
        description: 'Requesting +2 days extension for Simien Mountains trek.',
        status: 'in_progress',
      }
    ];

    for (const i of issues) {
      await this.issueRepo.save(this.issueRepo.create(i));
    }
    this.logger.log(`✅ Seeded ${issues.length} Issues`);
  }
}
