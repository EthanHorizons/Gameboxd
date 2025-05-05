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
(5, 'Candy Crush Saga', 5, 5, 15000, 8, 'A match-three puzzle game with colorful candies.')
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

 