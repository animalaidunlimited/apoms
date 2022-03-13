DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetActiveCases !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetActiveCases()
BEGIN

/*
Created By: Jim Mackenzie
Created On: 30/08/2018
Purpose: Used to return active cases for the Admin screen


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
			pc.PercentComplete,
            pc.VisitList,
			ec.Location AS Address,
			pr.Priority,
            pr.PriorityId,
            v.VehicleNumber,
            c.AssignedVehicleId AS `VehicleId`,
            ec.Latitude,
            ec.Longitude,
			ec.Name AS ComplainerName,
			ec.Number AS ComplainerNumber,
            c.AdminComments AS AdminNotes,
            c.OperatorNotes,
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
	INNER JOIN AAU.Vehicle v ON v.VehicleId = c.AssignedVehicleId
    INNER JOIN AAU.MainProblem mp ON mp.MainProblemId = c.MainProblemId
    
	LEFT JOIN
		(
		SELECT v.StreetTreatCaseId AS CaseId,
		SUM(CASE WHEN v.StatusId >= 3 THEN 1 ELSE 0 END) / COUNT(1) AS PercentComplete,
        GROUP_CONCAT(s.Status ORDER BY v.Date DESC) AS VisitList
		FROM AAU.Visit v
        INNER JOIN AAU.Status s ON s.StatusId = v.StatusId
        GROUP BY v.StreetTreatCaseId
		) AS pc ON pc.CaseId = c.StreetTreatCaseId

	LEFT JOIN
		(
		SELECT StreetTreatCaseId AS CaseId,
		MIN(Date) AS NextVisit
		FROM AAU.Visit
		WHERE Date >= CURDATE()
		AND StatusId IN (1,2)
        GROUP BY StreetTreatCaseId
		) AS nv ON nv.CaseId = c.StreetTreatCaseId
		
	WHERE c.StatusId <= 3;-- Only get active cases

END$$
DELIMITER ;
