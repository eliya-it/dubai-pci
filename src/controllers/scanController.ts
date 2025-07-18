import { asyncHandler } from "../helpers/errorHandler";
import clamav from "clamav.js";
import fs from "fs";
import { Request } from "express";

type RequestWithFile = Request & {
  file?: Express.Multer.File;
};

const scan = asyncHandler(async (req: RequestWithFile, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const clamavHost = process.env.CLAMAV_HOST!;
  const clamavPort = Number(process.env.CLAMAV_PORT!);
  const path = req.file.path;

  const stream = fs.createReadStream(path);
  clamav.ping(clamavPort, clamavHost, 1000, (err) => {
    if (err) {
      return res.status(500).json({ message: "ClamAV is not running." });
    }

    clamav
      .createScanner(clamavPort, clamavHost)
      .scan(stream, (err, object, malicious) => {
        fs.unlinkSync(path); // cleanup

        if (err) {
          return res.status(500).json({ message: "Scan failed", error: err });
        }

        if (malicious) {
          return res
            .status(400)
            .json({ message: "Threat detected", file: object });
        }

        res.status(200).json({ message: "No threats detected", file: object });
      });
  });
});

export { scan };
