DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetEmergencyCaseByDate !!

DELIMITER $$


CREATE PROCEDURE AAU.sp_GetEmergencyCaseByDate (IN prm_UserName VARCHAR(45),
												IN prm_Date DATETIME,
												IN prm_Outcome INT)
BEGIN

/*
CreatedDate: 20/01/2021
CreatedBy: Arpit Trivedi
Purpose: To get the emergencycase count on date
*/

DECLARE vOrganisationId INT;

SELECT o.OrganisationId INTO vOrganisationId
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT
ec.EmergencyNumber as "emergencyNumber",
DATE_Format(ec.CallDateTime,"%Y-%m-%dT%H:%i:%s") as "callDateTime",
at.AnimalType as "animalType",
p.TagNumber as "tagNumber",
ec.Location as "location",
u.FirstName as "dispatcher",
v.`staff1`,
v.`staff2`,
co.CallOutcome as "callOutcome"
FROM AAU.EmergencyCase ec
INNER JOIN AAU.Patient p ON p.EmergencyCaseId = ec.EmergencyCaseId
INNER JOIN AAU.User u ON u.UserId = ec.DispatcherId
INNER JOIN AAU.PatientProblem pp ON pp.PatientId = p.PatientId
INNER JOIN AAU.AnimalType at ON at.AnimalTypeId = p.AnimalTypeId
LEFT JOIN AAU.CallOutcome co ON co.CallOutcomeId = p.PatientCallOutcomeId
LEFT JOIN
(
SELECT vs.VehicleId, MIN(u.FirstName) as `staff1`, MAX(u.FirstName) as `staff2`
FROM AAU.VehicleShift vs
INNER JOIN AAU.VehicleShiftUser vsu ON vsu.VehicleShiftId = vs.VehicleShiftId
INNER JOIN AAU.User u ON u.UserId = vsu.UserId
WHERE NOW() BETWEEN vs.StartDate AND vs.EndDate
GROUP BY vs.VehicleId
) v ON v.VehicleId = ec.AssignedVehicleId
WHERE CAST(ec.CallDateTime AS DATE) = prm_Date
AND ec.OrganisationId = vOrganisationId
AND (p.PatientCallOutcomeId = prm_Outcome OR prm_Outcome IS NULL);

END $$
