/*
    SETUP
*/
//uses pm2 to run the server
// pm2 start app.js --name "gameboxd" --watch
// TO START:    npm run prod
// TO STOP:     npm run stop




// Express
const express = require('express');  // We are using the express library for the web server
const exphbs = require('express-handlebars'); // We are using the express-handlebars library for the templating engine
const path = require('path');

const app = express();               // We need to instantiate an express object to interact with the server in our code


// basic sql table used in multiple .get requests
const basic_table = `SELECT games.gameID, games.name AS name, genres.name AS genre, 
                        platforms.platform AS platform, games.numUsers, 
                        games.rating, games.description 
                    FROM games 
                    INNER JOIN genres ON genres.genreID = games.genreID 
                    INNER JOIN platforms ON platforms.platformID = games.platformID `;
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
    res.render('platforms', {title: 'Platforms'});
}); // This is the platform page
app.get('/userLibrary', async function (req, res) {
    res.render('userLibrary', {title: 'User Library'});
}); // This is the page for user libraries



app.post('/insert', async function (req, res) {
try {
    const { userID, gameID } = req.body;
    
    if (!userID || !gameID) {
        return res.status(400).send("userID or gameID missing from req.body");
    }

    const query = 'INSERT INTO userLibrary (userID, gameID) VALUES (' + userID + ', ' + gameID + ');';

    await db.query(query);

    res.status(201).send("Game successfully added to library");
} catch (error) {
    console.error("Error adding game to library", error);
    res.status(500).send();
}
}); 

app.post('/games', async function (req, res) {
    try {
        const query = await db.query(`INSERT INTO games (name, genreID, platformID, numUsers,
                        rating, description) VALUES ('${res.body.name}', ${res.body.genreID}, 
                        ${res.body.platformID}, ${res.body.numUsers}, ${res.body.rating}, 
                        '${res.body.description}'`);
        if (query.affectedRows == 0) {
            res.status(404).send("Game not added to database");
        }
        res.status(201).send("successfully added to database");
    } catch (error) {
        console.error("/games could nott add new game", error);
    }
});

app.put('/games/:gameID', async function (req, res) {
    try {
        const query = await db.query(`UPDATE games 
                             SET name = '${res.body.name}', 
                                genreID = ${res.body.genreID}, 
                                platformID = ${res.body.platformID}, 
                                numUsers = ${res.body.numUsers}, 
                                rating = ${res.body.rating}, 
                                description = '${res.body.description}' 
                            WHERE gameID = ${res.body.gameID};`);
    
        res.status(200).json(library);

    } catch (error) {
        console.error("Error occured getting userLibary by userID", error);
        res.status(500).send();
    }
});

// gets game based off of gameID
app.get('/games/:gameID', async function (req, res) {
    const gameID = req.params.gameID;
    try {
        if (!gameID) {
            throw new Error("No ID provided");
        }
        const game = await db.query(basic_table + ` WHERE games.gameID = ${gameID};`);
        
        if (!game || game.length === 0) {
            res.status(404).useChunkedEncodingByDefault("Game not found.");
        }

        res.status(200).json(game);
    } catch (error) {
        console.error(`Error fetching game by gameID`, error);
        res.status(500).send();
    }
});

/* 
Description: returns the table of games with optional filter as well. can sort by genre, platform,
greater than {filter} rating or numUsers. 

Parameters: (Optional)
    filterString:
        NULL- filter does not exist, returns all games
        genres.name - filter for genre
        platforms.platform - filter for platform
        games.numUsers- filter for numUsers
        games.rating- filter for rating
        anything else- throw an error
    filter:
        if filterSting exists, cannot be NULL
        the thing to be filtered through sliders/inputs
        ex: filterString = genres.name, filter = 'rpg'
*/
app.get('/dashboard', async function (req, res) {
    try {
        // filters as selected by user to sort the list of games
        const {filterString, filter} = req.query;
        let query1 = basic_table;

        // if no filter provided
        if (!filterString || !filter) {
            // returns a table of all games
            query1 += ` ORDER BY games.rating DESC;`;
        } 
        // if filter is sorting by genre or platform
        else if (filterString == "genres.name" || filterString == "platforms.platform") {
            // returns table with just one genre or just one platform
            query1 += ` WHERE ${filterString} = ${filter}
                        ORDER BY games.rating DESC;`;
        } 
        // if filter is sorting by number of users or rating of game
        else if (filterString == "games.numUsers" || filterString == "games.rating") {
            // returns table with every game > {filter} rating or numUsers
            query1 += ` WHERE ${filterString} >= ${filter}
                        ORDER BY games.name DESC;`;
        } else {
            throw new Error("Invalid filterString provided");
        }

        // sends query1 to fetch table
        const games = await db.query(query1);

        // if query unsucessful
        if (!games || games.length === 0) {
            res.status(404).send("No games found");
        }

        // sends game table
        res.status(200).json(games);

    } catch (error) {
        console.error("Error fetching gamesin /dashboard", error);
        res.status(500).send();
    }
    
});

app.delete('/userLibrary/:userID', async function (req, res) {
    const { gameID } = req.body;
    const userID = req.params.userID;

    try {
        if (!gameID || !userID) {
            throw new Error("User or game ID does not exist");
        } 

        const query = await db.query(`DELETE FROM userLibrary 
                        WHERE gameID = ${gameID} AND userID = ${userID};`);

        if (query.affectedRows === 0) {
            throw new Error(`Could not delete row \nuserID: ${userID} gameID: ${gameID}`);
        }

        res.status(204).send(query.affectedRows);
    } catch (error) {
        console.error("Could not remove game from userLibrary", error);
        res.status(500).send();
    }
});




/*
    LISTENER
*/

app.listen(PORT, function(){            // This is the basic syntax for what is called the 'listener' which receives incoming requests on the specified PORT.
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});