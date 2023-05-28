import express from 'express';

import {router as defaultRouter} from './routes/default';
import {router as userRoute} from './routes/user';
import {router as videoRoute} from './routes/video';

export const routes = express.Router();

routes.use(defaultRouter);
routes.use(userRoute);
routes.use(videoRoute);