DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertTeam!!

DELIMITER $$


CREATE PROCEDURE AAU.sp_InsertTeam(
IN prm_Username VARCHAR(45),
IN prm_TeamName varchar(64),
IN prm_Colour varchar(7),
IN prm_Capacity INT
)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/08/2018
Purpose: Used to inseret a team

Modified By: Ankit Singh
Created On: 03/02/2021
Purpose: Used to inseret a team with colour
*/
DECLARE vTeamExists INT;
DECLARE vTeamId INT;
DECLARE vSuccess INT;
DECLARE vOrganisationId INT;

SET vTeamId = 0;
SET vTeamExists = 0;

SELECT COUNT(1) INTO vTeamExists FROM AAU.Team WHERE TeamName = prm_TeamName;
SELECT u.OrganisationId INTO vOrganisationId FROM AAU.User u WHERE UserName = prm_Username LIMIT 1;

IF vTeamExists = 0 THEN

START TRANSACTION;

	INSERT INTO AAU.Team 
		(
	TeamName, 
	Capacity,
    TeamColour,
    OrganisationId
		) 
		VALUES (
	prm_TeamName, 
	prm_Capacity,
    prm_Colour,
    vOrganisationId
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
DELIMITER ;