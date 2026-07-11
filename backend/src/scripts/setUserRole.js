require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("../../db");
const User = require("../../models/User");

function readFlag(flagName) {
  const index =
    process.argv.indexOf(`--${flagName}`);

  if (index === -1) {
    return "";
  }

  return String(
    process.argv[index + 1] || ""
  ).trim();
}

async function main() {
  const email = readFlag("email")
    .toLowerCase();

  const userId = readFlag("id");
  const role = readFlag("role")
    .toLowerCase();

  const allowedRoles =
    User.schema.path("role")
      .enumValues;

  if (!email && !userId) {
    throw new Error(
      "Provide either --email <value> or --id <value>."
    );
  }

  if (!allowedRoles.includes(role)) {
    throw new Error(
      `Role must be one of: ${allowedRoles.join(
        ", "
      )}.`
    );
  }

  if (
    userId &&
    !mongoose.Types.ObjectId.isValid(
      userId
    )
  ) {
    throw new Error(
      "The provided user id is not a valid MongoDB ObjectId."
    );
  }

  await connectDB();

  const query = email
    ? { email }
    : { _id: userId };

  const user =
    await User.findOneAndUpdate(
      query,
      { role },
      {
        new: true,
        runValidators: true,
      }
    ).lean();

  if (!user) {
    throw new Error(
      "User not found."
    );
  }

  console.log(
    JSON.stringify(
      {
        success: true,
        user: {
          id: String(user._id),
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        },
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
