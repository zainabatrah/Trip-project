const defaultTripImage =
  "/Images/Libanon233.jpg";

const canonicalImageFiles = [
  {
    source:
      "/Images/AnfehSeaEscape.jpg",
    target:
      "/Images/Anfeh.jpg",
  },
  {
    source:
      "/Images/qadisha-kadisha-valley.jpg",
    target:
      "/Images/Qadisha Valley.jpg",
  },
  {
    source:
      "/Images/qadisha-kadisha-valley.jpg",
    target:
      "/Images/Qadisha.jpg",
  },
  {
    source:
      "/Images/Saida.jpg",
    target:
      "/Images/Sidon.jpg",
  },
  {
    source:
      "/Images/South.jpg",
    target:
      "/Images/Ehden.jpg",
  },
  {
    source: "/Images/68.jpg",
    target:
      "/Images/Jezzine.jpg",
  },
  {
    source:
      "/Images/images (2).jpg",
    target:
      "/Images/Bcharre.jpg",
  },
  {
    source:
      "/Images/images (3).jpg",
    target:
      "/Images/Laklouk.jpg",
  },
  {
    source:
      "/Images/South.jpg",
    target:
      "/Images/Baalbek.jpg",
  },
];

const destinationPresets = [
  {
    key: "beirut",
    image:
      "/Images/Beirut.jpg",
    latitude: 33.8938,
    longitude: 35.5018,
    aliases: [
      "downtown beirut",
    ],
  },
  {
    key: "faraya",
    image:
      "/Images/Faraya.jpg",
    latitude: 34.0104,
    longitude: 35.8328,
  },
  {
    key: "batroun",
    image:
      "/Images/Batroun.jpg",
    latitude: 34.2554,
    longitude: 35.6581,
  },
  {
    key: "byblos",
    image:
      "/Images/Batroun.jpg",
    latitude: 34.1236,
    longitude: 35.6511,
  },
  {
    key: "baalbek",
    image:
      "/Images/Baalbek.jpg",
    latitude: 34.0047,
    longitude: 36.211,
    aliases: [
      "baalbek temples",
    ],
  },
  {
    key: "qadisha valley",
    image:
      "/Images/Qadisha Valley.jpg",
    latitude: 34.2431,
    longitude: 35.9977,
    aliases: [
      "qadisha",
    ],
  },
  {
    key: "saida",
    image:
      "/Images/Saida.jpg",
    latitude: 33.5606,
    longitude: 35.3758,
    aliases: [
      "sidon",
    ],
  },
  {
    key: "tyre",
    image:
      "/Images/Tyre.jpg",
    latitude: 33.2705,
    longitude: 35.2038,
  },
  {
    key: "anfeh",
    image:
      "/Images/Anfeh.jpg",
    latitude: 34.3562,
    longitude: 35.7339,
  },
  {
    key: "chouf",
    image:
      "/Images/Chouf.jpg",
    latitude: 33.6973,
    longitude: 35.5655,
  },
  {
    key: "beiteddine",
    image:
      "/Images/Chouf.jpg",
    latitude: 33.695,
    longitude: 35.5795,
  },
  {
    key: "deir el qamar",
    image:
      "/Images/Chouf.jpg",
    latitude: 33.6994,
    longitude: 35.5587,
  },
  {
    key: "bcharre",
    image:
      "/Images/Bcharre.jpg",
    latitude: 34.2509,
    longitude: 36.0106,
    aliases: [
      "cedars",
      "cedars forest",
      "cedars of god",
    ],
  },
  {
    key: "ehden",
    image:
      "/Images/Ehden.jpg",
    latitude: 34.2905,
    longitude: 35.9544,
  },
  {
    key: "jezzine",
    image:
      "/Images/Jezzine.jpg",
    latitude: 33.5417,
    longitude: 35.5844,
  },
  {
    key: "laklouk",
    image:
      "/Images/Laklouk.jpg",
    latitude: 34.145,
    longitude: 35.842,
  },
  {
    key: "jeita",
    image:
      "/Images/Jeita.jpg",
    latitude: 33.9493,
    longitude: 35.6438,
  },
];

function normalizeLocationKey(
  value
) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function getDestinationPreset(
  value
) {
  const normalizedValue =
    normalizeLocationKey(
      value
    );

  if (!normalizedValue) {
    return null;
  }

  return (
    destinationPresets.find(
      (preset) =>
        [
          preset.key,
          ...(preset.aliases || []),
        ].some((alias) =>
          normalizedValue.includes(
            normalizeLocationKey(
              alias
            )
          )
        )
    ) || null
  );
}

function buildDestinationImageMap() {
  return Object.fromEntries(
    destinationPresets.flatMap(
      (preset) =>
        [
          preset.key,
          ...(preset.aliases || []),
        ].map((alias) => [
          alias,
          preset.image,
        ])
    )
  );
}

const destinationImageMap =
  buildDestinationImageMap();

const imageAliasEntries = [
  [
    "/images/tyre.jpg",
    "/Images/Tyre.jpg",
  ],
  [
    "/images/sidon.jpg",
    "/Images/Saida.jpg",
  ],
  [
    "/images/jeita-byblos.jpg",
    "/Images/Batroun.jpg",
  ],
  [
    "/images/jeita.jpg",
    "/Images/Jeita.jpg",
  ],
  [
    "/images/byblos.jpg",
    "/Images/Batroun.jpg",
  ],
  [
    "/images/cedars.jpg",
    "/Images/Bcharre.jpg",
  ],
  [
    "/images/bcharre.jpg",
    "/Images/Bcharre.jpg",
  ],
  [
    "/images/cedars-of-god.jpg",
    "/Images/Bcharre.jpg",
  ],
  [
    "/images/baalbek.jpg",
    "/Images/Baalbek.jpg",
  ],
  [
    "/images/baalbek-temples.jpg",
    "/Images/Baalbek.jpg",
  ],
  [
    "/images/chouf.jpg",
    "/Images/Chouf.jpg",
  ],
  [
    "/images/beiteddine.jpg",
    "/Images/Chouf.jpg",
  ],
  [
    "/images/deir-el-qamar.jpg",
    "/Images/Chouf.jpg",
  ],
  [
    "/images/beirut.jpg",
    "/Images/Beirut.jpg",
  ],
  [
    "/images/anfeh.jpg",
    "/Images/Anfeh.jpg",
  ],
  [
    "/images/qadisha.jpg",
    "/Images/Qadisha Valley.jpg",
  ],
  [
    "/images/ehden.jpg",
    "/Images/Ehden.jpg",
  ],
  [
    "/images/jezzine.jpg",
    "/Images/Jezzine.jpg",
  ],
  [
    "/images/laklouk.jpg",
    "/Images/Laklouk.jpg",
  ],
];

const genericDestinationImages = [
  defaultTripImage,
  "/Images/Beirut.jpg",
  "/Images/Faraya.jpg",
  "/Images/Batroun.jpg",
  "/Images/Tyre.jpg",
  "/Images/Anfeh.jpg",
  "/Images/Chouf.jpg",
  "/Images/Ehden.jpg",
  "/Images/Jezzine.jpg",
  "/Images/Bcharre.jpg",
  "/Images/Laklouk.jpg",
];

module.exports = {
  canonicalImageFiles,
  defaultTripImage,
  destinationImageMap,
  destinationPresets,
  genericDestinationImages,
  getDestinationPreset,
  imageAliasEntries,
  normalizeLocationKey,
};