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
    res.render('users', {title: 'Users'});
}); // This is the users page
app.get('/genres', async function (req, res) {
    res.render('genres', {title: 'Genres'});
}); // This is the genres page
app.get('/platforms', async function (req, res) {
    res.render('platforms', {title: 'Platfforms'});
}); // This is the platform page


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




/* Still to implement:
.get('/games:id')
.get('/userLibrary')
*/


app.get('/games:id', async function (req, res) {
    // will finish later today
});

/* 
Description: returns the table of games with optional filter as well. can sort by genre, platform,
greater than {filter} rating or numUsers. 

Parameters: (Optional)
    filterString:
        NULL- filter does not exist, returns all games
        genres.name - filter for genre
        platforms.name - filter for platform
        games.numUsers- filter for numUsers
        games.rating- filter for rating
        anything else- throw an error
    filter:
        if filterSting exists, cannot be NULL
        the thing to be filtered through sliders/inputs
        ex: filterString = genres.name, filter = 'rpg'
*/
app.get('/dasboard', async function (req, res) {
    try {
        // filters as selected by user to sort the list of games
        const {filterString, filter} = req.body;

        // if no filter provided
        if (!filterString || !filter) {
            // returns a table of all games
            const query1 = `SELECT games.gameID, games.name AS name, genres.name AS genre, 
                                platforms.name AS platform, games.numUsers, 
                                games.rating, games.description '
                            FROM games 
                            INNER JOIN genres ON genres.genreID = games.genreID 
                            INNER JOIN platforms ON platforms.platformID = games.platformID 
                            ORDER BY games.rating DESC`;
        } 
        // if filter is sorting by genre or platform
        else if (filterString == "genres.name" || filterString == "platforms.name") {
            // returns table with just one genre or just one platform
            const query1 = `SELECT games.gameID, games.name AS name, genres.name AS genre, 
                                platforms.name AS platform, games.numUsers, 
                                games.rating, games.description '
                            FROM games 
                            INNER JOIN genres ON genres.genreID = games.genreID 
                            INNER JOIN platforms ON platforms.platformID = games.platformID 
                            WHERE ${filterString} = ${filter}
                            ORDER BY games.rating DESC`;
        } 
        // if filter is sorting by number of users or rating of game
        else if (filterString == "games.numUsers" || filterString == "games.rating") {
            // returns table with every game > {filter} rating or numUsers
            const query1 = query1 = `SELECT games.gameID, games.name AS name, genres.name AS genre, 
                                        platforms.name AS platform, games.numUsers, 
                                        games.rating, games.description '
                                    FROM games 
                                    INNER JOIN genres ON genres.genreID = games.genreID 
                                    INNER JOIN platforms ON platforms.platformID = games.platformID 
                                    WHERE ${filterString} >= ${filter}
                                    ORDER BY games.name DESC`;
        } else {
            throw new Error("Invalid filterString provided");
        }

        // sends query1 to fetch table
        const games = await db.query(query);

        // if query unsucessful
        if (!games) {
            res.status(400).send("Error fetching games");
        }

        // sends game table
        res.status(200).json(games);

    } catch (error) {
        console.error("Error fetching games", error);
        res.status(500).send("Error occured fetching games.");
    }
    
});

/*
    LISTENER
*/

app.listen(PORT, function(){            // This is the basic syntax for what is called the 'listener' which receives incoming requests on the specified PORT.
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});