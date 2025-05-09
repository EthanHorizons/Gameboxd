-- app.post insert game into user library
INSERT INTO userLibrary (userID, gameID) VALUES (' + userID + ', ' + gameID + ');

-- app.post games, insert new game
INSERT INTO games (name, genreID, platformID, numUsers,
rating, description) VALUES ('${res.body.name}', ${res.body.genreID}, 
${res.body.platformID}, ${res.body.numUsers}, ${res.body.rating}, 
'${res.body.description}');
-- app.put, update a game
UPDATE games 
SET name = '${res.body.name}', 
genreID = ${res.body.genreID}, 
platformID = ${res.body.platformID}, 
numUsers = ${res.body.numUsers}, 
rating = ${res.body.rating}, 
description = '${res.body.description}' 
WHERE gameID = ${res.body.gameID};

-- app.get, get game by gameID
SELECT games.gameID, games.name AS name, genres.name AS genre, 
    platforms.platform AS platform, games.numUsers, 
    games.rating, games.description 
FROM games 
INNER JOIN genres ON genres.genreID = games.genreID 
INNER JOIN platforms ON platforms.platformID = games.platformID 
WHERE games.gameID = ${gameID};

-- app.get all games
SELECT games.gameID, games.name AS name, genres.name AS genre, 
    platforms.platform AS platform, games.numUsers, 
    games.rating, games.description 
FROM games 
INNER JOIN genres ON genres.genreID = games.genreID 
INNER JOIN platforms ON platforms.platformID = games.platformID 
ORDER BY games.rating DESC;
/* we have added filters for the above query that will filter by
games on one platform, a genre, number of users, or rating. 
Here is the attached querys to the end of the above statement:
WHERE ${filterString} = ${filter}
WHERE ${filterString} >= ${filter} */


-- delete a game from userLibrary
DELETE FROM userLibrary 
WHERE gameID = ${gameID} AND userID = ${userID};

-- delete a game;
DELETE FROM games
WHERE gameID = ${gameID};