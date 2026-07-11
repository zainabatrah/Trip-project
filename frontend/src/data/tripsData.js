const trips = [
  {
    title: "Beirut City Tour",
    country: "Lebanon",
    from: "Hamra",
    to: "Downtown Beirut",
    description:
      "Explore Beirut’s streets, waterfront, cafes, and cultural landmarks in one comfortable city trip.",
    date: new Date("2026-03-15"),
    photo:
      "/Images/mosque-and-shops-in-the-medina-old-town-of-tripoli-libya-north-africa-BPMJ5G.jpg",
    price: 25,
    duration: 1,
    numberOfTravelers: 30,
    reservedTravelers: 8,
    status: "planned",
    transportation: "bus",
    tripType: "family",
    rating: 4.8,
    inclusions: [
      "Transportation",
      "Tour guide",
      "Water",
      "Entrance fees",
    ],

    places: [
      {
        city: "Hamra",
        image:
          "/Images/mosque-and-shops-in-the-medina-old-town-of-tripoli-libya-north-africa-BPMJ5G.jpg",
        latitude: 33.896,
        longitude: 35.478,
        days: 1,
      },
      {
        city: "Downtown Beirut",
        image:
          "/Images/Libanon233.jpg",
        latitude: 33.9009,
        longitude: 35.5074,
        days: 1,
      },
    ],
  },

  {
    title: "Byblos Coastal Escape",
    country: "Lebanon",
    from: "Beirut",
    to: "Byblos",
    description:
      "A coastal trip to Byblos with time to visit the old souk, harbor, castle area, and seaside restaurants.",
    date: new Date("2026-03-20"),
    photo: "/Images/Batroun.jpg",
    price: 35,
    duration: 1,
    numberOfTravelers: 20,
    reservedTravelers: 6,
    status: "planned",
    transportation: "car",
    tripType: "relax",
    rating: 4.7,
    inclusions: [
      "Transportation",
      "Tour guide",
      "Water",
      "Byblos old souk visit",
    ],

    places: [
      {
        city: "Beirut",
        image:
          "/Images/Libanon233.jpg",
        latitude: 33.8938,
        longitude: 35.5018,
        days: 1,
      },
      {
        city: "Byblos",
        image:
          "/Images/Batroun.jpg",
        latitude: 34.123,
        longitude: 35.6519,
        days: 1,
      },
    ],
  },

  {
    title: "Cedars Mountain Trip",
    country: "Lebanon",
    from: "Beirut",
    to: "Cedars of God",
    description:
      "A mountain journey to Bcharre and the Cedars area with fresh air, nature views, and photo stops.",
    date: new Date("2026-04-01"),
    photo:
      "/Images/Outdoor-Adventures-Lebanon_FT1_.webp",
    price: 45,
    duration: 1,
    numberOfTravelers: 40,
    reservedTravelers: 9,
    status: "planned",
    transportation: "bus",
    tripType: "adventure",
    rating: 4.9,
    inclusions: [
      "Transportation",
      "Tour guide",
      "Water",
      "Mountain stops",
    ],

    places: [
      {
        city: "Beirut",
        image:
          "/Images/Libanon233.jpg",
        latitude: 33.8938,
        longitude: 35.5018,
        days: 1,
      },
      {
        city: "Bcharre",
        image:
          "/Images/Outdoor-Adventures-Lebanon_FT1_.webp",
        latitude: 34.2508,
        longitude: 36.0106,
        days: 1,
      },
      {
        city: "Cedars of God",
        image:
          "/Images/download.avif",
        latitude: 34.2434,
        longitude: 36.048,
        days: 1,
      },
    ],
  },
];

export default trips;
