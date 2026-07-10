require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("./db");
const Trip = require("./models/Trip");

function createPlace(
  city,
  image,
  latitude,
  longitude
) {
  return {
    city,
    image,
    latitude,
    longitude,
    days: 1,
  };
}

const trips = [
  {
    title: "Faraya Mountain Adventure",
    country: "Lebanon",
    from: "Beirut",
    to: "Faraya",
    date: new Date("2026-07-15T00:00:00.000Z"),
    description:
      "Enjoy a full-day mountain trip to Faraya with scenic views, fresh air, and outdoor activities.",
    photo: "/Images/Faraya.jpg",
    price: 45,
    duration: 1,
    numberOfTravelers: 12,
    reservedTravelers: 0,
    status: "planned",
    transportation: "bus",
    tripType: "adventure",
    rating: 4.6,
    inclusions: [
      "Transportation",
      "Tour guide",
      "Water",
      "Outdoor activities",
    ],
    places: [
      createPlace(
        "Faraya",
        "/Images/Faraya.jpg",
        34.0104,
        35.8328
      ),
    ],
  },

  {
    title: "Batroun Coastal Escape",
    country: "Lebanon",
    from: "Beirut",
    to: "Batroun",
    date: new Date("2026-07-17T00:00:00.000Z"),
    description:
      "Discover Batroun's old streets, coastal views, beach locations, and traditional markets.",
    photo: "/Images/Batroun.jpg",
    price: 38,
    duration: 1,
    numberOfTravelers: 8,
    reservedTravelers: 0,
    status: "planned",
    transportation: "bus",
    tripType: "relax",
    rating: 4.7,
    inclusions: [
      "Transportation",
      "Tour guide",
      "Water",
      "Old streets visit",
    ],
    places: [
      createPlace(
        "Batroun",
        "/Images/Batroun.jpg",
        34.2554,
        35.6581
      ),
    ],
  },

  {
    title: "Baalbek Historical Tour",
    country: "Lebanon",
    from: "Beirut",
    to: "Baalbek",
    date: new Date("2026-07-19T00:00:00.000Z"),
    description:
      "Visit the ancient Roman temples of Baalbek and explore one of Lebanon's major archaeological locations.",
    photo: "/Images/52de2359f6d93ff4a4b06402d9c80bfbfdbb5463_1200x630.jpg",
    price: 55,
    duration: 1,
    numberOfTravelers: 20,
    reservedTravelers: 0,
    status: "planned",
    transportation: "bus",
    tripType: "family",
    rating: 4.8,
    inclusions: [
      "Transportation",
      "Tour guide",
      "Water",
      "Historical site visit",
    ],
    places: [
      createPlace(
        "Baalbek",
        "/Images/52de2359f6d93ff4a4b06402d9c80bfbfdbb5463_1200x630.jpg",
        34.0047,
        36.211
      ),
    ],
  },

  {
    title: "Qadisha Valley Journey",
    country: "Lebanon",
    from: "Beirut",
    to: "Qadisha Valley",
    date: new Date("2026-07-21T00:00:00.000Z"),
    description:
      "Explore mountain villages, monasteries, dramatic landscapes, and trails in Qadisha Valley.",
    photo: "/Images/qadisha-kadisha-valley.jpg",
    price: 60,
    duration: 1,
    numberOfTravelers: 10,
    reservedTravelers: 0,
    status: "planned",
    transportation: "bus",
    tripType: "adventure",
    rating: 4.9,
    inclusions: [
      "Transportation",
      "Tour guide",
      "Water",
      "Nature trail",
    ],
    places: [
      createPlace(
        "Qadisha Valley",
        "/Images/qadisha-kadisha-valley.jpg",
        34.2431,
        35.9977
      ),
    ],
  },

  {
    title: "Saida Old City Tour",
    country: "Lebanon",
    from: "Beirut",
    to: "Saida",
    date: new Date("2026-07-23T00:00:00.000Z"),
    description:
      "Visit Saida's Sea Castle, traditional souks, old streets, and historical landmarks.",
    photo: "/Images/Saida.jpg",
    price: 35,
    duration: 1,
    numberOfTravelers: 7,
    reservedTravelers: 0,
    status: "planned",
    transportation: "bus",
    tripType: "family",
    rating: 4.5,
    inclusions: [
      "Transportation",
      "Tour guide",
      "Water",
      "Old city visit",
    ],
    places: [
      createPlace(
        "Saida",
        "/Images/Saida.jpg",
        33.5606,
        35.3758
      ),
    ],
  },

  {
    title: "Tyre Beach Day",
    country: "Lebanon",
    from: "Beirut",
    to: "Tyre",
    date: new Date("2026-07-25T00:00:00.000Z"),
    description:
      "Spend a day on Tyre's coast and explore its beach, old city, and archaeological locations.",
    photo: "/Images/Tyre-Beach-Lebanon.jpg",
    price: 42,
    duration: 1,
    numberOfTravelers: 16,
    reservedTravelers: 0,
    status: "planned",
    transportation: "bus",
    tripType: "relax",
    rating: 4.6,
    inclusions: [
      "Transportation",
      "Tour guide",
      "Water",
      "Beach visit",
    ],
    places: [
      createPlace(
        "Tyre",
        "/Images/Tyre-Beach-Lebanon.jpg",
        33.2705,
        35.2038
      ),
    ],
  },

  {
    title: "Anfeh Sea Escape",
    country: "Lebanon",
    from: "Beirut",
    to: "Anfeh",
    date: new Date("2026-07-27T00:00:00.000Z"),
    description:
      "Enjoy Anfeh's sea, coastal houses, salt fields, and peaceful Mediterranean atmosphere.",
    photo: "/Images/AnfehSeaEscape.jpg",
    price: 70,
    duration: 1,
    numberOfTravelers: 3,
    reservedTravelers: 0,
    status: "planned",
    transportation: "car",
    tripType: "relax",
    rating: 4.7,
    inclusions: [
      "Private transportation",
      "Water",
      "Coastal visit",
    ],
    places: [
      createPlace(
        "Anfeh",
        "/Images/AnfehSeaEscape.jpg",
        34.3562,
        35.7339
      ),
    ],
  },

  {
    title: "Lebanon Spring Landscapes",
    country: "Lebanon",
    from: "Beirut",
    to: "Chouf",
    date: new Date("2026-07-29T00:00:00.000Z"),
    description:
      "Experience green landscapes, colorful fields, hills, and countryside villages in Chouf.",
    photo: "/Images/Lebanon-spring-1.jpg",
    price: 44,
    duration: 1,
    numberOfTravelers: 11,
    reservedTravelers: 0,
    status: "planned",
    transportation: "bus",
    tripType: "family",
    rating: 4.4,
    inclusions: [
      "Transportation",
      "Tour guide",
      "Water",
      "Nature stops",
    ],
    places: [
      createPlace(
        "Chouf",
        "/Images/Lebanon-spring-1.jpg",
        33.6973,
        35.5655
      ),
    ],
  },

  {
    title: "Cedars Snow Experience",
    country: "Lebanon",
    from: "Beirut",
    to: "Bcharre",
    date: new Date("2026-08-01T00:00:00.000Z"),
    description:
      "Travel to Bcharre and the Cedars region for mountain views and cedar forests.",
    photo: "/Images/download.avif",
    price: 58,
    duration: 1,
    numberOfTravelers: 19,
    reservedTravelers: 0,
    status: "planned",
    transportation: "bus",
    tripType: "adventure",
    rating: 4.9,
    inclusions: [
      "Transportation",
      "Tour guide",
      "Water",
      "Cedars forest visit",
    ],
    places: [
      createPlace(
        "Bcharre",
        "/Images/download.avif",
        34.2509,
        36.0106
      ),
    ],
  },

  {
    title: "Lebanese Mountain Panorama",
    country: "Lebanon",
    from: "Beirut",
    to: "Ehden",
    date: new Date("2026-08-03T00:00:00.000Z"),
    description:
      "Visit Ehden and enjoy mountain roads, panoramic landscapes, forests, and traditional food.",
    photo: "/Images/E0ZceKeWYAc9XPV.jpg",
    price: 52,
    duration: 1,
    numberOfTravelers: 8,
    reservedTravelers: 0,
    status: "planned",
    transportation: "bus",
    tripType: "adventure",
    rating: 4.7,
    inclusions: [
      "Transportation",
      "Tour guide",
      "Water",
      "Panoramic stops",
    ],
    places: [
      createPlace(
        "Ehden",
        "/Images/E0ZceKeWYAc9XPV.jpg",
        34.2905,
        35.9544
      ),
    ],
  },

  {
    title: "Waterfall Nature Trip",
    country: "Lebanon",
    from: "Beirut",
    to: "Jezzine",
    date: new Date("2026-08-05T00:00:00.000Z"),
    description:
      "Explore Jezzine's waterfall, pine forests, traditional streets, and mountain scenery.",
    photo: "/Images/68.jpg",
    price: 47,
    duration: 1,
    numberOfTravelers: 13,
    reservedTravelers: 0,
    status: "planned",
    transportation: "bus",
    tripType: "adventure",
    rating: 4.6,
    inclusions: [
      "Transportation",
      "Tour guide",
      "Water",
      "Waterfall visit",
    ],
    places: [
      createPlace(
        "Jezzine",
        "/Images/68.jpg",
        33.5417,
        35.5844
      ),
    ],
  },

  {
    title: "Winter Mountain Discovery",
    country: "Lebanon",
    from: "Beirut",
    to: "Laklouk",
    date: new Date("2026-08-07T00:00:00.000Z"),
    description:
      "Discover Lebanon's mountain roads and peaceful landscapes around Laklouk.",
    photo: "/Images/Outdoor-Adventures-Lebanon_FT1_.webp",
    price: 75,
    duration: 1,
    numberOfTravelers: 3,
    reservedTravelers: 0,
    status: "planned",
    transportation: "car",
    tripType: "adventure",
    rating: 4.8,
    inclusions: [
      "Private transportation",
      "Water",
      "Mountain stops",
    ],
    places: [
      createPlace(
        "Laklouk",
        "/Images/Outdoor-Adventures-Lebanon_FT1_.webp",
        34.145,
        35.842
      ),
    ],
  },
];

async function seedTrips() {
  try {
    await connectDB();

    await Trip.deleteMany({});

    console.log("Old trips removed.");

    const insertedTrips =
      await Trip.insertMany(trips);

    console.log(
      `${insertedTrips.length} trips inserted successfully.`
    );
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
