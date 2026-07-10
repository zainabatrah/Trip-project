import "dotenv/config";
import mongoose from "mongoose";
import Trip from "./models/Trip.js";

const trips = [
  {
    title: "Faraya Mountain Adventure",
    from: "Beirut",
    to: "Faraya",
    category: "Mountain",
    vehicle: "MINIBUS",
    description:
      "Enjoy a full-day mountain trip to Faraya with scenic views, fresh air, and outdoor activities.",
    image: "/Images/Faraya.jpg",
    date: "2026-07-15",
    time: "07:30 AM",
    duration: "9 hours",
    price: 45,
    seatsLeft: 12,
    rating: 4.8,
  },
  {
    title: "Batroun Coastal Escape",
    from: "Beirut",
    to: "Batroun",
    category: "Beach",
    vehicle: "VAN",
    description:
      "Discover Batroun's old streets, coastal views, beach locations, and traditional markets.",
    image: "/Images/Batroun.jpg",
    date: "2026-07-17",
    time: "09:00 AM",
    duration: "8 hours",
    price: 38,
    seatsLeft: 8,
    rating: 4.7,
  },
  {
    title: "Baalbek Historical Tour",
    from: "Beirut",
    to: "Baalbek",
    category: "Historical",
    vehicle: "BUS",
    description:
      "Visit the ancient Roman temples of Baalbek and explore one of Lebanon's most important archaeological sites.",
    image: "/Images/Libanon233.jpg",
    date: "2026-07-19",
    time: "07:00 AM",
    duration: "10 hours",
    price: 55,
    seatsLeft: 20,
    rating: 4.9,
  },
  {
    title: "Qadisha Valley Journey",
    from: "Beirut",
    to: "Qadisha Valley",
    category: "Nature",
    vehicle: "MINIBUS",
    description:
      "Explore the dramatic landscapes, mountain villages, monasteries, and trails of Qadisha Valley.",
    image: "/Images/qadisha-kadisha-valley.jpg",
    date: "2026-07-21",
    time: "06:30 AM",
    duration: "11 hours",
    price: 60,
    seatsLeft: 10,
    rating: 4.9,
  },
  {
    title: "Saida Old City Tour",
    from: "Beirut",
    to: "Saida",
    category: "Cultural",
    vehicle: "VAN",
    description:
      "Visit Saida's Sea Castle, traditional souks, old streets, and major historical landmarks.",
    image: "/Images/Saida.jpg",
    date: "2026-07-23",
    time: "08:30 AM",
    duration: "8 hours",
    price: 35,
    seatsLeft: 7,
    rating: 4.6,
  },
  {
    title: "Tyre Beach Day",
    from: "Beirut",
    to: "Tyre",
    category: "Beach",
    vehicle: "BUS",
    description:
      "Spend the day on Tyre's coast and explore its beach, old city, and archaeological locations.",
    image: "/Images/Tyre-Beach-Lebanon.jpg",
    date: "2026-07-25",
    time: "08:00 AM",
    duration: "9 hours",
    price: 42,
    seatsLeft: 16,
    rating: 4.8,
  },
  {
    title: "Anfeh Sea Escape",
    from: "Beirut",
    to: "Anfeh",
    category: "Beach",
    vehicle: "PRIVATE CAR",
    description:
      "Enjoy Anfeh's clear sea, coastal houses, salt fields, and peaceful Mediterranean atmosphere.",
    image: "/Images/AnfehSeaEscape.jpg",
    date: "2026-07-27",
    time: "09:30 AM",
    duration: "7 hours",
    price: 70,
    seatsLeft: 3,
    rating: 4.7,
  },
  {
    title: "Lebanon Spring Landscapes",
    from: "Beirut",
    to: "Chouf",
    category: "Nature",
    vehicle: "MINIBUS",
    description:
      "Experience Lebanon's green spring landscapes, colorful fields, hills, and countryside villages.",
    image: "/Images/Lebanon-spring-1.jpg",
    date: "2026-07-29",
    time: "08:00 AM",
    duration: "8 hours",
    price: 44,
    seatsLeft: 11,
    rating: 4.6,
  },
  {
    title: "Cedars Snow Experience",
    from: "Beirut",
    to: "Bcharre",
    category: "Mountain",
    vehicle: "BUS",
    description:
      "Travel to Bcharre and the Cedars region for mountain views, snow scenery, and cedar forests.",
    image: "/Images/images (2).jpg",
    date: "2026-08-01",
    time: "06:30 AM",
    duration: "11 hours",
    price: 58,
    seatsLeft: 19,
    rating: 4.9,
  },
  {
    title: "Lebanese Mountain Panorama",
    from: "Beirut",
    to: "Ehden",
    category: "Mountain",
    vehicle: "VAN",
    description:
      "Visit Ehden and enjoy mountain roads, panoramic landscapes, forests, and traditional food.",
    image: "/Images/images.jpg",
    date: "2026-08-03",
    time: "07:00 AM",
    duration: "10 hours",
    price: 52,
    seatsLeft: 8,
    rating: 4.8,
  },
  {
    title: "Waterfall Nature Trip",
    from: "Beirut",
    to: "Jezzine",
    category: "Nature",
    vehicle: "MINIBUS",
    description:
      "Explore Jezzine's waterfall, pine forests, traditional streets, and natural mountain scenery.",
    image: "/Images/images (1).jpg",
    date: "2026-08-05",
    time: "08:00 AM",
    duration: "9 hours",
    price: 47,
    seatsLeft: 13,
    rating: 4.7,
  },
  {
    title: "Winter Mountain Discovery",
    from: "Beirut",
    to: "Laklouk",
    category: "Mountain",
    vehicle: "PRIVATE CAR",
    description:
      "Discover Lebanon's winter mountains and enjoy scenic snowy roads and peaceful landscapes.",
    image: "/Images/images (3).jpg",
    date: "2026-08-07",
    time: "07:30 AM",
    duration: "8 hours",
    price: 75,
    seatsLeft: 3,
    rating: 4.6,
  },
];

async function seedTrips() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from backend/.env");
    }

    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected to MongoDB.");

    // This removes the old trips before inserting the new trips.
    await Trip.deleteMany({});

    console.log("Old trips removed.");

    const insertedTrips = await Trip.insertMany(trips);

    console.log(`${insertedTrips.length} trips inserted successfully.`);
  } catch (error) {
    console.error("Seeding failed:");
    console.error(error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
}

seedTrips();