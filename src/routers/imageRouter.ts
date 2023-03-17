import { Router } from "express";
import multer, { FileFilterCallback, MulterError } from "multer";
import sharp from "sharp";
import removeVietNam from "../utils/removeVietnameseTones";
import { Request, Response, NextFunction } from "express-serve-static-core";
import { dateNow } from "../utils";
import { mkdirp } from "mkdirp";
import path from "path";

const multerStorage = multer.memoryStorage();

const router = Router();

const multerFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Please upload only images."));
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const uploadFiles = upload.array("images", 10);
const errorArray = [
  "LIMIT_PART_COUNT",
  "LIMIT_FILE_SIZE",
  "LIMIT_FILE_COUNT",
  "LIMIT_FIELD_KEY",
  "LIMIT_FIELD_VALUE",
  "LIMIT_FIELD_COUNT",
  "LIMIT_UNEXPECTED_FILE",
];
const uploadImages = (req: Request, res: Response, next: NextFunction) => {
  uploadFiles(req, res, (err: any) => {
    if (err instanceof MulterError) {
      if (errorArray.includes(err.code)) {
        return res.json({
          status: false,
          ...err,
        });
      }
      return res.json({
        status: false,
        ...err,
      });
    }
    return next();
  });
};

const resizeImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.files)
    return res.json({
      status: false,
      code: 400,
      message: "Not File",
    });

  req.body.images = [];

  const files = req.files as unknown as Express.Multer.File[];
  await Promise.all(
    files.map(async (file: Express.Multer.File) => {
      const filename = file.originalname.replace(/\..+$/, "");

      const filenameRemoveVietNam = removeVietNam(filename).split(" ").join("");
      const newFilename = `${
        dateNow().yearNoTiles
      }-${filenameRemoveVietNam}-${Date.now()}.png`;
      const pathYearMonth = `uploads/images/${dateNow().yyyy}/${dateNow().mm}`;
      await mkdirp(pathYearMonth);
      await sharp(file.buffer)
        // .resize(640, 320)
        .toFormat("png")
        .jpeg({ quality: 90 })
        .toFile(`${pathYearMonth}/${newFilename}`);
      req.body.images.push(newFilename);
    })
  );
  return next();
};
const getResult = async (req: Request, res: Response) => {
  if (req.body.images.length <= 0) {
    return res.json({
      status: "error",
      message: "You must select at least 1 image.",
    });
  }
  const images: string[] = req.body.images.map(
    (image: string) => `${process.env.URL_APP}/image/${image}`
  );

  return res.json({
    status: true,
    code: 200,
    images: images,
  });
};
router.post("/", uploadImages, resizeImages, getResult);
router.get("/:uuid", (req: Request, res: Response) => {
  const uuid = req.params.uuid;

  const pathYearMonth = `../../uploads/images/${uuid.slice(0, 4)}/${uuid.slice(
    4,
    6
  )}`;

  const options = {
    root: path.join(__dirname, pathYearMonth),
    dotfiles: "deny",
    headers: {
      "x-timestamp": Date.now(),
      "x-sent": true,
    },
  };

  res.sendFile(uuid, options);
});
export default router;
