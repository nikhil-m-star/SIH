import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const pool = new Pool({ connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.cooperativeTransaction.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.workerSkill.deleteMany();
  await prisma.workerProfile.deleteMany();
  await prisma.service.deleteMany();
  await prisma.cooperativeConfig.deleteMany();
  await prisma.user.deleteMany();

  // Create Services
  const services = await Promise.all([
    prisma.service.create({
      data: { name: "Plumbing", description: "Pipes, leaks, fixtures, and water systems", icon: "🔧", basePrice: 500 },
    }),
    prisma.service.create({
      data: { name: "Electrical", description: "Wiring, switches, faults, and installations", icon: "⚡", basePrice: 600 },
    }),
    prisma.service.create({
      data: { name: "AC Repair", description: "Cooling systems, maintenance, and installation", icon: "❄️", basePrice: 800 },
    }),
    prisma.service.create({
      data: { name: "Cleaning", description: "Deep cleaning, sanitization, and maintenance", icon: "🧹", basePrice: 400 },
    }),
    prisma.service.create({
      data: { name: "Carpentry", description: "Furniture repair, woodwork, and installations", icon: "🪚", basePrice: 700 },
    }),
  ]);

  console.log(`✅ Created ${services.length} services`);

  // Create Cooperative Config
  await prisma.cooperativeConfig.create({
    data: { workerSharePct: 90, welfarePct: 5, trainingPct: 2, cooperativePct: 3 },
  });

  console.log("✅ Created cooperative config");

  // Create Customers
  const customerNames = [
    "Priya Sharma", "Rahul Gupta", "Anita Patel", "Vikram Singh", "Meera Iyer",
    "Arjun Reddy", "Kavita Desai", "Suresh Kumar", "Neha Joshi", "Arun Nair",
  ];

  const customers = await Promise.all(
    customerNames.map((name, i) =>
      prisma.user.create({
        data: {
          clerkId: `seed_customer_${i}`,
          email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
          name,
          role: "CUSTOMER",
        },
      })
    )
  );

  console.log(`✅ Created ${customers.length} customers`);

  // Create Workers
  const workerData = [
    { name: "Rajesh Verma", bio: "15 years of plumbing experience. Specializing in residential repairs.", lat: 12.9716, lon: 77.5946 },
    { name: "Sunil Yadav", bio: "Certified electrician with expertise in home wiring.", lat: 12.9352, lon: 77.6245 },
    { name: "Manoj Tiwari", bio: "AC specialist. All brands serviced.", lat: 12.9856, lon: 77.5643 },
    { name: "Deepak Shah", bio: "Professional cleaner. Commercial and residential.", lat: 12.9623, lon: 77.6089 },
    { name: "Ramesh Rao", bio: "Master carpenter. 20 years experience.", lat: 12.9450, lon: 77.5780 },
    { name: "Amit Patel", bio: "Multi-skilled worker. Plumbing and carpentry.", lat: 12.9782, lon: 77.6134 },
    { name: "Vijay Kumar", bio: "Electrical and AC repair specialist.", lat: 12.9534, lon: 77.5509 },
    { name: "Sanjay Mishra", bio: "Expert in deep cleaning services.", lat: 12.9901, lon: 77.5812 },
    { name: "Prakash Jain", bio: "All-round handyman. Reliable and punctual.", lat: 12.9345, lon: 77.6190 },
    { name: "Ganesh Naik", bio: "Plumbing and electrical expert.", lat: 12.9678, lon: 77.5401 },
    { name: "Harish Gowda", bio: "AC installation and repair.", lat: 12.9890, lon: 77.5990 },
    { name: "Kiran Deshmukh", bio: "Residential cleaning specialist.", lat: 12.9412, lon: 77.5870 },
    { name: "Naveen Reddy", bio: "Furniture maker and repair.", lat: 12.9567, lon: 77.6301 },
    { name: "Ravi Shankar", bio: "Senior plumber. 18 years experience.", lat: 12.9723, lon: 77.5523 },
    { name: "Mohan Das", bio: "Licensed electrician. Quick response.", lat: 12.9834, lon: 77.6078 },
    { name: "Venkat Rao", bio: "AC and refrigeration expert.", lat: 12.9489, lon: 77.5745 },
    { name: "Krishna Murthy", bio: "Home and office cleaning.", lat: 12.9601, lon: 77.6200 },
    { name: "Ashok Sharma", bio: "Carpentry and furniture repair.", lat: 12.9756, lon: 77.5634 },
    { name: "Dinesh Gupta", bio: "Plumbing repairs. Available 24/7.", lat: 12.9345, lon: 77.5912 },
    { name: "Suresh Babu", bio: "Electrical maintenance and installations.", lat: 12.9912, lon: 77.6145 },
  ];

  const workers = [];
  for (let i = 0; i < workerData.length; i++) {
    const wd = workerData[i];
    const user = await prisma.user.create({
      data: {
        clerkId: `seed_worker_${i}`,
        email: `${wd.name.toLowerCase().replace(" ", ".")}@worker.example.com`,
        name: wd.name,
        role: "WORKER",
      },
    });

    const completedJobs = Math.floor(Math.random() * 80) + 5;
    const rating = Math.round((3.5 + Math.random() * 1.5) * 10) / 10;
    const totalEarnings = completedJobs * (400 + Math.floor(Math.random() * 600));

    const profile = await prisma.workerProfile.create({
      data: {
        userId: user.id,
        bio: wd.bio,
        latitude: wd.lat + (Math.random() - 0.5) * 0.05,
        longitude: wd.lon + (Math.random() - 0.5) * 0.05,
        rating,
        completedJobs,
        totalEarnings,
        verificationStatus: i < 16 ? "VERIFIED" : "PENDING",
        isAvailable: Math.random() > 0.2,
      },
    });

    // Assign 1-3 skills
    const skillCount = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...services].sort(() => Math.random() - 0.5);
    for (let j = 0; j < skillCount; j++) {
      await prisma.workerSkill.create({
        data: {
          workerId: profile.id,
          serviceId: shuffled[j].id,
          experienceYears: Math.floor(Math.random() * 15) + 1,
        },
      });
    }

    workers.push({ user, profile });
  }

  console.log(`✅ Created ${workers.length} workers with profiles and skills`);

  // Create Admin
  await prisma.user.create({
    data: {
      clerkId: "seed_admin_0",
      email: "admin@sevaconnect.example.com",
      name: "Admin User",
      role: "ADMIN",
    },
  });

  console.log("✅ Created admin user");

  // Create Bookings
  const statuses = ["COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED",
    "IN_PROGRESS", "ACCEPTED", "PENDING", "CANCELLED"] as const;

  const descriptions = [
    "Kitchen sink is leaking badly",
    "Need to install new ceiling fan",
    "AC not cooling properly, making strange noise",
    "Full house deep cleaning needed",
    "Broken door hinge needs replacement",
    "Bathroom tap is dripping",
    "Power outlet not working in bedroom",
    "AC servicing and gas refill needed",
    "Office cleaning required",
    "New wooden shelf installation",
    "Water heater not working",
    "Switchboard replacement needed",
    "Split AC installation",
    "Post-renovation cleaning",
    "Kitchen cabinet repair",
    "Pipe burst in bathroom",
    "Electrical short circuit issue",
    "Window AC repair",
    "Carpet cleaning needed",
    "Furniture polish and repair",
    "Toilet flush mechanism broken",
    "UPS wiring installation",
    "AC filter cleaning and maintenance",
    "Garden area cleaning",
    "Wooden door frame repair",
    "Washing machine inlet pipe leak",
    "MCB tripping frequently",
    "Portable AC repair",
    "Sofa cleaning required",
    "Bookshelf assembly needed",
    "Main water line repair",
    "LED panel light installation",
    "Ductable AC maintenance",
    "Terrace cleaning and waterproofing",
    "Dining table repair",
  ];

  let bookingCount = 0;
  for (let i = 0; i < 35; i++) {
    const status = statuses[i % statuses.length];
    const customer = customers[i % customers.length];
    const worker = workers[i % workers.length];
    const service = services[i % services.length];

    const estimatedPrice = service.basePrice + Math.floor(Math.random() * 500);
    const daysAgo = Math.floor(Math.random() * 60);
    const createdAt = new Date(Date.now() - daysAgo * 86400000);

    const booking = await prisma.booking.create({
      data: {
        customerId: customer.id,
        workerId: worker.user.id,
        serviceId: service.id,
        status,
        description: descriptions[i % descriptions.length],
        latitude: 12.9716 + (Math.random() - 0.5) * 0.1,
        longitude: 77.5946 + (Math.random() - 0.5) * 0.1,
        address: `${Math.floor(Math.random() * 500) + 1}, Sample Street, Bangalore`,
        preferredTime: new Date(createdAt.getTime() + 3600000),
        estimatedPrice,
        actualPrice: status === "COMPLETED" ? estimatedPrice : null,
        urgency: ["LOW", "MEDIUM", "HIGH"][Math.floor(Math.random() * 3)] as "LOW" | "MEDIUM" | "HIGH",
        aiUsed: Math.random() > 0.7,
        createdAt,
      },
    });

    // Create payment for completed bookings
    if (status === "COMPLETED") {
      const amount = estimatedPrice;
      const workerAmount = Math.round(amount * 0.9);
      const welfareFund = Math.round(amount * 0.05);
      const trainingFund = Math.round(amount * 0.02);
      const cooperativeShare = amount - workerAmount - welfareFund - trainingFund;

      const payment = await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount,
          status: "COMPLETED",
          workerAmount,
          welfareFund,
          trainingFund,
          cooperativeShare,
        },
      });

      await prisma.cooperativeTransaction.createMany({
        data: [
          { paymentId: payment.id, type: "WORKER_PAYOUT", amount: workerAmount },
          { paymentId: payment.id, type: "WELFARE_FUND", amount: welfareFund },
          { paymentId: payment.id, type: "TRAINING_FUND", amount: trainingFund },
          { paymentId: payment.id, type: "COOPERATIVE_SHARE", amount: cooperativeShare },
        ],
      });

      // Create rating for completed bookings
      if (Math.random() > 0.2) {
        await prisma.rating.create({
          data: {
            bookingId: booking.id,
            customerId: customer.id,
            workerId: worker.user.id,
            score: Math.floor(Math.random() * 2) + 4,
            comment: ["Great work!", "Very professional", "Quick and reliable", "Excellent service", "Would hire again"][Math.floor(Math.random() * 5)],
          },
        });
      }
    }

    bookingCount++;
  }

  console.log(`✅ Created ${bookingCount} bookings with payments, transactions, and ratings`);
  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
