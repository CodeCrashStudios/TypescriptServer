import express, { Express, Request, Response } from 'express';
import bodyparser from 'body-parser';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import cors from 'cors';
import {routes} from './routes.js'

dotenv.config();

const app: Express = express();

const port: string = process.env.PORT as string || '3000';

export const connection = await mysql.createConnection({
    host: process.env.HOST as string,
    user: process.env.USER as string,
    password: process.env.PASSWORD as string,
    database: process.env.DATABASE as string
});
+

connection.connect();

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cors());

app.use(express.static('public'));

app.set('view engine', 'ejs');

app.use(routes);

/**
 * Starts the server.
 */
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});