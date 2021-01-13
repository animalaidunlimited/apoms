CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetTeamByTeamId`(IN prm_TeamId INT)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 24/08/2018
Purpose: Used to return a team by ID.
*/

SELECT
		t.TeamId,
		t.TeamName,
		SUM(t.Capacity) AS Capacity
FROM AAU.Team t
LEFT JOIN AAU.Case c ON c.TeamId = t.TeamId
LEFT JOIN AAU.Visit v ON v.StreetTreatCaseId = c.CaseId
WHERE (t.TeamId = prm_TeamId OR prm_TeamId IS NULL)
GROUP BY 	t.TeamId,
			t.TeamName;
END