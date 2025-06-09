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
//this is the games page
app.get('/games', async function (req, res) {
    try {
        const [rows] = await db.query("CALL getGames();");
        res.render('games', { title: 'Games', games: rows[0] });
    } catch (err) {
        console.error('Error calling stored procedure:', err);
        res.status(500).send('Failed to fetch games');
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
app.get('/games-filter', async function (req, res) {
    const filterString = req.query.filterString;
    const filter = req.query.filter;
    try {
        const sql = 'CALL getFilteredGames(?, ?)';
        const [rows] = await db.query(sql, [filterString, filter]);
        res.render('games', {title: 'Games', games:rows[0]});
    } catch (err) {
        console.error('Error filtering games ', err)
        res.status(500).send('Failed to filter games');
    }
});

// This is the users page
app.get('/users', async function (req, res) {
    try {
        const [rows] = await db.query("CALL getUsers();");
        res.render('users', { title: 'Users', users: rows[0] });
    } catch (err) {
        console.error('Error calling stored procedure:', err);
        res.status(500).send('Failed to fetch users');
    } 
}); 

// This is the genres page
app.get('/genres', async function (req, res) {
    try {
        const [rows] = await db.query("CALL getGenres();");
        res.render('genres', { title: 'Genres', genres: rows[0] });
    } catch (err) {
        console.error('Error calling stored procedure:', err);
        res.status(500).send('Failed to fetch genres');
    } 
}); 

// This is the platforms page
app.get('/platforms', async function (req, res) {
    try {
        const [rows] = await db.query("CALL getPlatforms();");
        res.render('platforms', { title: 'Platforms', platforms: rows[0] });
    } catch (err) {
        console.error('Error calling stored procedure:', err);
        res.status(500).send('Failed to fetch platforms');
    } 
});

// This is the user Library page
app.get('/userLibrary/:id', async function (req, res) {
    try {
        const requestedID = parseInt(req.params.id);

        const [userRows] = await db.query('SELECT userID FROM users ORDER BY userID');
        const validUserIDs = userRows.map(row => row.userID);

        if (!validUserIDs.includes(requestedID)) {
            // Redirect to first valid user if requested one doesn't exist
            if (validUserIDs.length > 0) {
                return res.redirect(`/userLibrary/${validUserIDs[0]}`);
            } else {
                return res.status(404).send('No users found.');
            }
        }
        const [rows] = await db.query(`CALL getUserLibrary(?);`, [req.params.id]);
        res.render('userLibrary', { 
            title: 'User Library', 
            library: rows[0], 
            userID: req.params.id, 
            validUserIDs: JSON.stringify(validUserIDs) });
    } catch (err) {
        console.error('Error calling stored procedure:', err);
        res.status(500).send('Failed to fetch userLibrary');
    } 
}); 




/* RESETS */

// This is the page for user libraries
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


/* GET Routes for getting genres, platforms, and users */
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
// this is for dropdown in library page
app.get('/games-not-in-user', async function (req, res) {
  const inUserID = req.query.userID || null;
  
  try {
    const sql = 'CALL getGamesNotInUserLibrary(?)';
    const [rows] = await db.query(sql, [inUserID]);
    
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error('Error getting games not in user library (JSON)', err);
    res.status(500).send('Failed to get games');
  }
});

/* POST/ADDS */

app.post('/add-game', async function (req, res) {
    let { name, genreID, platformID, numUsers, rating, description } = req.body;
    genreID = genreID === '' ? null : genreID;
    platformID = platformID === '' ? null : platformID;
    try {
        const sql = `CALL insertGame(?, ?, ?, ?, ?, ?)`;
        await db.query(sql, [name, genreID, platformID, numUsers, rating, description])
        res.redirect('/games');
    } catch (err) {
        console.error("Failed to add game:", err);
        res.status(500).send();
    }
});

app.post('/add-user', async function (req, res) {
    const { username, email } = req.body;

    try {
        const sql = `CALL insertUser(?, ?)`;
        await db.query(sql,  [username, email])
        res.redirect('/users');
    } catch (err) {
        console.error("Failed to add user:", err);
        res.status(500).send();
    }
});

app.post('/add-platform', async function (req, res) {
    const { platform} = req.body;

    try {
        const sql = `CALL insertPlatform(?)`;
        await db.query(sql,  [platform])
        res.redirect('/platforms');
    } catch (err) {
        console.error("Failed to add platform:", err);
        res.status(500).send();
    }
});

app.post('/add-genre', async function (req, res) {
    const { name } = req.body;

    try {
        const sql = `CALL insertGenre(?)`;
        await db.query(sql, [name])
        res.redirect('/genres');
    } catch (err) {
        console.error("Failed to add genre:", err);
        res.status(500).send();
    }
});

// hopefully functional, just send game and user IDs
app.post('/add-game-library/:id', async function (req, res) {
    const { gameID } = req.body;
    const userID = req.params.id;

    try {
        const sql = `CALL insertGameToLibrary(?, ?)`;
        await db.query(sql, [userID, gameID])
        res.redirect(`/userLibrary/${userID}`);
    } catch (err) {
        console.error("Failed to add game to user library:", err);
        res.status(500).send();
    }
});





/* EDITS */
// Make sure this takes in every input, even if multiple of these values are undefined
// PL will coalesce to take the older value

// edit a game
app.post('/edit-game', async function (req, res) {
   try {
    const { gameID, name, genreID, platformID, numUsers, rating, description } = req.body;
    const sql = `CALL updateGame(?, ?, ?, ?, ?, ?, ?);`;
    await db.query(sql, [gameID, name, genreID, platformID, numUsers, rating, description]);
    res.redirect('/games');
   } catch (error) {
    console.error("Error editing game", error)
    res.status(500).send();
   } 
});

app.post('/edit-user', async function (req, res) {
   try {
    const { userID, username, email } = req.body;
    const sql = `CALL updateUser(?, ?, ?);`;
    await db.query(sql, [userID, username, email]);
    res.redirect('/users');
   } catch (error) {
    console.error("Error editing user", error);
    res.status(500).send();
   } 
});

app.post('/edit-platform', async function (req, res) {
   try {
    const { platformID, platform } = req.body;
    const sql = `CALL updatePlatform(?, ?);`;
    await db.query(sql, [platformID, platform]);
    res.redirect('/platforms');
   } catch (error) {
    console.error("Error editing platform", error);
    res.status(500).send();
   } 
});

app.post('/edit-genre', async function (req, res) {
   try {
    const { genreID, name } = req.body;
    const sql = `CALL updateGenre(?, ?);`;
    await db.query(sql, [genreID, name]);
    res.redirect('/genres');
   } catch (error) {
    console.error("Error editing genre", error);
    res.status(500).send();
   } 
});

app.post('/update-user-library:id', async function  (req, res) {
    try {
        const {oldGenreID, newGenreID} = req.body;
        const userID = req.params.id;

        const sql = `CALL updateUserLibraryGame(?, ?, ?)`;
        await db.query(sql, [userID, oldGenreID, newGenreID]);
        res.redirect(`/userLibrary:${userID}`);
    } catch (error) {
        console.error("Error editing user Library game ", error);
        res.status(500).send();
    }
})







/* DELETES */

// NOTE PLEASE READ:
/* I lied to you, delete is not compatible. stick to app.post */
app.post('/delete-game', async (req, res) => {
  const gameID = req.body.gameID;
  try {
    // Call the stored procedure instead of raw DELETEs
    const [result] = await db.query('CALL deleteGame(?)', [gameID]);

    // Optionally check if the game was actually deleted
    // Since CALL doesn't return affectedRows, you might check this in your procedure or assume success
    res.redirect('/games');
  } catch (error) {
    console.error('Error calling delete_game procedure:', error);
    res.status(500).send('Error deleting game');
  }
});


app.post('/delete-genre', async function (req, res) {
    try {
        const genreID = req.body.genreID;
        const [result] = await db.query(`DELETE FROM genres WHERE genreID = ?`, [genreID]);
        if (result.affectedRows == 0) {
            return res.status(404).send("Genre not found");
        }
        res.redirect('/genres');
    } catch(error) {
        console.error("Could not remove genre", error);
        res.status(500).send();
    }
});

app.post('/delete-platform', async function (req, res) {
    try {
        const platformID = req.body.platformID;
        const [result] = await db.query(`DELETE FROM platforms WHERE platformID = ? `, [platformID]);
        if (result.affectedRows == 0) {
            return res.status(404).send("Platform not found");
        }
        res.redirect('/platforms');
    } catch(error) {
        console.error("Could not remove platform", error);
        res.status(500).send();
    }
});

app.post('/delete-user', async function (req, res) {
    try {
        const userID = req.body.userID;

        // Call the stored procedure instead of direct delete
        await db.query('CALL deleteUser(?)', [userID]);

        res.redirect('/users');
    } catch (error) {
        console.error("Could not remove user", error);
        res.status(500).send("Error deleting user");
    }
});

// delete game from user library
app.post('/delete-from-library', async function (req, res) {
    try {
        const { gameID, userID } = req.body;
        const [result] = await db.query(
            'DELETE FROM userLibrary WHERE userID = ? AND gameID = ?',
            [userID, gameID]
        );
        if (result.affectedRows === 0) {
            return res.status(404).send("Game not found in user library");
        }
        res.redirect(`/userLibrary/${userID}`);
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


