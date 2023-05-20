import express, { Request, Response} from 'express';
import bcrypt from 'bcrypt';
import {connection} from '../index.js';

export const router = express.Router();

/**
 * Prints out all the users in the database.
 */
router.get('/user', async (req: Request, res: Response) => {

    let result = connection.query("SELECT * FROM users");


    res.render('user', {users: (await result as Array<any>)[0]});
});

/**
 * Gets a user from the database by ID.
 */
router.get('/user/:id', async (req: Request, res: Response) => {

    let result = await connection.query("SELECT * FROM users WHERE id =?", req.params.id);

    let user = (result as Array<any>)[0][0];

    if(user !== undefined) {
    res.render('profile', {username: user.username, description: user.description});
    } else {
        res.status(404).send("User not found");
    }
});

router.get('/createuser', async (req: Request, res: Response) => {
    res.render('createuser');
});

/**
 * Creates a new user in the database.
 */
router.post('/createuser', async (req: Request, res: Response) => {

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
router.post('/login', async (req: Request, res: Response) => {
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
router.post('/deleteuser', async (req: Request, res: Response) => {

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
router.post('/logout', (req: Request, res: Response) => {
    res.send("User logged out");
});