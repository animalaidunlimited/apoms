DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetActiveCasesForTeamByDate!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetActiveCasesForTeamByDate(	IN prm_teamId INT,
																		IN prm_visitDate DATE
																	)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 18/11/2020
Purpose: Used to return active cases for the StreetTreat mobile app.
*/

DECLARE prmVisitDate DATE;

	SELECT IFNULL(prm_visitDate, CURDATE()) INTO prmVisitDate;
    -- SELECT CURDATE() INTO prmVisitDate;

	SELECT
			c.CaseId,
			c.EmergencyNumber,
            c.TagNumber,
			at.AnimalType,
            at.AnimalTypeId,
            s.Status,
            s.StatusId,
			c.AnimalName,
			nv.NextVisit,
            nv.NextVisitStatusId,
			pc.PercentComplete,
			c.Address,
			p.Priority,
            p.PriorityId,
            t.TeamName,
            t.TeamId,
            c.Latitude,
            c.Longitude,
            c.ComplainerName,
            c.ComplainerNumber,
            c.AdminNotes,
            c.OperatorNotes,
            c.ReleasedDate,
            c.ClosedDate,
            c.EarlyReleaseFlag,
            c.MainProblemId,
            mp.MainProblem
	FROM AAU.Case c
	INNER JOIN AAU.Status s ON s.StatusId = c.StatusId
	INNER JOIN AAU.Priority p ON p.PriorityId = c.PriorityId
	INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = c.AnimalTypeId
	INNER JOIN AAU.Team t ON c.TeamId = t.TeamId AND (t.TeamId = prm_teamId OR prm_teamId = -1)
    INNER JOIN AAU.MainProblem mp ON mp.MainProblemId = c.MainProblemId    
	LEFT JOIN
		(
		SELECT CaseId,
		SUM(CASE WHEN StatusId >= 3 THEN 1 ELSE 0 END) / COUNT(1) AS PercentComplete
		FROM AAU.Visit
        GROUP BY CaseId
		) AS pc ON pc.CaseId = c.CaseId

INNER JOIN
(
   SELECT v.CaseId, v.StatusId AS NextVisitStatusId, fv.NextVisit
   FROM
   (
        SELECT CaseId, MIN(Date) AS NextVisit
        FROM AAU.Visit
        WHERE Date >= prmVisitDate
        AND IsDeleted = FALSE
        GROUP BY CaseId
	) fv
		
	INNER JOIN AAU.Visit v ON v.CaseId = fv.CaseId
		AND fv.NextVisit = v.Date
        AND v.IsDeleted = 0
) nv ON nv.CaseId = c.CaseId
		
	WHERE nv.NextVisit = prmVisitDate -- Only get active cases 
    AND c.IsDeleted = 0
    AND nv.NextVisit <= IFNULL(c.ClosedDate, DATE_ADD(NOW(), INTERVAL 10 YEAR));

END$$
DELIMITER ;
