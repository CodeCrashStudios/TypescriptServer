import express, {Request, Response} from 'express';

export const router = express.Router();

/**
 * Serves the index.html page.
 */
router.get('/', (req: Request, res: Response) => {
    res.render('index', { title: '⚡ExpressJS Server⚡' });
});