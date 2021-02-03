DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertTeam !!
DELIMITER $$
CREATE PROCEDURE  AAU.sp_InsertTeam(
										IN prm_TeamId INT,
										IN prm_TeamName NVARCHAR(64),
										IN prm_Capacity NVARCHAR(64),
                                        IN prm_Colour NVARCHAR(7),
                                        IN prm_IsDeleted TINYINT(1))
BEGIN                                    

/*
Created By: Jim Mackenzie
Created On: 24/08/2018
Purpose: Used to update a team by id.

Modified By: Ankit Singh
Modified On: 03/02/2021
Purpose: Used to update a team by id with colour.
*/

DECLARE vTeamCount INT;
DECLARE vTeamNameCount INT;
DECLARE vSuccess INT;

SET vTeamCount = 0;
SET vTeamNameCount = 0;

SELECT COUNT(1) INTO vTeamCount FROM AAU.Team WHERE TeamId = prm_TeamId;

SELECT COUNT(1) INTO vTeamNameCount FROM AAU.Team WHERE TeamId <> prm_TeamId AND TeamName = prm_TeamName;

IF vTeamCount = 1 AND vTeamNameCount = 0 THEN

	UPDATE AAU.Team
		SET	TeamName	= prm_TeamName,
			Capacity	= prm_Capacity,
            TeamColour  = prm_Colour,
            IsDeleted   = prm_IsDeleted
	WHERE TeamId = prm_TeamId;

	SELECT 1 INTO vSuccess; -- Team update OK.

	ELSEIF vTeamCount = 0 THEN

	SELECT 2 INTO vSuccess; -- Team Doesn't exist

	ELSEIF vTeamCount > 1 THEN

	SELECT 3 INTO vSuccess; -- Multiple records, we have duplicates
    
    ELSEIF vTeamNameCount >= 1 THEN
    
    SELECT 4 INTO vSuccess; -- Team name already exists

	ELSE

	SELECT 4 INTO vSuccess; -- Return misc 

	END IF;
SELECT vSuccess;
END$$
DELIMITER ;
