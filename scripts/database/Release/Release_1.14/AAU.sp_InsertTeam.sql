DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertTeam!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_InsertTeam(
IN prm_TeamName varchar(64),
IN prm_Capacity INT
)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/08/2018
Purpose: Used to inseret a team
*/
DECLARE vTeamExists INT;
DECLARE vTeamId INT;
DECLARE vSuccess INT;

SET vTeamId = 0;
SET vTeamExists = 0;

SELECT COUNT(1) INTO vTeamExists FROM AAU.Team WHERE TeamName = prm_TeamName;

IF vTeamExists = 0 THEN

START TRANSACTION;

	INSERT INTO AAU.Team 
		(
	TeamName, 
	Capacity
		) 
		VALUES (
	prm_TeamName, 
	prm_Capacity
		);

    	SELECT LAST_INSERT_ID() INTO vTeamId;
    	SELECT 1 INTO vSuccess;

COMMIT;

	ELSEIF vTeamExists > 0 THEN
		SELECT 2 INTO vSuccess;
	ELSE
		SELECT 3 INTO vSuccess;
	END IF;
SELECT vTeamId, vSuccess;
END$$
