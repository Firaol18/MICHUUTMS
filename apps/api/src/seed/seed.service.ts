import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { Tour } from '../tours/entities/tour.entity';
import { Event } from '../events/entities/event.entity';
import { BlogPost } from '../blog/entities/blog-post.entity';
import { Enquiry } from '../enquiries/entities/enquiry.entity';
import { Issue } from '../issues/entities/issue.entity';
import { Supplier } from '../suppliers/entities/supplier.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { Vehicle } from '../vehicles/entities/vehicle.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Expense } from '../expenses/entities/expense.entity';
import { Guide } from '../guides/entities/guide.entity';
import { Booking } from '../bookings/entities/booking.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Tour) private tourRepo: Repository<Tour>,
    @InjectRepository(Event) private eventRepo: Repository<Event>,
    @InjectRepository(BlogPost) private blogRepo: Repository<BlogPost>,
    @InjectRepository(Enquiry) private enquiryRepo: Repository<Enquiry>,
    @InjectRepository(Issue) private issueRepo: Repository<Issue>,
    @InjectRepository(Supplier) private supplierRepo: Repository<Supplier>,
    @InjectRepository(Driver) private driverRepo: Repository<Driver>,
    @InjectRepository(Vehicle) private vehicleRepo: Repository<Vehicle>,
    @InjectRepository(Payment) private paymentRepo: Repository<Payment>,
    @InjectRepository(Expense) private expenseRepo: Repository<Expense>,
    @InjectRepository(Guide) private guideRepo: Repository<Guide>,
    @InjectRepository(Booking) private bookingRepo: Repository<Booking>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedUsers();
    await this.seedTours();
    await this.seedEvents();
    await this.seedBlog();
    await this.seedEnquiries();
    await this.seedIssues();
    await this.seedSuppliers();
    await this.seedDrivers();
    await this.seedVehicles();
    await this.seedPayments();
    await this.seedExpenses();
    await this.seedGuides();
    await this.seedBookings();
  }

  private async seedUsers() {
    const count = await this.userRepo.count();
    if (count > 0) return;

    this.logger.log('🌱 Seeding Users...');
    const hashedPass = await bcrypt.hash('password123', 10);
    const hashedAdminPass = await bcrypt.hash('adminpass123', 10);

    const users: Partial<User>[] = [
      { name: 'Eleanor Vance', email: 'eleanor.vance@example.com', password: hashedPass, isActive: true },
      { name: 'Alex Morgan', email: 'admin@wanderlusttms.com', password: hashedAdminPass, isActive: true },
      { name: 'Alex Morgan', email: 'admin@michuutms.com', password: hashedPass, isActive: true },
      { name: 'Sophia Rossi', email: 'sophia.r@example.it', password: hashedPass, isActive: true },
      { name: 'Liam Hemsworth', email: 'liam.h@example.co.uk', password: hashedPass, isActive: true },
      { name: 'David Miller', email: 'david.m@example.com', password: hashedPass, isActive: true },
      { name: 'Sarah Jones', email: 'sarah.j@example.us', password: hashedPass, isActive: true },
      { name: 'Marcus Vance', email: 'marcus.v@example.au', password: hashedPass, isActive: true },
    ];

    for (const u of users) {
      await this.userRepo.save(this.userRepo.create(u));
    }
    this.logger.log(`✅ Seeded ${users.length} Users`);
  }

  private async seedSuppliers() {
    const count = await this.supplierRepo.count();
    if (count > 0) return;

    this.logger.log('🌱 Seeding Suppliers...');
    const suppliers: Partial<Supplier>[] = [
      {
        name: 'Kuriftu Resorts & Spa',
        category: 'Hotel & Lodge',
        location: 'Bishoftu / Bahir Dar',
        contactPerson: 'Tigist Bekele',
        phone: '+251 911 223 344',
        email: 'info@kuriftu.et',
        status: 'Active',
        rating: 4.9,
        paymentTerms: 'Net 30 Days',
        contracts: [],
      },
      {
        name: 'SkyBus Expedition Fleet',
        category: 'Transport & 4x4',
        location: 'Addis Ababa',
        contactPerson: 'Dawit Yohannes',
        phone: '+251 911 556 677',
        email: 'dispatch@skybus.et',
        status: 'Active',
        rating: 4.8,
        paymentTerms: 'Net 15 Days',
        contracts: [],
      },
      {
        name: 'Simien Eco-Lodge Catering',
        category: 'Catering',
        location: 'Gondar',
        contactPerson: 'Almaz Tadesse',
        phone: '+251 918 334 455',
        email: 'catering@simienlodge.com',
        status: 'Active',
        rating: 4.7,
        paymentTerms: 'Net 30 Days',
        contracts: [],
      },
      {
        name: 'Ethiopian Helicopters Charters',
        category: 'Aviation',
        location: 'Bole Airport',
        contactPerson: 'Capt. Solomon Worku',
        phone: '+251 911 889 900',
        email: 'charters@ethiopianheli.et',
        status: 'Active',
        rating: 5.0,
        paymentTerms: '100% Prepaid',
        contracts: [],
      },
      {
        name: 'Rift Valley Outdoor Equipment',
        category: 'Equipment',
        location: 'Addis Ababa',
        contactPerson: 'Ephrem Assefa',
        phone: '+251 912 445 566',
        email: 'gear@riftvalleygear.et',
        status: 'Active',
        rating: 4.6,
        paymentTerms: 'Net 30 Days',
        contracts: [],
      },
      {
        name: 'Highland Transport Logistics',
        category: 'Transport & 4x4',
        location: 'Addis Ababa',
        contactPerson: 'Bereket Mekonnen',
        phone: '+251 913 776 889',
        email: 'ops@highlandtransport.et',
        status: 'Active',
        rating: 4.5,
        paymentTerms: 'Net 30 Days',
        contracts: [],
      },
      {
        name: 'Ethio Telecom Cloud Services',
        category: 'Equipment',
        location: 'Addis Ababa',
        contactPerson: 'Selam Girma',
        phone: '+251 911 120 000',
        email: 'cloud@ethiotelecom.et',
        status: 'Active',
        rating: 4.2,
        paymentTerms: 'Monthly Invoice',
        contracts: [],
      },
    ];

    for (const s of suppliers) {
      await this.supplierRepo.save(this.supplierRepo.create(s));
    }
    this.logger.log(`✅ Seeded ${suppliers.length} Suppliers`);
  }

  private async seedDrivers() {
    const count = await this.driverRepo.count();
    if (count > 0) return;

    this.logger.log('🌱 Seeding Drivers...');
    const drivers: Partial<Driver>[] = [
      {
        name: 'Tesfaye Tadesse',
        licenseNumber: 'ETH-DRV-12345',
        licenseExpiry: '2028-06-30',
        licenseCategory: 'Heavy Commercial Grade A',
        assignedVehicle: 'Toyota Land Cruiser 200 Series (#AA-12345)',
        phone: '+251 911 234 567',
        email: 'tesfaye.tadesse@michuutours.et',
        experienceYears: 12,
        dailyRate: 80,
        availability: 'Available',
        status: 'Active',
        schedule: [
          { date: '2026-08-22', time: '06:00', route: 'Addis Ababa → Bahir Dar (550 km)' },
          { date: '2026-08-25', time: '09:00', route: 'Bahir Dar → Gondar (170 km)' },
        ],
      },
      {
        name: 'Kassahun Worku',
        licenseNumber: 'ETH-DRV-23456',
        licenseExpiry: '2029-03-15',
        licenseCategory: 'Heavy Commercial Grade A',
        assignedVehicle: 'Land Rover Defender 130 (#AA-23456)',
        phone: '+251 911 345 678',
        email: 'kassahun.worku@michuutours.et',
        experienceYears: 9,
        dailyRate: 70,
        availability: 'On Trip',
        status: 'Active',
        schedule: [
          { date: '2026-08-19', time: '05:30', route: 'Addis → Semera → Danakil Desert (8-hour drive)' },
        ],
      },
      {
        name: 'Girma Alemayehu',
        licenseNumber: 'ETH-DRV-34567',
        licenseExpiry: '2027-09-20',
        licenseCategory: 'Heavy Commercial Grade A',
        assignedVehicle: 'Toyota Land Cruiser Prado 4x4 (#AA-34567)',
        phone: '+251 912 456 789',
        email: 'girma.alemayehu@michuutours.et',
        experienceYears: 15,
        dailyRate: 90,
        availability: 'Available',
        status: 'Active',
        schedule: [
          { date: '2026-08-24', time: '07:00', route: 'Addis Ababa → Lalibela (domestic flight + transfer)' },
        ],
      },
      {
        name: 'Yared Mamo',
        licenseNumber: 'ETH-DRV-45678',
        licenseExpiry: '2028-12-01',
        licenseCategory: 'Standard Commercial Grade B',
        assignedVehicle: 'Unassigned (Fleet Reserve)',
        phone: '+251 913 567 890',
        email: 'yared.mamo@michuutours.et',
        experienceYears: 6,
        dailyRate: 55,
        availability: 'Off Duty',
        status: 'Active',
        schedule: [],
      },
      {
        name: 'Berhanu Haile',
        licenseNumber: 'ETH-DRV-56789',
        licenseExpiry: '2027-05-10',
        licenseCategory: 'Heavy Commercial Grade A',
        assignedVehicle: 'Nissan Patrol Super Safari (#AA-56789)',
        phone: '+251 914 678 901',
        email: 'berhanu.haile@michuutours.et',
        experienceYears: 11,
        dailyRate: 75,
        availability: 'Available',
        status: 'Active',
        schedule: [
          { date: '2026-08-26', time: '06:30', route: 'Gonder → Simien Mountains (Debark, 100 km)' },
        ],
      },
    ];

    for (const d of drivers) {
      await this.driverRepo.save(this.driverRepo.create(d));
    }
    this.logger.log(`✅ Seeded ${drivers.length} Drivers`);
  }

  private async seedVehicles() {
    const count = await this.vehicleRepo.count();
    if (count > 0) return;

    this.logger.log('🌱 Seeding Vehicles...');
    const vehicles: Partial<Vehicle>[] = [
      {
        vehicleName: 'Land Cruiser 200 — Habesha Roamer',
        plateNumber: 'AA-12345',
        model: 'Toyota Land Cruiser 200 Series',
        year: 2022,
        type: '4x4 Cruiser',
        capacity: 8,
        assignedDriver: 'Tesfaye Tadesse',
        status: 'On Trip',
        nextServiceKm: 75000,
        currentMileageKm: 68500,
        lastServiceCostUsd: 420,
        insuranceExpiry: '2027-01-31',
        inspectionExpiry: '2026-12-15',
        maintenanceHistory: [
          { date: '2026-06-01', serviceType: 'Major 60,000km Overhaul + Brake Flush', mileageKm: 60000, costUsd: 420, technician: 'Toyota Motors Ethiopia' },
        ],
      },
      {
        vehicleName: 'Defender 130 — Simien Trekker',
        plateNumber: 'AA-23456',
        model: 'Land Rover Defender 130',
        year: 2023,
        type: 'Luxury Safari',
        capacity: 9,
        assignedDriver: 'Kassahun Worku',
        status: 'On Trip',
        nextServiceKm: 30000,
        currentMileageKm: 22800,
        lastServiceCostUsd: 350,
        insuranceExpiry: '2027-06-30',
        inspectionExpiry: '2027-03-10',
        maintenanceHistory: [
          { date: '2026-05-15', serviceType: 'First 20,000km Full Service + AC Service', mileageKm: 20000, costUsd: 350, technician: 'Land Rover Ethiopia' },
        ],
      },
      {
        vehicleName: 'Prado 4x4 — Rift Ranger',
        plateNumber: 'AA-34567',
        model: 'Toyota Land Cruiser Prado',
        year: 2021,
        type: '4x4 Cruiser',
        capacity: 7,
        assignedDriver: 'Girma Alemayehu',
        status: 'Available',
        nextServiceKm: 95000,
        currentMileageKm: 91200,
        lastServiceCostUsd: 380,
        insuranceExpiry: '2026-11-20',
        inspectionExpiry: '2026-10-05',
        maintenanceHistory: [
          { date: '2026-04-10', serviceType: 'Timing Belt + Coolant Flush + Brake Pads', mileageKm: 85000, costUsd: 380, technician: 'Prado Service Center Addis' },
        ],
      },
      {
        vehicleName: 'Patrol Safari — Desert Viper',
        plateNumber: 'AA-56789',
        model: 'Nissan Patrol Super Safari Y62',
        year: 2020,
        type: '4x4 Cruiser',
        capacity: 8,
        assignedDriver: 'Berhanu Haile',
        status: 'Available',
        nextServiceKm: 110000,
        currentMileageKm: 107500,
        lastServiceCostUsd: 550,
        insuranceExpiry: '2026-09-15',
        inspectionExpiry: '2026-08-30',
        maintenanceHistory: [
          { date: '2026-03-20', serviceType: 'Full Engine Tune-Up + Suspension Realignment', mileageKm: 100000, costUsd: 550, technician: 'Nissan Authorized Workshop' },
        ],
      },
      {
        vehicleName: 'Transit Expedition — Crater Shuttle',
        plateNumber: 'AA-67890',
        model: 'Ford Transit Expedition Custom',
        year: 2023,
        type: 'Minibus',
        capacity: 14,
        assignedDriver: 'Yared Mamo',
        status: 'Maintenance',
        nextServiceKm: 28000,
        currentMileageKm: 21000,
        lastServiceCostUsd: 210,
        insuranceExpiry: '2027-05-15',
        inspectionExpiry: '2027-04-10',
        maintenanceHistory: [
          { date: '2026-05-20', serviceType: 'Initial 5,000km Factory Warranty Maintenance', mileageKm: 5000, costUsd: 210, technician: 'Ford Motors Ethiopia' },
        ],
      },
    ];

    for (const v of vehicles) {
      await this.vehicleRepo.save(this.vehicleRepo.create(v));
    }
    this.logger.log(`✅ Seeded ${vehicles.length} Vehicles`);
  }

  private async seedPayments() {
    const count = await this.paymentRepo.count();
    if (count > 0) return;

    this.logger.log('🌱 Seeding Payments...');
    const payments: Partial<Payment>[] = [
      {
        transactionRef: 'TX-2026-9918',
        bookingRef: 'BK-00125',
        customerName: 'John Smith',
        amount: 500,
        currency: 'USD',
        paymentMethod: 'Mobile Money',
        status: 'Partially Paid',
        description: 'Deposit — Wenchi Crater Lake Expedition',
      },
      {
        transactionRef: 'TX-2026-9102',
        bookingRef: 'BK-00125',
        customerName: 'John Smith',
        amount: 1000,
        currency: 'USD',
        paymentMethod: 'Credit/Debit Card',
        status: 'Partially Paid',
        description: 'Partial Payment — Wenchi Crater Lake Expedition',
      },
      {
        transactionRef: 'TX-2026-7710',
        bookingRef: 'BK-00126',
        customerName: 'Sarah Jones',
        amount: 1200,
        currency: 'USD',
        paymentMethod: 'Bank Transfer',
        status: 'Paid',
        description: 'Deposit — Danakil Depression Expedition',
      },
      {
        transactionRef: 'TX-2026-8829',
        bookingRef: 'BK-00126',
        customerName: 'Sarah Jones',
        amount: 2600,
        currency: 'USD',
        paymentMethod: 'Online Payment',
        status: 'Paid',
        description: 'Final Balance — Danakil Depression Expedition',
      },
      {
        transactionRef: 'TX-2026-6610',
        bookingRef: 'BK-00127',
        customerName: 'David Brown',
        amount: 500,
        currency: 'USD',
        paymentMethod: 'Cash',
        status: 'Partially Paid',
        description: 'Cash Deposit at HQ — Lalibela Heritage Tour',
      },
      {
        transactionRef: 'TX-2026-4410',
        bookingRef: 'BK-00129',
        customerName: 'Marcus Vance',
        amount: 1600,
        currency: 'USD',
        paymentMethod: 'Bank Transfer',
        status: 'Refunded',
        description: 'Full Booking Refund — Simien Mountains Trek (Cancelled)',
      },
    ];

    for (const p of payments) {
      await this.paymentRepo.save(this.paymentRepo.create(p));
    }
    this.logger.log(`✅ Seeded ${payments.length} Payments`);
  }

  private async seedExpenses() {
    const count = await this.expenseRepo.count();
    if (count > 0) return;

    this.logger.log('🌱 Seeding Expenses...');
    const expenses: Partial<Expense>[] = [
      {
        expenseNumber: 'EXP-2026-9001',
        category: 'Accommodation',
        description: 'Luxury eco-lodge accommodation for Wenchi Crater Lake 3-night expedition',
        amount: 2400,
        currency: 'USD',
        expenseDate: '2026-08-12',
        department: 'Kuriftu Resorts & Spa',
        recordedBy: 'Tesfaye Admin',
        status: 'approved',
      },
      {
        expenseNumber: 'EXP-2026-9002',
        category: 'Transportation',
        description: 'Transport fleet convoy 4x4 Land Cruisers — Lalibela expedition dispatch',
        amount: 1200,
        currency: 'USD',
        expenseDate: '2026-08-11',
        department: 'Highland Transport Logistics',
        recordedBy: 'Tesfaye Admin',
        status: 'approved',
      },
      {
        expenseNumber: 'EXP-2026-9003',
        category: 'Guide Salary',
        description: 'Lead ranger guide daily stipend & hazard allowance — Danakil',
        amount: 500,
        currency: 'USD',
        expenseDate: '2026-08-10',
        department: 'Operations',
        recordedBy: 'Tesfaye Admin',
        status: 'approved',
      },
      {
        expenseNumber: 'EXP-2026-9004',
        category: 'Food',
        description: 'Traditional habesha cultural buffet dinners & wine tasting — group of 12',
        amount: 600,
        currency: 'USD',
        expenseDate: '2026-08-09',
        department: 'Yod Abyssinia Cultural Restaurant',
        recordedBy: 'Tesfaye Admin',
        status: 'approved',
      },
      {
        expenseNumber: 'EXP-2026-9005',
        category: 'Fuel',
        description: 'Diesel fuel refill for 4x4 expedition vehicles — Simien Mountain convoy',
        amount: 300,
        currency: 'USD',
        expenseDate: '2026-08-08',
        department: 'TotalEnergies Station',
        recordedBy: 'Tesfaye Admin',
        status: 'approved',
      },
      {
        expenseNumber: 'EXP-2026-9006',
        category: 'Marketing',
        description: 'Digital tourism campaign & Google Search Ads — August 2026 promotion',
        amount: 850,
        currency: 'USD',
        expenseDate: '2026-08-05',
        department: 'Global Digital Media Corp',
        recordedBy: 'Tesfaye Admin',
        status: 'approved',
      },
      {
        expenseNumber: 'EXP-2026-9007',
        category: 'Office',
        description: 'HQ high-speed fiber broadband & cloud server hosting — monthly',
        amount: 420,
        currency: 'USD',
        expenseDate: '2026-08-02',
        department: 'Ethio Telecom Cloud Services',
        recordedBy: 'Tesfaye Admin',
        status: 'pending',
      },
    ];

    for (const e of expenses) {
      await this.expenseRepo.save(this.expenseRepo.create(e));
    }
    this.logger.log(`✅ Seeded ${expenses.length} Expenses`);
  }

  private async seedGuides() {
    const count = await this.guideRepo.count();
    if (count > 0) return;

    this.logger.log('🌱 Seeding Guides...');
    const guides: Partial<Guide>[] = [
      {
        name: 'Abebe Bekele',
        email: 'abebe.bekele@michuutours.et',
        phone: '+251 911 100 200',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150',
        tier: 'Senior Expedition Master',
        rating: 4.98,
        toursGuidedCount: 312,
        languages: ['English', 'Amharic', 'Oromifaa', 'French'],
        specializations: ['Mountain Trekking', 'Cultural Heritage', 'Eco-Tourism'],
        certifications: [
          { name: 'Ministry of Tourism — Grade A License', issuedBy: 'Ethiopia MoCT', issueDate: '2019-03-01', expiryDate: '2027-03-01' },
        ],
        availability: [],
        paymentHistory: [],
        dailyRate: 120,
        availabilityStatus: 'Available',
        status: 'Active',
      },
      {
        name: 'Mohammed Ahmed',
        email: 'mohammed.ahmed@michuutours.et',
        phone: '+251 912 200 300',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150',
        tier: 'Senior Expedition Master',
        rating: 4.96,
        toursGuidedCount: 198,
        languages: ['English', 'Amharic', 'Afar', 'Arabic'],
        specializations: ['Extreme Terrain', 'Danakil Depression', 'Desert Survival'],
        certifications: [
          { name: 'Extreme Terrain Specialist License', issuedBy: 'Ethiopia MoCT', issueDate: '2020-01-15', expiryDate: '2028-01-15' },
        ],
        availability: [],
        paymentHistory: [],
        dailyRate: 140,
        availabilityStatus: 'On Tour',
        status: 'Active',
      },
      {
        name: 'Tewodros Kassahun',
        email: 'tewodros.k@michuutours.et',
        phone: '+251 913 300 400',
        avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150',
        tier: 'Senior Expedition Master',
        rating: 4.97,
        toursGuidedCount: 241,
        languages: ['English', 'Amharic', 'Tigrinya', 'Italian'],
        specializations: ['Historical Heritage', 'Rock-Hewn Churches', 'Cultural Anthropology'],
        certifications: [
          { name: 'UNESCO Heritage Site Expert License', issuedBy: 'Ethiopia MoCT', issueDate: '2018-06-01', expiryDate: '2026-06-01' },
        ],
        availability: [],
        paymentHistory: [],
        dailyRate: 130,
        availabilityStatus: 'Available',
        status: 'Active',
      },
      {
        name: 'Girma Assefa',
        email: 'girma.assefa@michuutours.et',
        phone: '+251 914 400 500',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150',
        tier: 'Expedition Leader',
        rating: 4.93,
        toursGuidedCount: 158,
        languages: ['English', 'Amharic', 'German'],
        specializations: ['Wildlife Safari', 'Simien Mountains', 'Bird Watching'],
        certifications: [
          { name: 'Wildlife & Ecology Field Guide License', issuedBy: 'EWCA Ethiopia', issueDate: '2021-09-01', expiryDate: '2029-09-01' },
        ],
        availability: [],
        paymentHistory: [],
        dailyRate: 100,
        availabilityStatus: 'Available',
        status: 'Active',
      },
      {
        name: 'Tigist Alemu',
        email: 'tigist.alemu@michuutours.et',
        phone: '+251 915 500 600',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150',
        tier: 'Junior Ranger',
        rating: 4.85,
        toursGuidedCount: 44,
        languages: ['English', 'Amharic', 'Oromifaa'],
        specializations: ['Cultural Tourism', 'Traditional Cuisine', 'Community Tours'],
        certifications: [
          { name: 'Tourism Guide License — Grade B', issuedBy: 'Ethiopia MoCT', issueDate: '2023-04-01', expiryDate: '2027-04-01' },
        ],
        availability: [],
        paymentHistory: [],
        dailyRate: 60,
        availabilityStatus: 'Available',
        status: 'Active',
      },
    ];

    for (const g of guides) {
      await this.guideRepo.save(this.guideRepo.create(g));
    }
    this.logger.log(`✅ Seeded ${guides.length} Guides`);
  }

  private async seedTours() {
    const count = await this.tourRepo.count();
    if (count > 0) return;

    this.logger.log('🌱 Seeding Tours...');
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
        destinationDescription: 'Breathtaking volcanic crater lake surrounded by lush alpine greenery, hot mineral springs, and island monasteries.',
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
        ],
        included: ['Luxury eco-lodge accommodation', 'All meals', 'Horseback riding guides', 'Park permits'],
        excluded: ['Airport transfers', 'Alcoholic beverages', 'Personal insurance'],
        itinerary: [
          { dayNumber: 1, title: 'Scenic Drive to Ambo & Crater Rim', description: 'Depart Addis Ababa through the Great Rift Valley.' },
          { dayNumber: 2, title: 'Equestrian Trails & Island Monastery', description: 'Mount horses for descent to lakeside.' },
          { dayNumber: 3, title: 'Hot Springs Walk & Return', description: 'Dawn nature walk past thermal springs.' },
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
        summary: 'Journey into the planet\'s lowest continental trench, hike Erta Ale volcano, cross acid pools at Dallol, and witness camel salt caravans.',
        destinationName: 'Danakil Depression & Erta Ale',
        destinationCountry: 'Ethiopia',
        destinationRegion: 'Afar Region',
        destinationImageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=1000',
        destinationDescription: 'One of the lowest and hottest places on Earth with neon Dallol springs and active lava lakes.',
        pricePerPerson: 88000,
        originalPrice: 95000,
        discountPercent: 7,
        durationDays: 4,
        maxGroupSize: 8,
        difficulty: 'extreme',
        rating: 4.98,
        reviewCount: 94,
        imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=1000',
        galleryImages: ['https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=1000'],
        included: ['Heavy-duty 4x4 Land Cruisers', 'Full desert camp setup', 'Armed scout protection', 'Cook team'],
        excluded: ['Domestic flights', 'Personal insurance', 'Sleeping bags'],
        itinerary: [
          { dayNumber: 1, title: 'Semera to Afdera Salt Lake', description: 'Drive through volcanic basalt fields.' },
          { dayNumber: 2, title: 'Erta Ale Lava Lake Night Trek', description: 'Hike the active volcano at sunset.' },
          { dayNumber: 3, title: 'Neon Mineral Springs of Dallol', description: 'Visit otherworldly geothermal fields.' },
          { dayNumber: 4, title: 'Salt Miners & Return', description: 'Witness traditional salt extractors.' },
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
        summary: 'Explore the world\'s most magnificent rock-cut architectural marvels, subterranean catacombs, and ancient Ge\'ez chanting ceremonies.',
        destinationName: 'Lalibela Rock Churches',
        destinationCountry: 'Ethiopia',
        destinationRegion: 'Amhara Region',
        destinationImageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&q=80&w=1000',
        destinationDescription: 'UNESCO World Heritage site with 11 monolithic churches carved from solid red basalt.',
        pricePerPerson: 52000,
        durationDays: 3,
        maxGroupSize: 15,
        difficulty: 'easy',
        rating: 4.96,
        reviewCount: 112,
        imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&q=80&w=1000',
        galleryImages: ['https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&q=80&w=1000'],
        included: ['Boutique hotel', 'All breakfasts & dinners', 'Licensed historian guide', 'Church admission passes'],
        excluded: ['Domestic flights', 'Camera permits', 'Tips'],
        itinerary: [
          { dayNumber: 1, title: 'Arrival & Northern Group', description: 'Tour Bet Medhane Alem and Bet Maryam.' },
          { dayNumber: 2, title: 'Southeastern Group & Bet Giyorgis', description: 'Cross-shaped Bet Giyorgis, most iconic church.' },
          { dayNumber: 3, title: 'Yimrhane Kristos & Departure', description: 'Cave church inside a massive natural cave.' },
        ],
        isFeatured: true,
        status: 'active',
        assignedGuideName: 'Tewodros Kassahun',
      },
      {
        title: 'Simien Mountains Roof of Africa Trek & Wildlife Safari',
        slug: 'simien-mountains-roof-of-africa-trek',
        category: 'safari',
        summary: 'Traverse dramatic escarpments, encounter Gelada baboons, Walia ibex, and marvel at Jinbar waterfall plunges.',
        destinationName: 'Simien Mountains National Park',
        destinationCountry: 'Ethiopia',
        destinationRegion: 'Gonder / Amhara',
        destinationImageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000',
        destinationDescription: 'Dramatic serrated escarpments with endemic Gelada baboon troops and Ras Dashen peak.',
        pricePerPerson: 75000,
        originalPrice: 85000,
        discountPercent: 11,
        durationDays: 5,
        maxGroupSize: 10,
        difficulty: 'challenging',
        rating: 4.92,
        reviewCount: 68,
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000',
        galleryImages: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000'],
        included: ['Park scout & wildlife tracker', 'Camping gear', 'Mountain chef', 'Mule logistics'],
        excluded: ['Warm clothing', 'Trekking poles', 'Personal medication'],
        itinerary: [
          { dayNumber: 1, title: 'Gonder to Debark & Sankaber', description: 'Drive to park HQ, acclimation hike.' },
          { dayNumber: 2, title: 'Sankaber to Geech via Jinbar Falls', description: 'Trek along 800m cliff edges.' },
          { dayNumber: 3, title: 'Imet Gogo Summit (3,926m)', description: 'Pre-dawn summit for panoramic views.' },
          { dayNumber: 4, title: 'Bwahit Peak & Walia Ibex', description: 'Endangered ibex spotting at 4,430m.' },
          { dayNumber: 5, title: 'Return to Gonder', description: 'Scenic 4WD drive back with farewell lunch.' },
        ],
        isFeatured: false,
        status: 'active',
        offerTag: 'Adventure Pick',
        hasOffer: true,
        assignedGuideName: 'Girma Assefa',
      },
    ];

    for (const t of tours) {
      await this.tourRepo.save(this.tourRepo.create(t));
    }
    this.logger.log(`✅ Seeded ${tours.length} Tours`);
  }

  private async seedEvents() {
    const count = await this.eventRepo.count();
    if (count > 0) return;

    this.logger.log('🌱 Seeding Events...');
    const events: Partial<Event>[] = [
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
        status: 'upcoming',
        tags: ['Addis Ababa (Finfinnee)', 'Meskerem 17 (መስከረም ፲፯)', 'UNESCO', 'Demera'],
      },
      {
        title: 'Irreecha Malkaa Finfinnee – Oromo Thanksgiving',
        eventDate: '2026-10-03',
        endDate: undefined,
        location: 'Hora Finfinnee (Near Meskel Square & ECA), Finfinnee (Addis Ababa (Finfinnee))',
        category: 'cultural',
        description: 'The historic urban Irreecha celebration held at the heart of Finfinnee (Addis Ababa). Millions of Oromo pilgrims from across Oromia and the diaspora gather in vibrant traditional attire at Hora Finfinnee to dip wet green grass into the water, give thanks to Waaqa (God), and welcome the blossoming spring season.',
        imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1000',
        isActive: true,
        isFree: true,
        status: 'upcoming',
        tags: ['Addis Ababa (Finfinnee)', 'Meskerem 23 (መስከረም ፳፫)', 'Oromo', 'Thanksgiving'],
      },
      {
        title: 'Irreecha Malkaa Arsedi – Grand Lake Thanksgiving',
        eventDate: '2026-10-04',
        endDate: undefined,
        location: 'Lake Hora Arsedi, Bishoftu (Debre Zeit) (Oromia)',
        category: 'cultural',
        description: 'The colossal climax of Irreecha thanksgiving celebrated at the sacred volcanic Lake Hora Arsedi in Bishoftu. Abbaa Gadaas (Gadaa leaders) and Haadha Siinqees lead sacred prayers of gratitude at the lakefront with horses, singing, and Adey Abeba flowers.',
        imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1000',
        isActive: true,
        isFree: true,
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
        isActive: false,
        isFree: true,
        status: 'upcoming',
        tags: ['Harari', 'Miyazya 2 (ሚያዝያ ፪)', 'Harar', 'Jugol'],
      },
      {
        title: 'Hamar Bull Jumping Rite of Passage (Ukuli Bula)',
        eventDate: '2026-11-15',
        endDate: undefined,
        location: 'Turmi & Dimeka, Lower Omo Valley (Southern Ethiopia)',
        category: 'cultural',
        description: 'An ancient rite of passage ceremony where young Hamar men run across the backs of castrated bulls four times to prove their manhood and gain permission to marry, surrounded by Evangadi nighttime dancing.',
        imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=1000',
        isActive: false,
        isFree: true,
        status: 'upcoming',
        tags: ['Southern Ethiopia', 'Hidar 6 (ኅዳር ፮)', 'Omo Valley', 'Tradition'],
      },
      {
        title: 'Dallol & Erta Ale Salt Caravan Gathering',
        eventDate: '2026-12-10',
        endDate: undefined,
        location: 'Lake Karum (Assale) & Dallol, Afar Depression (Afar)',
        category: 'nature',
        description: 'Gathering of hundreds of traditional camel salt caravans across the blinding white salt flats of Lake Karum in Afar, where miners extract salt slabs using ancient hand tools beneath glowing volcanic horizons.',
        imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=1000',
        isActive: false,
        isFree: true,
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
        isActive: false,
        isFree: true,
        status: 'upcoming',
        tags: ['Central Ethiopia', 'Meskerem 16–20 (መስከረም ፲፮–፳)', 'Gurage', 'Harvest'],
      },
      {
        title: 'Kaffa Wild Rainforest Coffee Origin Festival',
        eventDate: '2026-12-05',
        endDate: undefined,
        location: 'Bonga & Harenna Forest (South West Ethiopia)',
        category: 'food',
        description: 'Held in the birthplace of Arabica coffee (Kaffa Biosphere Reserve). Local forest communities demonstrate ancient harvesting of wild canopy coffee beans followed by authentic multi-round Bunna brewing ceremonies.',
        imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1000',
        isActive: false,
        isFree: true,
        status: 'upcoming',
        tags: ['South West Ethiopia', 'Hidar 26 (ኅዳር ፮)', 'Coffee', 'Kaffa'],
      },
      {
        title: 'Great Ethiopian Run (10k International Road Race)',
        eventDate: '2026-11-22',
        endDate: undefined,
        location: 'Meskel Square & Bole Rd, Finfinnee (Addis Ababa (Finfinnee))',
        category: 'sport',
        description: "Africa's largest road race founded by Olympic champion Haile Gebrselassie. Over 45,000 international and local runners take over the high-altitude streets of Finfinnee (Addis Ababa) in an electrifying street carnival.",
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1000',
        isActive: false,
        isFree: false,
        price: 3000,
        status: 'upcoming',
        tags: ['Addis Ababa (Finfinnee)', 'Hidar 13 (ኅዳር ፲፫)', 'Running', '10K'],
      },
      {
        title: 'Enkutatash – Ethiopian New Year Celebration',
        eventDate: '2026-09-11',
        endDate: undefined,
        location: 'Addis Ababa (Finfinnee) & Nationwide (Nationwide)',
        category: 'cultural',
        description: 'Celebrates the arrival of spring sunshine after 3 months of rainy season. Children sing traditional songs with yellow Adey Abeba daisies while families feast on Doro Wot and freshly brewed Ethiopian coffee.',
        imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&q=80&w=1000',
        isActive: false,
        isFree: true,
        status: 'upcoming',
        tags: ['Nationwide', 'Meskerem 1 (መስከረም ፩)', 'New Year'],
      },
    ];

    for (const e of events) {
      await this.eventRepo.save(this.eventRepo.create(e));
    }
    this.logger.log(`✅ Seeded ${events.length} Events`);
  }

  private async seedBlog() {
    const count = await this.blogRepo.count();
    if (count > 0) return;

    this.logger.log('🌱 Seeding Blog posts...');
    const posts: Partial<BlogPost>[] = [
      {
        title: 'The Ultimate 10-Day Northern Historical Circuit Itinerary',
        slug: 'ultimate-10-day-northern-circuit-itinerary',
        excerpt: 'How to perfectly link Addis Ababa, Bahir Dar, Gondar, Simien Mountains, and Lalibela in one seamless epic expedition.',
        content: 'Ethiopia\'s Northern Circuit is one of the most culturally staggering road trips on the African continent. Start with a morning flight to Bahir Dar, explore 14th-century island monasteries, then continue by private 4WD to the medieval castles of Gondar, the majestic Simien Mountains, and the sacred monolithic churches of Lalibela.',
        authorName: 'Dr. Selamawit Bekele',
        authorAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
        coverImageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&q=80&w=1200',
        category: 'itinerary',
        tags: ['Itinerary', 'Historical', 'Lalibela', 'Simien'],
        readTimeMinutes: 9,
        isFeatured: true,
        isPublished: true,
      },
      {
        title: 'What to Pack for Danakil Depression: An Expedition Leader\'s Guide',
        slug: 'danakil-depression-packing-guide',
        excerpt: 'Surviving extreme heat, volcanic fumes, and salt dust storms in one of earth\'s lowest continental rifts.',
        content: 'The Danakil Depression drops to 125 meters below sea level with midday temperatures past 45°C. Packing the right hydration gear, UV protection, and volcanic trail boots is essential.',
        authorName: 'Yared Hailu',
        authorAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
        coverImageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=1200',
        category: 'tips',
        tags: ['Packing Guide', 'Danakil', 'Adventure Travel'],
        readTimeMinutes: 6,
        isFeatured: false,
        isPublished: true,
      },
    ];

    for (const p of posts) {
      await this.blogRepo.save(this.blogRepo.create(p));
    }
    this.logger.log(`✅ Seeded ${posts.length} Blog Posts`);
  }

  private async seedEnquiries() {
    const count = await this.enquiryRepo.count();
    if (count > 0) return;

    this.logger.log('🌱 Seeding Enquiries...');
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
        message: 'Inquiring about room block reservations for 25 executives in Oromia.',
        status: 'read',
      },
      {
        name: 'James Okonkwo',
        email: 'james.o@example.ng',
        mobile: '+234 802 234 5678',
        subject: 'Honeymoon Package — Lalibela & Simien',
        message: 'Looking for a romantic 7-day private honeymoon combining Lalibela and Simien Mountains.',
        status: 'unread',
      },
    ];

    for (const e of enquiries) {
      await this.enquiryRepo.save(this.enquiryRepo.create(e));
    }
    this.logger.log(`✅ Seeded ${enquiries.length} Enquiries`);
  }

  private async seedIssues() {
    const count = await this.issueRepo.count();
    if (count > 0) return;

    this.logger.log('🌱 Seeding Issues...');
    const issues: Partial<Issue>[] = [
      {
        ticketId: 'ISS-801',
        reportedBy: 'Eleanor Vance',
        email: 'eleanor.vance@example.com',
        issueType: 'Booking Issues',
        description: 'Deposit clarification for Wenchi Crater Lake tour — payment receipt not received.',
        status: 'open',
      },
      {
        ticketId: 'ISS-802',
        reportedBy: 'Liam Hemsworth',
        email: 'liam.h@example.co.uk',
        issueType: 'Cancellation',
        description: 'Requesting +2 days extension for Simien Mountains trek due to flight delay.',
        status: 'in_progress',
      },
      {
        ticketId: 'ISS-803',
        reportedBy: 'Sarah Jones',
        email: 'sarah.j@example.us',
        issueType: 'Guide Assignment',
        description: 'Requesting a French-speaking guide for the Lalibela Heritage Trail.',
        status: 'resolved',
      },
    ];

    for (const i of issues) {
      await this.issueRepo.save(this.issueRepo.create(i));
    }
    this.logger.log(`✅ Seeded ${issues.length} Issues`);
  }

  private async seedBookings() {
    const count = await this.bookingRepo.count();
    if (count > 0) return;

    this.logger.log('🌱 Seeding Bookings...');
    const bookings = [
      {
        bookingReference: 'MCH-BKG-8819',
        tourTitle: 'Wenchi Crater Lake Eco-Resort & Equestrian Expedition',
        destinationName: 'Wenchi Crater Lake, Oromia Region',
        traveler: {
          name: 'Eleanor Vance',
          email: 'eleanor.vance@example.com',
          phone: '+251 91 123 4567',
          nationality: 'Ethiopia / US',
          specialRequests: 'Vegetarian meal plan requested for Day 2 boat tour.',
        },
        travelDate: '2026-09-15',
        numberOfTravelers: 2,
        numberOfAdults: 2,
        numberOfChildren: 0,
        totalPrice: 900,
        status: 'confirmed' as const,
        paymentStatus: 'paid' as const,
        refundStatus: 'none' as const,
        assignedGuideName: 'Abebe Bekele',
        assignedGuideId: 'gd-1',
      },
      {
        bookingReference: 'MCH-BKG-4412',
        tourTitle: 'Lalibela World Heritage Monolithic Rock Churches Pilgrimage',
        destinationName: 'Lalibela Rock Churches, Amhara Region',
        traveler: {
          name: 'Liam Hemsworth',
          email: 'liam.h@example.co.uk',
          phone: '+44 20 7946 0912',
          nationality: 'United Kingdom',
          specialRequests: 'Wheelchair accessible transport required.',
        },
        travelDate: '2026-10-01',
        numberOfTravelers: 3,
        numberOfAdults: 2,
        numberOfChildren: 1,
        totalPrice: 2550,
        status: 'pending' as const,
        paymentStatus: 'unpaid' as const,
        refundStatus: 'none' as const,
        assignedGuideName: 'Tigist Assefa',
        assignedGuideId: 'gd-2',
      },
      {
        bookingReference: 'MCH-BKG-1109',
        tourTitle: 'Simien Mountains Walia Ibex & Ras Dashen Trek',
        destinationName: 'Simien Mountains, Amhara Region',
        traveler: {
          name: 'Sophia Rossi',
          email: 'sophia.r@example.it',
          phone: '+39 06 698 12345',
          nationality: 'Italy',
          specialRequests: 'High-altitude sleeping bag rental.',
        },
        travelDate: '2026-09-28',
        numberOfTravelers: 1,
        numberOfAdults: 1,
        numberOfChildren: 0,
        totalPrice: 1200,
        status: 'completed' as const,
        paymentStatus: 'paid' as const,
        refundStatus: 'none' as const,
        assignedGuideName: 'Biruk Tadesse',
        assignedGuideId: 'gd-3',
      },
    ];

    for (const b of bookings) {
      await this.bookingRepo.save(this.bookingRepo.create(b));
    }
    this.logger.log(`✅ Seeded ${bookings.length} Bookings`);
  }
}
