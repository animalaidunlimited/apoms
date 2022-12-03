DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetActiveCasesWithMissedLastVisitForUserTeam !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetActiveCasesWithMissedLastVisitForUserTeam( IN prm_username VARCHAR(64) )
BEGIN

/*
Created By: Jim Mackenzie
Created On: 30/08/2018
Purpose: Used to return active cases for the Admin screen.

Modified By: Jim Mackenzie
Modified On: 08/05/2019
Description: Adding Main Problem Id and logging.

Modified By: Jim Mackenzie
Modified On: 07/12/2020
Description: Altering to run from new Apoms tables
*/

	SELECT
			c.StreetTreatCaseId AS CaseId,
			ec.EmergencyNumber,
            p.TagNumber,
			at.AnimalType,
            at.AnimalTypeId,
            s.Status,
            s.StatusId,
			p.Description AS AnimalName,
			nv.NextVisit,
            nv.NextVisitStatusId,
			pc.PercentComplete,
			ec.Location AS Address,
			pr.Priority,
            pr.PriorityId,
            t.TeamName,
            t.TeamId,
            ec.Latitude,
            ec.Longitude,
            ca.Name AS ComplainerName,
            ca.Number AS ComplainerNumber,
            c.AdminComments AS AdminNotes,
            c.OperatorNotes,
            p.PatientStatusDate AS ReleasedDate,
            c.ClosedDate,
            c.EarlyReleaseFlag,
            c.MainProblemId,
            mp.MainProblem
	FROM AAU.StreetTreatCase c
    INNER JOIN AAU.Patient p ON p.PatientId = c.PatientId
    INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
    INNER JOIN AAU.Caller ca ON ca.CallerId = ec.CallerId
	INNER JOIN AAU.Status s ON s.StatusId = c.StatusId
	INNER JOIN AAU.Priority pr ON pr.PriorityId = c.PriorityId
	INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
	INNER JOIN AAU.Team t ON c.TeamId = t.TeamId
    INNER JOIN AAU.MainProblem mp ON mp.MainProblemId = c.MainProblemId
	INNER JOIN AAU.User u ON u.TeamId = t.TeamId AND u.UserName = prm_username
	LEFT JOIN
		(
		SELECT StreetTreatCaseId,
		SUM(CASE WHEN StatusId >= 3 THEN 1 ELSE 0 END) / COUNT(1) AS PercentComplete
		FROM AAU.Visit
        GROUP BY StreetTreatCaseId
		) AS pc ON pc.StreetTreatCaseId = c.StreetTreatCaseId

INNER JOIN
(
   SELECT v.StreetTreatCaseId, v.StatusId AS NextVisitStatusId, fv.NextVisit
   FROM
   (
        SELECT StreetTreatCaseId, MIN(Date) AS NextVisit
        FROM AAU.Visit
        WHERE IsDeleted = FALSE
        GROUP BY StreetTreatCaseId
	) fv

	INNER JOIN AAU.Visit v ON v.StreetTreatCaseId = fv.StreetTreatCaseId
		AND fv.NextVisit = v.Date
        AND v.IsDeleted = 0
) nv ON nv.StreetTreatCaseId = c.StreetTreatCaseId
INNER JOIN
(
SELECT v.StreetTreatCaseId
FROM
	(
			SELECT StreetTreatCaseId, MAX(Date) AS LastVisit
			FROM AAU.Visit
			WHERE IsDeleted = FALSE
			AND Date <= CURDATE()
			GROUP BY StreetTreatCaseId
	) lv
    INNER JOIN AAU.Visit v ON lv.StreetTreatCaseId = v.StreetTreatCaseId
    AND v.Date = lv.LastVisit
	AND v.StatusId = 3
) lvm ON lvm.StreetTreatCaseId = c.StreetTreatCaseId

	WHERE c.IsDeleted = 0
    AND c.StatusId < 3
    AND nv.NextVisit <= IFNULL(c.ClosedDate, DATE_ADD(NOW(), INTERVAL 10 YEAR));

END$$
DELIMITER ;
