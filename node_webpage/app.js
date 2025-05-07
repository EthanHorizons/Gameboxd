/*
    SETUP
*/

// Express
const express = require('express');  // We are using the express library for the web server
const exphbs = require('express-handlebars'); // We are using the express-handlebars library for the templating engine
const path = require('path');

const app = express();               // We need to instantiate an express object to interact with the server in our code


const PORT = 53005;     // Set a port number

// Database 
const db = require('./db-connector');
app.use(express.json());
app.use(express.static('public'));

app.engine('hbs', exphbs.engine({
    extname: 'hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts')
  }));
app.set('view engine', 'hbs'); // Set the view engine to hbs (Handlebars)
app.set('views', path.join(__dirname, 'views'));

/*
    ROUTES
*/

app.get('/', async function (req, res) {

    res.render('index', {title: 'Home'}); // This is the home page
});
//pages for each entity
app.get('/games', async function (req, res) {
    res.render('games', {title: 'Games'});
}); // This is the games page
app.get('/users', async function (req, res) {
    res.render('users', {title: 'Games'});
}); // This is the users page


app.post('/insert', async function (req, res) {
try {
    const { userID, gameID } = req.body;
    
    if (!userID || !gameID) {
        return res.status(400).send("user_id or game_id missing from req.body");
    }

    const query = 'INSERT INTO userLibrary (userID, gameID) VALUES (' + userID + ', ' + gameID + ');';

    await db.query(query);

    res.status(200).send("Game successfully added to userLibrary");
} catch {
    console.error("Error adding game to library", error);
    res.status(500).send('Error adding game to library');
}
}); 


/*
For filtering:


filterString:
    NULL- filter does not exist
    genres.name - filter for genre
    platforms.name - filter for platform
    games.numUsers- filter for numUsers
    games.rating- filter for rating
    anything else- throw an error

filter:
    the thing to be filtered through sliders/inputs
    ex: filterString = genres.name, filter = 'rpg'
*/

/* Still to implement:
.get('/games:id')
.get('/userLibrary')
*/

app.get('/dasboard', async function (req, res) {
    try {
        const {filterString, filter} = req.body;

        if (!filterString) {
            const query1 = `SELECT games.gameID, games.name AS name, genres.name AS genre, 
                                platforms.name AS platform, games.numUsers, 
                                games.rating, games.description '
                        FROM games 
                        INNER JOIN genres ON genres.genreID = games.genreID 
                        INNER JOIN platforms ON platforms.platformID = games.platformID 
                        ORDER BY games.name DESC`;
        } 
        const games = await db.query(query);
        if (!games) {
            res.status(400).send("Error fetching games");
        }
        res.status(200).json(games);

    } catch (error) {
        console.error("Error fetching games", error);
        res.status(500).send("Error occured fetching games.");
    }
    //try {
        
        // Define our queries
        //const query1 = 'DROP TABLE IF EXISTS diagnostic;';
        //const query2 = 'CREATE TABLE diagnostic(id INT PRIMARY KEY AUTO_INCREMENT, text VARCHAR(255) NOT NULL);';
        //const query3 = 'INSERT INTO diagnostic (text) VALUES ("MySQL and Node is working for myONID!");'; // Replace with your ONID
        //const query4 = 'SELECT * FROM diagnostic;';
        
        // Execute each query synchronously (await).
        // We want each query to finish before the next one starts.
        //await db.query(query1);
        //await db.query(query2);
        //await db.query(query3);
        //const [rows] = await db.query(query4); // Store the results
        
        // Send the results to the browser
        //const base = "<h1>MySQL Results:</h1>";
        //res.send(base + JSON.stringify(rows));

    //} catch (error) {
        //console.error("Error executing queries:", error);

        // Send a generic error message to the browser
        //res.status(500).send("An error occurred while executing the database queries.");
    //}
});

/*
    LISTENER
*/

app.listen(PORT, function(){            // This is the basic syntax for what is called the 'listener' which receives incoming requests on the specified PORT.
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});