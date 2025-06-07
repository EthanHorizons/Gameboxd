 USE cs340_ossanae;
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
    SELECT 
        games.gameID,
        games.name,
        genres.name AS genre,
        platforms.platform AS platform,
        games.numUsers,
        games.rating,
        games.description
    FROM games
    INNER JOIN genres ON genres.genreID = games.genreID
    INNER JOIN platforms ON platforms.platformID = games.platformID
    ORDER BY games.rating DESC;
END //

DELIMITER ;

/*
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
-- get filtered games

*AI assisted in the creation of this procedure*
*/
DROP PROCEDURE IF EXISTS getFilteredGames()
DELIMITER //

CREATE PROCEDURE getFilteredGames(
    IN filterString VARCHAR(255),
    IN filterValue VARCHAR(255)
)
BEGIN 
     SET @sql = '
        SELECT 
            games.gameID,
            games.name,
            genres.name AS genre,
            platforms.platform AS platform,
            games.numUsers,
            games.rating,
            games.description
        FROM games
        INNER JOIN genres ON genres.genreID = games.genreID
        INNER JOIN platforms ON platforms.platformID = games.platformID';
    
    IF filterString IS NOT NULL THEN 
        IF filterString = 'genres.name' THEN
            SET @sql = CONCAT(@sql, ' WHERE genres.name = ?');
        ELSEIF filterString = 'platforms.platform' THEN
            SET @sql = CONCAT(@sql, ' WHERE platforms.platform = ?');
        ELSEIF filterString = 'games.numUsers' THEN
            SET @sql = CONCAT(@sql, ' WHERE games.numUsers >= ?');
        ELSEIF filterString = 'games.rating' THEN
            SET @sql = CONCAT(@sql, ' WHERE games.rating >= ?');
        ELSE
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid filterString';
        END IF;
    END IF;

    SET @sql = CONCAT(@sql, ' ORDER BY games.rating DESC');

    IF filterString IS NOT NULL THEN
        PREPARE stmt FROM @sql;
        EXECUTE stmt USING filterValue;
        DEALLOCATE PREPARE stmt;
    ELSE
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
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

DROP PROCEDURE IF EXISTS insertGame;
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

DROP PROCEDURE IF EXISTS insertUser;
DELIMITER //
CREATE PROCEDURE insertUser(
    IN inUsername VARCHAR(255),
    IN inEmail VARCHAR(255)
)
BEGIN
        INSERT INTO users (username, email)
        VALUES (inUsername, inEmail);
END //

DELIMITER ;


DROP PROCEDURE IF EXISTS insertPlatform;
DELIMITER //
CREATE PROCEDURE insertPlatform(IN inPlatform VARCHAR(255))
BEGIN 
    INSERT INTO platforms (platform)
    VALUES (inPlatform);
END //

DELIMITER ;


DROP PROCEDURE IF EXISTS insertGenre;
DELIMITER //
CREATE PROCEDURE insertGenre(IN inName VARCHAR(255))
BEGIN 
    INSERT INTO genres (name)
    VALUES (inName);
END //

DELIMITER ;


DROP PROCEDURE IF EXISTS insertGameToLibrary;
DELIMITER //
CREATE PROCEDURE insertGameToLibrary(
    IN inUserID INT,
    IN inGameID INT)
BEGIN
    INSERT INTO userLibrary (userID, gameID)
    VALUES (inUserID, inGameID);
END //

DELIMITER ;




/* UPDATES */

DROP PROCEDURE IF EXISTS updateGame;
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

DROP PROCEDURE IF EXISTS updateUser;
DELIMITER //

CREATE PROCEDURE updateUser(
    IN inUserID INT,
    IN inUsername VARCHAR(255),
    IN inEmail VARCHAR(255)
)
BEGIN
        UPDATE users
        SET
            username = COALESCE(inUsername, username),
            email = COALESCE(inEmail, email)
        WHERE userID = inUserID;
END //

DELIMITER ;


DROP PROCEDURE IF EXISTS updatePlatform;
DELIMITER //
CREATE PROCEDURE updatePlatform(
    IN inPlatformID INT,
    IN inPlatform VARCHAR(255)
)
BEGIN
        UPDATE platforms
        SET
            platform = COALESCE(inPlatform, platform)
        WHERE platformID = inPlatformID;
END //

DELIMITER ;


DROP PROCEDURE IF EXISTS updateGenre;
DELIMITER //
CREATE PROCEDURE updateGenre(
    IN inGenreID INT,
    IN inName VARCHAR(255)
)
BEGIN
        UPDATE genres
        SET
            name = COALESCE(inName, name)
        WHERE genreID = inGenreID;
END //

DELIMITER ;





/* DELETES */

-- delete game by ID
DROP PROCEDURE IF EXISTS deleteGame;
DELIMITER //

CREATE PROCEDURE deleteGame(IN inGameID INT)
BEGIN
    DELETE FROM games WHERE gameID = inGameID;
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
    DELETE FROM platforms WHERE platformID = inPlatformID;
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
DELIMITER //
CREATE TRIGGER decTotalRemovingGameFromLibrary
AFTER DELETE ON userLibrary
FOR EACH ROW
BEGIN 
    UPDATE users
    set numGames = numGames - 1
    WHERE userID = OLD.userID;
END //

DELIMITER ;

