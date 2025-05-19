-- SQL file to create all of our tables
DROP TABLE IF EXISTS userLibrary;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS genres;
DROP TABLE IF EXISTS platforms;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    userID int(11) NOT NULL AUTO_INCREMENT,
    username varchar(255) NOT NULL,
    email varchar(255) NOT NULL,
    numGames int(11) NOT NULL,
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
    genreID int(11) NOT NULL,
    platformID int(11) NOT NULL,
    numUsers int (11),
    rating int(11),
    description varchar(255),
    PRIMARY KEY (gameID),
    FOREIGN KEY (genreID) REFERENCES genres(genreID),
    FOREIGN KEY (platformID) REFERENCES platforms(platformID)
);

CREATE TABLE userLibrary (
    userID int(11) NOT NULL,
    gameID int(11) NOT NULL,
    FOREIGN KEY (userID) REFERENCES users(userID),
    FOREIGN KEY (gameID) REFERENCES games(gameID)
);


INSERT INTO `users` (`userID`,`username`, `email`, `numGames`) VALUES
(1, 'John Doe', 'jonny@example.com', 3),
(2, 'Jane Smith', 'janey@example.com', 2),
(3, 'Alice Johnson', 'coolio@example.com', 2),
(4, 'Bob Brown', 'epic@example.com', 2),
(5, 'Charlie Black', 'newemail@example.com', 1);

INSERT INTO `platforms` (`platformID`, `platform`) VALUES
(1, 'PC'),
(2, 'Xbox One'),
(3, 'PlayStation 4'),
(4, 'Nintendo Switch'),
(5, 'Mobile');

INSERT INTO `games` (`gameID`, `name`, `genreID`, `platformID`, `numUsers`, `rating`, `description`) VALUES
(1, 'The Witcher 3', 1, 1, 1000, 10, 'An open-world RPG set in a fantasy universe.'),
(2, 'Halo Infinite', 2, 2, 5000, 9, 'A first-person shooter game set in a sci-fi universe.'),
(3, 'God of War', 3, 3, 3000, 10, 'An action-adventure game based on Norse mythology.'),
(4, 'Zelda: Breath of the Wild', 4, 4, 2000, 10, 'An open-world action-adventure game set in Hyrule.'),
(5, 'Candy Crush Saga', 5, 5, 15000, 8, 'A match-three puzzle game with colorful candies.'),
(6, 'Minecraft', 1, 1, 12000, 9, 'A sandbox game that allows players to build and explore worlds.'),
(7, 'Fortnite', 2, 5, 20000, 8, 'A battle royale game with building mechanics.'),
(8, 'Overwatch', 3, 2, 8000, 9, 'A team-based multiplayer first-person shooter.'),
(9, 'The Last of Us', 4, 3, 6000, 10, 'An action-adventure game set in a post-apocalyptic world.'),
(10, 'Among Us', 5, 5, 25000, 7, 'A multiplayer social deduction game set in space.');

INSERT INTO `userLibrary` (`userID`, `gameID`) VALUES
(1, 1),
(1, 2),
(1, 3),
(2, 4),
(2, 5),
(3, 6),
(3, 7),
(4, 8),
(4, 9),
(5, 10);

INSERT INTO `genres`(`genreID`, `name`)
VALUES 
(1, 'horror'), (2, 'adventure'), (3, 'action'), (4, 'multiplayer'), (5, 'fps'), (6, 'rpg'),
(7, 'singleplayer'), (8, 'rougelike'), (9, 'puzzle'), (10, 'turn-based'), (11, 'simulation'), 
(12, 'sports'), (13, 'open-world'), (14, 'strategy');