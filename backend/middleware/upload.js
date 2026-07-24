const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadDirectory = path.join(
  __dirname,
  "..",
  "uploads"
);

fs.mkdirSync(uploadDirectory, {
  recursive: true,
});

function createSafeFilename(
  originalname
) {
  const extension = path.extname(
    originalname || ""
  );
  const baseName = path
    .basename(
      originalname || "file",
      extension
    )
    .replace(
      /[^a-zA-Z0-9-_]+/g,
      "-"
    )
    .replace(/^-+|-+$/g, "");

  return `${Date.now()}-${baseName || "file"}${extension.toLowerCase()}`;
}

const storage =
  multer.diskStorage({
    destination(
      _req,
      _file,
      callback
    ) {
      callback(
        null,
        uploadDirectory
      );
    },

    filename(
      _req,
      file,
      callback
    ) {
      callback(
        null,
        createSafeFilename(
          file.originalname
        )
      );
    },
  });

const upload = multer({
  storage,
});

module.exports = upload;
