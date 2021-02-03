DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetAllTeams !!
DELIMITER $$
CREATE PROCEDURE  AAU.sp_GetAllTeams()
BEGIN
/*
Created By: Jim Mackenzie
Created On: 23/08/2018
Purpose: Used to return a list of the teams

Modified By: Ankit Singh
Modifeid On: 03/02/2021
Purpose: Used to return a list of the teams with colour
*/

SELECT t.TeamId, t.TeamName, t.Capacity, t.TeamColour, COUNT(u.UserId) AS Members, t.IsDeleted
FROM AAU.Team t
LEFT OUTER JOIN AAU.User u ON u.TeamId = t.TeamId
WHERE t.IsDeleted != 1
GROUP BY t.TeamId, t.TeamName, t.Capacity, t.IsDeleted, t.TeamColour;

END$$
DELIMITER ;
