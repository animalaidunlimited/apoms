DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetActiveCasesForUserByDate !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetActiveCasesForUserByDate(	IN prm_userId INT,
														IN prm_visitDate DATE
														)
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
Description: Altering to run from new Apoms tables.

Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Replacing team with assigned vehicle.
*/

DECLARE prmVisitDate DATE;

	SELECT IFNULL(prm_visitDate, CURDATE()) INTO prmVisitDate;
    -- SELECT CURDATE() INTO prmVisitDate;

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
            v.VehicleNumber,
            c.AssignedVehicleId,
            ec.Latitude,
            ec.Longitude,
            ec.Name AS ComplainerName,
            ec.Number AS ComplainerNumber,
            c.AdminComments AS AdminNotes,
            c.OperatorNotes,
            CAST(COALESCE(ec.STAssignedDate, p.PatientStatusDate) AS DATE) AS ReleasedDate,
            c.ClosedDate,
            c.EarlyReleaseFlag,
            c.MainProblemId,
            mp.MainProblem
	FROM AAU.StreetTreatCase c
    INNER JOIN AAU.Patient p ON p.PatientId = c.PatientId
    INNER JOIN (
		SELECT ec.EmergencyCaseId, 
        c.Name, 
        c.Number,
        IF(ec.CallOutcomeId = 18, ec.CallDateTime, NULL) AS `STAssignedDate`,
        ec.Latitude, 
        ec.Longitude, 
        ec.Location, 
        ec.EmergencyNumber 
        FROM AAU.EmergencyCase ec
		LEFT JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId
		LEFT JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
		WHERE ecr.PrimaryCaller = 1
    ) ec ON ec.EmergencyCaseId = p.EmergencyCaseId
	INNER JOIN AAU.Status s ON s.StatusId = c.StatusId
	INNER JOIN AAU.Priority pr ON pr.PriorityId = c.PriorityId
	INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
    INNER JOIN AAU.MainProblem mp ON mp.MainProblemId = c.MainProblemId
	INNER JOIN AAU.VehicleShift vs ON vs.VehicleId = c.AssignedVehicleId
    INNER JOIN AAU.VehicleShiftUser vsu ON vsu.VehicleShiftId = vs.VehicleShiftId AND vsu.UserId = prm_userId
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
        WHERE Date >= prmVisitDate
        AND IsDeleted = FALSE
        GROUP BY StreetTreatCaseId
	) fv

	INNER JOIN AAU.Visit v ON v.StreetTreatCaseId = fv.StreetTreatCaseId
		AND fv.NextVisit = v.Date
        AND v.IsDeleted = 0
) nv ON nv.StreetTreatCaseId = c.StreetTreatCaseId

	WHERE nv.NextVisit = prmVisitDate -- Only get active cases
    AND c.IsDeleted = 0
    AND p.TagNumber IS NOT NULL
    AND nv.NextVisit <= IFNULL(c.ClosedDate, DATE_ADD(NOW(), INTERVAL 10 YEAR));

END$$
DELIMITER ;
