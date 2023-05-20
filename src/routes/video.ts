import express, {Request, Response} from 'express';
import fs from 'fs';

export const router = express.Router();

/**
 * Sends video packets to the client from the requested range.
 */
router.get("/video", function (req: Request, res: Response) {
    
    const range = req.headers.range; // range header value for video packet request
    const videoId = req.query.videoId as string;

    if (!range) {
        res.status(400).send("Requires Range header");
    } else {
        const videoPath = "Videos/"+videoId+".mp4";
        const videoSize = fs.statSync("Videos/"+videoId+".mp4").size;
        const CHUNK_SIZE = 10 ** 6;
        const start = Number(range.replace(/\D/g, ""));
        const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
        const contentLength = end - start + 1;
        const headers = {
            "Content-Range": `bytes ${start}-${end}/${videoSize}`,
            "Accept-Ranges": "bytes",
            "Content-Length": contentLength,
            "Content-Type": "video/webm",
        };

        res.writeHead(206, headers);

        const videoStream = fs.createReadStream(videoPath, { start, end });

        videoStream.pipe(res);
    }
});