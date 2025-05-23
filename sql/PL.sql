-- PL get requests of different tables to be called in .get in app.js


-- get games table
DROP PROCEDURE IF EXISTS getGames;
DELIMITER //

CREATE PROCEDURE getGames()
BEGIN
    SELECT * 
    FROM games
    ORDER BY rating DESC;
END //

DELIMITER ;

-- get genres table
DROP PROCEDURE IF EXISTS getGenres;
DELIMITER //

CREATE PROCEDURE getGenres()
BEGIN
    SELECT * 
    FROM genres
    ORDER BY name DESC;
END //

DELIMITER ;

-- get user table
DROP PROCEDURE IF EXISTS getUsers;
DELIMITER //

CREATE PROCEDURE getUsers()
BEGIN
    SELECT * 
    FROM users
    ORDER BY username DESC;
END //

DELIMITER ;

-- get platforms table
DROP PROCEDURE IF EXISTS getPlatforms;
DELIMITER //

CREATE PROCEDURE getPlatforms()
BEGIN
    SELECT * 
    FROM platforms
    ORDER BY platform DESC;
END //

DELIMITER ;


-- get userLibrary table
DROP PROCEDURE IF EXISTS getUserLibrary;
DELIMITER //
-- ID	Name	Genre ID	Platform ID	Users	Rating	Description
CREATE PROCEDURE getUserLibrary(IN inUserID INT)
BEGIN
    SELECT userLibrary.gameID AS ID, games.name, genres.name AS genre, 
        platforms.platform, games.numUsers, games.rating, 
        games.description
    FROM userLibrary
    INNER JOIN games ON games.gameID = userLibrary.gameID
    INNER JOIN users ON users.userID = userLibrary.userID
    INNER JOIN genres ON genres.genreID = games.genreID
    INNER JOIN platforms ON platforms.platformID = games.platformID
    WHERE userLibrary.userID = inUserID
    ORDER BY games.name DESC;
END //

DELIMITER ;


-- delete game by ID
DROP PROCEDURE IF EXISTS deleteGame;
DELIMITER //

CREATE PROCEDURE deleteGame(IN gameID INT)
BEGIN
    DELETE FROM games WHERE id = gameID;
END //

DELIMITER ;