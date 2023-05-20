import express from 'express';

import {router as defaultRouter} from './routes/default.js';
import {router as userRoute} from './routes/user.js';
import {router as videoRoute} from './routes/video.js';

export const routes = express.Router();

routes.use(defaultRouter);
routes.use(userRoute);
routes.use(videoRoute);