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
                    INNER JOIN platforms ON platforms.platformID = games.platformID\n`;
const PORT = 53005;     // Set a port number

// Database 
const db = require('./db-connector');
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));


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


/* GETS/SELECTS */

app.get('/', async function (req, res) {

    res.status(200).render('index', {title: 'Home'}); // This is the home page
});

//pages for each entity
app.get('/games', async function (req, res) {
    try {
        const [rows] = await db.query("CALL getGames();");
        res.render('games', { title: 'Games', games: rows[0] });
    } catch (err) {
        console.error('Error calling stored procedure:', err);
        res.status(500).send('Failed to fetch games');
    } 
}); 

// This is the games page
app.get('/users', async function (req, res) {
    try {
        const [rows] = await db.query("CALL getUsers();");
        res.render('users', { title: 'Users', users: rows[0] });
    } catch (err) {
        console.error('Error calling stored procedure:', err);
        res.status(500).send('Failed to fetch users');
    } 
}); 

// This is the users page
app.get('/genres', async function (req, res) {
    try {
        const [rows] = await db.query("CALL getGenres();");
        res.render('genres', { title: 'Genres', genres: rows[0] });
    } catch (err) {
        console.error('Error calling stored procedure:', err);
        res.status(500).send('Failed to fetch genres');
    } 
}); 

// This is the genres page
app.get('/platforms', async function (req, res) {
    try {
        const [rows] = await db.query("CALL getPlatforms();");
        res.render('platforms', { title: 'Platforms', platforms: rows[0] });
    } catch (err) {
        console.error('Error calling stored procedure:', err);
        res.status(500).send('Failed to fetch platforms');
    } 
}); // This is the platform page
app.get('/userLibrary/:id', async function (req, res) {
    try {
        const [rows] = await db.query(`CALL getUserLibrary(?);`, [req.params.id]);
        console.log(rows[0]);
        res.render('userLibrary', { title: 'User Library', library: rows[0], userID: req.params.id });
    } catch (err) {
        console.error('Error calling stored procedure:', err);
        res.status(500).send('Failed to fetch userLibrary');
    } 
}); // This is the page for user libraries
app.get('/reset', (req, res) => {
  res.status(200).render('reset', { title: 'Reset Database' });
});// This is the reset page, only for displaying the reset button


// This is function route to reset the database, its a post request to call the stored procedure
app.post('/reset-db', async (req, res) => {
  try {
    const sql = `CALL resetDatabase();`;
    await db.query(sql);
    res.status(201).send('Success');
  } catch (err) {
    console.error('Error calling stored procedure:', err);
    res.status(500).send('Failed to reset database');
  }
});

/* EDITS */

// edit a game
app.post('/edit-game', async function (req, res) {
   try {
    // Make sure this takes in every input, even if multiple of these values are undefined
    // PL will coalesce to take the older value
    const { name, genreID, platformID, numUsers, rating, description } = req.body;
    const sql = `CALL updateGame(?, ?, ?, ?, ?, ?);`;
    await db.query(sql, [name, genreID, platformID, numUsers, rating, description]);
    res.status(201).redirect('/games').send("Game successfully edited");
   } catch (error) {
    console.error("Error editing game", error)
    res.status(500).send();
   } 
});

//had to modify the delete game function to delete from userLibrary first, then games
// shouldn't this be app.delete?
// TODO CHANGE TO app.delete!!!!!!!!!!!!!!!!!!!!!
app.post('/delete-game', async (req, res) => {
  const gameID = req.body.gameID;
  try {
    // Step 1: Delete from userLibrary
    await db.query('DELETE FROM userLibrary WHERE gameID = ?', [gameID]);

    // Step 2: Delete from games
    await db.query('DELETE FROM games WHERE gameID = ?', [gameID]);

    res.redirect('/games');
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).send('Error deleting game');
  }
});
//need to grab genres, paltforms for live dropdowns
app.get('/get-platforms', async function (req, res) {
    try {
        const [platforms] = await db.query("SELECT platformID, platform FROM platforms ORDER BY platform;");
        res.status(200).json(platforms);
    } catch (error) {
        console.error("Error fetching platforms", error);
        res.status(500).send();
    }
});
app.get('/get-genres', async function (req, res) {
    try {
        const [genres] = await db.query("SELECT genreID, name FROM genres ORDER BY name;");
        res.status(200).json(genres);
    } catch (error) {
        console.error("Error fetching genres", error);
        res.status(500).send();
    }
});
//actually adds to database
app.post('/add-game', async function (req, res) {
    const { name, genreID, platformID, numUsers, rating, description } = req.body;

    try {
        await db.query(
            `INSERT INTO games (name, genreID, platformID, numUsers, rating, description)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, genreID, platformID, numUsers, rating, description]
        );

        res.redirect('/games');
    } catch (err) {
        console.error("Failed to add game:", err);
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
            res.status(404).send("Game not found.");
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


/* DELETES */

// NOTE PLEASE READ:
/* To make this compatible with multiple browsers, I switched the 
DELETE requests to take variables from querys instead of from
req.body. Otherwise, the delete requests should work. Please let me 
know if they aren't working / you need help implementing it */

app.delete('/genre', async function (req, res) {
    try {
        const genreID = req.query.genreID;
        const [result] = await db.query(`DELETE FROM genres WHERE genreID = ?`, [genreID]);
        if (result.affectedRows == 0) {
            res.status(404).send("Genre not found");
        }
        res.status(204).send();
    } catch(error) {
        console.error("Could not remove genre", error);
        res.status(500).send();
    }
});

app.delete('/platform', async function (req, res) {
    try {
        const platformID = req.query.platformID;
        const [result] = await db.query(`DELETE FROM platforms WHERE platformID = ? `, [platformID]);
        if (result.affectedRows == 0) {
            res.status(404).send("Platform not found");
        }
        res.status(204).send();
    } catch(error) {
        console.error("Could not remove platform", error);
        res.status(500).send();
    }
});

app.delete('/users/', async function (req, res) {
    try {
        const userID = req.query.userID;
        const [result] = await db.query(`DELETE FROM users WHERE userID = ? `, [userID]);
        if (result.affectedRows == 0) {
            res.status(404).send("User not found");
        }
    } catch(error) {
        console.error("Could not remove user", error);
        res.status(500).send();
    }
});

app.delete('/userLibrary/:userID', async function (req, res) {
    try {
        const { gameID } = req.query.gameID;
        const userID = req.params.userID;
        const [result] = await db.query(`DELETE FROM userLibrary WHERE userID = ? AND gameID = ?`, [userID, gameID]);
        if (result.affectedRows == 0) {
            res.status(404).send("Game not found in user library");
        }
    } catch(error) {
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