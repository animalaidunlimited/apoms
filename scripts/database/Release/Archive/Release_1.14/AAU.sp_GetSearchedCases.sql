DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_GetSearchedCases!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetSearchedCases(
											IN prm_CaseId INT,
											IN prm_EmergencyNumber INT,
											IN prm_TagNumber VARCHAR(64),
											IN prm_AnimalTypeId INT,
                                            IN prm_StatusId INT,
											IN prm_AnimalName VARCHAR(64),
											IN prm_PriorityId INT,
											IN prm_TeamId INT,											
                                            IN prm_EarlyReleaseFlag BOOLEAN)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 30/08/2018
Purpose: Used to return active cases for the Admin screen
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
            pc.VisitList,
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
	INNER JOIN AAU.Team t ON t.TeamId = c.TeamId
    INNER JOIN AAU.MainProblem mp ON mp.MainProblemId = c.MainProblemId
	LEFT JOIN
		(
		SELECT v.StreetTreatCaseId,
		SUM(CASE WHEN v.StatusId >= 3 THEN 1 ELSE 0 END) / COUNT(1) AS PercentComplete,
        GROUP_CONCAT(s.Status ORDER BY v.Date DESC) AS VisitList
		FROM AAU.Visit v
        INNER JOIN AAU.Status s ON s.StatusId = v.StatusId
        WHERE v.Date < current_date
        GROUP BY v.StreetTreatCaseId
		) AS pc ON pc.StreetTreatCaseId = c.StreetTreatCaseId

	LEFT JOIN
    (
    SELECT nvr.StreetTreatCaseId, nvr.NextVisit, v.StatusId AS NextVisitStatusId
    FROM
		(
		SELECT StreetTreatCaseId,
		MIN(Date) AS NextVisit
		FROM AAU.Visit
		WHERE Date >= CURDATE()
		AND StatusId IN (1,2)
        GROUP BY StreetTreatCaseId
		) AS nvr
	INNER JOIN AAU.Visit v ON v.Date = nvr.NextVisit
            AND v.StreetTreatCaseId = nvr.StreetTreatCaseId
	) nv ON nv.StreetTreatCaseId = c.StreetTreatCaseId
		
	WHERE
    (c.StreetTreatCaseId = prm_CaseId OR prm_CaseId IS NULL)
    AND
	(ec.EmergencyNumber = prm_EmergencyNumber OR prm_EmergencyNumber IS NULL)
	AND
	(p.TagNumber = prm_TagNumber OR prm_TagNumber IS NULL)
	AND
	(p.AnimalTypeId = prm_AnimalTypeId OR prm_AnimalTypeId IS NULL)
    AND
    (c.StatusId = prm_StatusId OR prm_StatusId IS NULL)
	AND
	(p.Description = prm_AnimalName OR prm_AnimalName IS NULL)
	AND
	(c.PriorityId = prm_PriorityId OR prm_PriorityId IS NULL)
	AND
	(c.TeamId = prm_TeamId OR prm_TeamId IS NULL)
    AND
    (c.EarlyReleaseFlag = prm_EarlyReleaseFlag OR prm_EarlyReleaseFlag IS NULL);
											

END$$
DELIMITER ;
