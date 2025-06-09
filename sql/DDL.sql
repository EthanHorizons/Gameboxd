DELIMITER //
CREATE PROCEDURE resetDatabase()
BEGIN
    SET FOREIGN_KEY_CHECKS=0;

    DROP TABLE IF EXISTS userLibrary;
    DROP TABLE IF EXISTS games;
    DROP TABLE IF EXISTS genres;
    DROP TABLE IF EXISTS platforms;
    DROP TABLE IF EXISTS users;


    CREATE TABLE users (
        userID int(11) NOT NULL AUTO_INCREMENT,
        username varchar(255) NOT NULL,
        email varchar(255) NOT NULL,
        numGames int(11) NOT NULL DEFAULT 0,
        PRIMARY KEY (userID)
    );

    CREATE TABLE platforms (
        platformID int(11) NOT NULL AUTO_INCREMENT,
        platform varchar(255) NOT NULL,
        PRIMARY KEY (platformID)
    );

    CREATE TABLE genres (
        genreID int(11) NOT NULL AUTO_INCREMENT,
        name varchar(255),
        PRIMARY KEY (genreID)
    );

    CREATE TABLE games (
        gameID int(11) NOT NULL AUTO_INCREMENT,
        name varchar(255) NOT NULL,
        genreID int(11) NULL,
        platformID int(11) NULL,
        numUsers int(11),
        rating int(11),
        description varchar(255),
        PRIMARY KEY (gameID),
        FOREIGN KEY (genreID) REFERENCES genres(genreID) ON DELETE SET NULL,
        FOREIGN KEY (platformID) REFERENCES platforms(platformID) ON DELETE SET NULL
    );

    CREATE TABLE userLibrary (
        userID int(11) NOT NULL,
        gameID int(11) NOT NULL,
        FOREIGN KEY (userID) REFERENCES users(userID) ON DELETE CASCADE,
        FOREIGN KEY (gameID) REFERENCES games(gameID) ON DELETE CASCADE
    );


    -- insert data into tables

    INSERT INTO `users` (`userID`,`username`, `email`, `numGames`) VALUES
    (1, 'John Doe', 'jonny@example.com'),
    (2, 'Jane Smith', 'janey@example.com'),
    (3, 'Alice Johnson', 'coolio@example.com'),
    (4, 'Bob Brown', 'epic@example.com'),
    (5, 'Charlie Black', 'newemail@example.com');

    INSERT INTO `platforms` (`platformID`, `platform`) VALUES
    (1, 'PC'),
    (2, 'Xbox One'),
    (3, 'PlayStation 4'),
    (4, 'Nintendo Switch'),
    (5, 'Mobile');

    INSERT INTO `genres`(`genreID`, `name`)
    VALUES 
    (1, 'horror'), (2, 'adventure'), (3, 'action'), (4, 'multiplayer'), (5, 'fps'), (6, 'rpg'),
    (7, 'singleplayer'), (8, 'rougelike'), (9, 'puzzle'), (10, 'turn-based'), (11, 'simulation'), 
    (12, 'sports'), (13, 'open-world'), (14, 'strategy');

    INSERT INTO `games` (`gameID`, `name`, `genreID`, `platformID`, `numUsers`, `rating`, `description`) VALUES
    (1, 'The Witcher 3', (SELECT genreID FROM genres WHERE name = 'rpg'), (SELECT platformID FROM platforms WHERE platform = 'PC'), 1000, 10, 'An open-world RPG set in a fantasy universe.'),
    (2, 'Halo Infinite', (SELECT genreID FROM genres WHERE name = 'fps'), (SELECT platformID FROM platforms WHERE platform = 'Xbox One'), 5000, 9, 'A first-person shooter game set in a sci-fi universe.'),
    (3, 'God of War', (SELECT genreID FROM genres WHERE name = 'adventure'), (SELECT platformID FROM platforms WHERE platform = 'PlayStation 4'), 3000, 10, 'An action-adventure game based on Norse mythology.'),
    (4, 'Zelda: Breath of the Wild', (SELECT genreID FROM genres WHERE name = 'open-world'), (SELECT platformID FROM platforms WHERE platform = 'Nintendo Switch'), 2000, 10, 'An open-world action-adventure game set in Hyrule.'),
    (5, 'Candy Crush Saga', (SELECT genreID FROM genres WHERE name = 'strategy'), (SELECT platformID FROM platforms WHERE platform = 'Mobile'), 15000, 8, 'A match-three puzzle game with colorful candies.'),
    (6, 'Minecraft', (SELECT genreID FROM genres WHERE name = 'open-world'), (SELECT platformID FROM platforms WHERE platform = 'PC'), 12000, 9, 'A sandbox game that allows players to build and explore worlds.'),
    (7, 'Fortnite', (SELECT genreID FROM genres WHERE name = 'fps'), (SELECT platformID FROM platforms WHERE platform = 'Mobile'), 20000, 8, 'A battle royale game with building mechanics.'),
    (8, 'Overwatch', (SELECT genreID FROM genres WHERE name = 'fps'), (SELECT platformID FROM platforms WHERE platform = 'Xbox One'), 8000, 9, 'A team-based multiplayer first-person shooter.'),
    (9, 'The Last of Us', (SELECT genreID FROM genres WHERE name = 'adventure'), (SELECT platformID FROM platforms WHERE platform = 'PlayStation 4'), 6000, 10, 'An action-adventure game set in a post-apocalyptic world.'),
    (10, 'Among Us', (SELECT genreID FROM genres WHERE name = 'multiplayer'), (SELECT platformID FROM platforms WHERE platform = 'Mobile'), 25000, 7, 'A multiplayer social deduction game set in space.');

    INSERT INTO `userLibrary` (`userID`, `gameID`) VALUES
    ((SELECT userID FROM users WHERE username = 'John Doe'), (SELECT gameID FROM games WHERE name = 'The Witcher 3')),
    ((SELECT userID FROM users WHERE username = 'John Doe'), (SELECT gameID FROM games WHERE name = 'Halo Infinite')),
    ((SELECT userID FROM users WHERE username = 'John Doe'), (SELECT gameID FROM games WHERE name = 'God of War')),
    ((SELECT userID FROM users WHERE username = 'Jane Smith'), (SELECT gameID FROM games WHERE name = 'Zelda: Breath of the Wild')),
    ((SELECT userID FROM users WHERE username = 'Jane Smith'), (SELECT gameID FROM games WHERE name = 'Candy Crush Saga')),
    ((SELECT userID FROM users WHERE username = 'Alice Johnson'), (SELECT gameID FROM games WHERE name = 'Minecraft')),
    ((SELECT userID FROM users WHERE username = 'Alice Johnson'), (SELECT gameID FROM games WHERE name = 'Fortnite')),
    ((SELECT userID FROM users WHERE username = 'Bob Brown'), (SELECT gameID FROM games WHERE name = 'Overwatch')),
    ((SELECT userID FROM users WHERE username = 'Bob Brown'), (SELECT gameID FROM games WHERE name = 'The Last of Us')),
    ((SELECT userID FROM users WHERE username = 'Charlie Black'), (SELECT gameID FROM games WHERE name = 'Among Us'));

    SET FOREIGN_KEY_CHECKS=1;

END //
DELIMITER ;