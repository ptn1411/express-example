import { Router } from "express";
import multer, { FileFilterCallback, MulterError } from "multer";
import sharp from "sharp";
import removeVietNam from "../utils/removeVietnameseTones";
import { Request, Response, NextFunction } from "express-serve-static-core";
import { dateNow } from "../utils";
import { mkdirp } from "mkdirp";
import path from "path";
import { checkApiAuthAccessToken } from "../middleware/checkAuth";
import { Image } from "../entity/Image";
import { v4 as uuidv4 } from "uuid";
import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
const pathFolderUpload = process.env.PATH_FOlDER_UPLOAD;
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

      const pathYearMonth = `${pathFolderUpload}/uploads/images/${
        dateNow().yyyy
      }/${dateNow().mm}`;
      await mkdirp(pathYearMonth);
      await sharp(file.buffer)
        // .resize(640, 320)
        .toFormat("png")
        .jpeg({ quality: 90 })
        .toFile(`${pathYearMonth}/${newFilename}`);
      const uuid = uuidv4();
      const newImage = await Image.create({
        uuid: uuid,
        path: `${pathYearMonth}/${newFilename}`,
      });
      const user = await User.findOneBy({
        id: req.user?.id,
      });
      if (user) {
        newImage.user = user;
        newImage.alt = user.fullName;
        await AppDataSource.manager.save(newImage);
        req.body.images.push(newFilename);
      }
    })
  );
  return next();
};
const getResult = async (req: Request, res: Response) => {
  if (req.body.images.length <= 0) {
    return res.json({
      status: false,
      code: 400,
      message: "You must select at least 1 image.",
    });
  }
  const images: string[] = req.body.images.map(
    (image: string) => `${process.env.URL_APP}/image/n/${image}`
  );

  return res.json({
    status: true,
    code: 200,
    images: images,
  });
};
router.post(
  "/",
  checkApiAuthAccessToken,
  uploadImages,
  resizeImages,
  getResult
);
router.get("/n/:uuid", (req: Request, res: Response) => {
  const uuid = req.params.uuid;
  if (!uuid) {
    return res.json({
      status: false,
      code: 404,
      message: "not image",
    });
  }
  const pathYearMonth = `${pathFolderUpload}/uploads/images/${uuid.slice(
    0,
    4
  )}/${uuid.slice(4, 6)}`;

  const options = {
    root: path.join(pathYearMonth),
    dotfiles: "deny",
    headers: {
      "x-timestamp": Date.now(),
      "x-sent": true,
    },
  };

  return res.sendFile(uuid, options);
});
router.get("/u/:uuid", async (req: Request, res: Response) => {
  const uuid = req.params.uuid;
  if (!uuid) {
    return res.json({
      status: false,
      code: 404,
      message: "not image",
    });
  }
  const existingImage = await Image.findOneBy({
    uuid: uuid,
  });

  if (!existingImage) {
    return res.json({
      status: false,
      code: 404,
      message: "not image",
    });
  }
  const fileName = existingImage?.path.slice(22) as string;
  const options = {
    root: path.join(`${pathFolderUpload}/${existingImage?.path.slice(0, 22)}`),
    dotfiles: "deny",
    headers: {
      "x-timestamp": Date.now(),
      "x-sent": true,
      "x-alt": existingImage.alt,
    },
  };

  return res.sendFile(fileName, options);
});
export default router;
