import express, { Express, Request, Response } from 'express';
import bodyparser from 'body-parser';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import cors from 'cors';
import bcrypt from 'bcrypt';

dotenv.config();

const app: Express = express();

const port: string = process.env.PORT as string;

const connection = await mysql.createConnection({
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

/**
 * Serves the index.html page.
 */
app.get('/', (req: Request, res: Response) => {
    res.render('index', { title: '⚡ExpressJS Server⚡' });
});

/**
 * Sends video packets to the client.
 */
app.get("/video", function (req, res) {
    
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

/**
 * Prints out all the users in the database.
 */
app.get('/user', async (req: Request, res: Response) => {

    let result = connection.query("SELECT * FROM users");

    //res.send((await result as Array<any>)[0]);

    res.render('user', {users: (await result as Array<any>)[0]});
});

/**
 * Gets a user from the database by ID.
 */
app.get('/user/:id', async (req: Request, res: Response) => {

    let result = await connection.query("SELECT * FROM users WHERE id =?", req.params.id);

    let user = (result as Array<any>)[0][0];

    if(user !== undefined) {
    res.render('profile', {username: user.username, description: user.description});
    } else {
        res.status(404).send("User not found");
    }
});

app.get('/createuser', async (req: Request, res: Response) => {
    res.render('createuser');
});

/**
 * Creates a new user in the database.
 */
app.post('/createuser', async (req: Request, res: Response) => {

    let username = req.body.username;
    let password = req.body.password;
    let description = req.body.description;

    //Starts creating the password hash asyncrously while it checks if the user already exists.
    let hash = bcrypt.hash(password, 13);

    let usersWithName = await connection.query("SELECT * FROM users WHERE username = ?", username);

    if((usersWithName[0] as Array<any>).length > 0){
        res.send("Username already exists");
    } else {
        let entries = await connection.query('INSERT INTO users (username, hash, description) VALUES (?, ?, ?);', [username, await hash, description]);
        res.redirect("user/"+(entries as Array<any>)[0].insertId);
    }
    

});

/**
 * Logins the user.
 */
app.post('/login', async (req: Request, res: Response) => {
    let username = req.body.username;
    let password = req.body.password;


    let users = await connection.query("SELECT * FROM users WHERE username = ?", username).catch(console.log);

    let user = ( users as Array<any>)[0][0];

    console.log(user);

    if(user === undefined){
        res.send("No user found");
    } else 
    if(await bcrypt.compare(password, user.hash)){
        res.send("Logged in");
    } else {
        res.send("Invalid password");
    }
});

/**
 * Deletes a user from the database.
 */
app.post('/deleteuser', async (req: Request, res: Response) => {

    let username = req.body.username;
    let password = req.body.password;


    let users = await connection.query("SELECT * FROM users WHERE username = ?", username);

    let user = ( users as Array<any>)[0][0];


    if(user === undefined){
        res.send("No user found");
    } else 
    if(await bcrypt.compare(password, user.hash)){
        await connection.query('DELETE FROM users WHERE id = ?', user.id).then(() => {
            res.send("User deleted");
        }).catch(console.log);
    } else {
        res.send("Invalid password");
    }
});

/**
 * Logs the user out.
 */
app.post('/logout', (req: Request, res: Response) => {
    res.send("User logged out");
});

/**
 * Starts the server.
 */
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});