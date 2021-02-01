DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_GetActiveUnassignedCasesWithVisitForTeamByDate !!
DELIMITER $$

CREATE PROCEDURE AAU.sp_GetActiveUnassignedCasesWithVisitForTeamByDate(IN prm_VisitDate DATE)
BEGIN

	SELECT
			c.StreetTreatCaseId AS CaseId,
			ec.EmergencyNumber,
            p.TagNumber,
			at.AnimalType,
            s.Status,
			p.Description AS AnimalName,
			GROUP_CONCAT(DISTINCT v.Date) AS NextVisit,
            GROUP_CONCAT(v.StatusId) AS VisitStatusId,
            GROUP_CONCAT(v.VisitTypeId) AS VisitTypeId,
			pc.PercentComplete,
            pc.VisitList,
			ec.Location AS Address,
			pr.Priority,
            ec.Latitude,
            ec.Longitude,
            GROUP_CONCAT(DISTINCT ec.Name) AS ComplainerName,
            GROUP_CONCAT(DISTINCT ec.Number) AS ComplainerNumber,
            c.MainProblemId,
            mp.MainProblem
	FROM AAU.StreetTreatCase c
    INNER JOIN AAU.Patient p ON p.PatientId = c.PatientId
    INNER JOIN (
		SELECT ec.EmergencyCaseId, 
        c.Name, 
        c.Number, 
        ec.Latitude, 
        ec.Longitude, 
        ec.Location, 
        ec.EmergencyNumber 
        FROM AAU.Emergencycase ec
		LEFT JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId
		LEFT JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
		WHERE ecr.PrimaryCaller = 1
    ) ec ON ec.EmergencyCaseId = p.EmergencyCaseId
	INNER JOIN AAU.Status s ON s.StatusId = c.StatusId
	INNER JOIN AAU.Priority pr ON pr.PriorityId = c.PriorityId
	INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
    INNER JOIN AAU.MainProblem mp ON mp.MainProblemId = c.MainProblemId
    INNER JOIN AAU.Visit v ON v.StreetTreatCaseId = c.StreetTreatCaseId
	LEFT JOIN
		(
		SELECT v.StreetTreatCaseId AS CaseId,
		SUM(CASE WHEN v.StatusId >= 3 THEN 1 ELSE 0 END) / COUNT(1) AS PercentComplete,
        GROUP_CONCAT(s.Status ORDER BY v.Date DESC) AS VisitList
		FROM AAU.Visit v
        INNER JOIN AAU.Status s ON s.StatusId = v.StatusId
        GROUP BY v.StreetTreatCaseId
		) AS pc ON pc.CaseId = c.StreetTreatCaseId
		
	WHERE v.Date = prm_VisitDate
    AND c.TeamId IS NULL
    AND v.IsDeleted = 0
    AND c.IsDeleted = 0
    AND v.Date <= IFNULL(c.ClosedDate, DATE_ADD(NOW(), INTERVAL 10 YEAR))
    GROUP BY c.StreetTreatCaseId
	ORDER BY ec.EmergencyNumber ASC, p.TagNumber ASC;
END$$
DELIMITER ;
