
DROP PROCEDURE IF EXISTS deleteGame;
DELIMITER //

CREATE PROCEDURE deleteGame(IN gameID INT)
BEGIN
    DELETE FROM games WHERE id = gameID;
END //

DELIMITER ;