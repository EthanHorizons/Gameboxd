   /* Citation for use of AI Tools:
    # Date: 05/29/25
    # Prompts used to generate PL/SQL:
    # Helped to modify multiple procedures after copy pasting for different pages, preforming basic tedious work
    # AI Source URL: https://copilot.microsoft.com/
*/

-- PL get requests of different tables to be called in .get in app.js


/* SELECTS */

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

/* INSERTS */

DROP PROCEDURE IF EXISTS insertGame
DELIMITER //
CREATE PROCEDURE insertGame(
    IN inName VARCHAR(255),
    IN inGenreID INT,
    IN inPlatformID INT,
    IN inNumUsers INT,
    IN inRating INT,
    IN inDescription VARCHAR(255))
BEGIN
    INSERT INTO games (name, genreID, platformID, numUsers, rating, description)
    VALUES (inName, inGenreID, inPlatformID, inNumUsers, inRating, inDescription);
END //

DELIMITER ;



/* UPDATES */

DROP PROCEDURE IF EXISTS updateGame
DELIMITER //

CREATE PROCEDURE updateGame(
    IN inGameID INT,
    IN inName VARCHAR(255),
    IN inGenreID INT,
    IN inPlatformID INT,
    IN inNumUsers INT,
    IN inRating INT,
    IN inDescription VARCHAR(255))
BEGIN
    UPDATE games
    SET 
        name = COALESCE(inName, name),
        genreID = COALESCE(inGenreID, genreID),
        platformID = COALESCE(inPlatformID, platformID),
        numUsers = COALESCE(inNumUsers, numUsers),
        rating = COALESCE(inRating, rating),
        description = COALESCE(inDescription, description)
    WHERE gameID = inGameID;
END //

DELIMITER ;



/* DELETES */

-- delete game by ID
DROP PROCEDURE IF EXISTS deleteGame;
DELIMITER //

CREATE PROCEDURE deleteGame(IN gameID INT)
BEGIN
    DELETE FROM games WHERE id = gameID;
END //

DELIMITER ;

-- delete user by ID
DROP PROCEDURE IF EXISTS deleteUser;
DELIMITER //

CREATE PROCEDURE deleteUser(IN inUserID INT)
BEGIN
    DELETE FROM users WHERE userID = inUserID;
END //

DELIMITER ;

-- delete genre by ID
DROP PROCEDURE IF EXISTS deleteGenre;
DELIMITER //

CREATE PROCEDURE deleteGenre(IN inGenreID INT)
BEGIN
    DELETE FROM genres WHERE genreID = inGenreID;
END //

DELIMITER ;


-- delete platform by ID
DROP PROCEDURE IF EXISTS deletePlatform;
DELIMITER //

CREATE PROCEDURE deletePlatform(IN inPlatformID INT)
BEGIN
    DELETE FROM plaftorms WHERE platformID = inPlatformID;
END //

DELIMITER ;


-- delete game from library by ID
DROP PROCEDURE IF EXISTS deleteGameFromUserLibrary;
DELIMITER //

CREATE PROCEDURE deleteGameFromUserLibrary(IN inGameID INT, IN inUserID INT)
BEGIN
    DELETE FROM userLibrary WHERE userID = inUserID AND gameID = inGameID;
END //

DELIMITER ;



/* TRIGGERS */

-- trigger that will add 1 to numGames of a user when adding a game to library
DROP TRIGGER IF EXISTS incTotalAddingGameToLibrary;
DELIMITER //
CREATE TRIGGER incTotalAddingGameToLibrary
AFTER INSERT ON userLibrary
FOR EACH ROW 
BEGIN 
    UPDATE users
    SET numGames = numGames + 1
    WHERE userID = NEW.userID;
END //

DELIMITER ;

-- trigger that will delete 1 from numGames of a user upon removing game from library
DROP TRIGGER IF EXISTS decTotalRemovingGameFromLibrary;
DELIMITTER //
CREATE TRIGGER decTotalRemovingGameFromLibrary
AFTER DELETE ON userLibrary
FOR EACH ROW
BEGIN 
    UPDATE users
    set numGames = numGames - 1
    WHERE userID = OLD.userID
END //

DELIMITTER ;

