DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPrintPatientsByEmergencyCaseId !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetPrintPatientsByEmergencyCaseId( IN prm_EmergencyCaseId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/03/2020
Purpose: Used to return a Patient by ID.
*/

SELECT	    

JSON_MERGE_PRESERVE(
	JSON_OBJECT("patientId", p.PatientId),
    JSON_OBJECT("admissionDate", DATE_FORMAT(ec.AdmissionTime, "%d/%M/%Y")),
    JSON_OBJECT("animalType", aty.AnimalType),
    JSON_OBJECT("location", ec.Location),
    JSON_OBJECT("callerName", c.Name),
    JSON_OBJECT("callerNumber", c.Number),
    JSON_OBJECT("callerAlternativeNumber", c.AlternativeNumber),
    JSON_OBJECT("emergencyNumber", ec.EmergencyNumber),
	JSON_OBJECT("rescuer", u.FirstName),
	JSON_OBJECT("tagNumber", p.TagNumber)
    
) AS Result   
    
FROM AAU.Patient p
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
INNER JOIN AAU.User u ON u.UserId = ec.Rescuer1Id
INNER JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId AND ecr.PrimaryCaller = 1
INNER JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
INNER JOIN AAU.PatientStatus ps ON ps.PatientStatusId = p.PatientStatusId
INNER JOIN AAU.AnimalType aty ON aty.AnimalTypeId = p.AnimalTypeId
WHERE p.EmergencyCaseId = prm_EmergencyCaseId;

END