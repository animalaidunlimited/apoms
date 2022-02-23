DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPrintPatientByPatientId !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPrintPatientByPatientId( IN prm_PatientId INT)
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
    JSON_OBJECT("callerName", ec.Name),
    JSON_OBJECT("callerNumber", ec.Number),
    JSON_OBJECT("callerAlternativeNumber", ec.AlternativeNumber),
    JSON_OBJECT("emergencyNumber", ec.EmergencyNumber),
	JSON_OBJECT("rescuer", v.VehicleNumber),
	JSON_OBJECT("tagNumber", p.TagNumber)
    
) AS Result   
    
FROM AAU.Patient p
INNER JOIN (
		SELECT ec.EmergencyNumber, 
		ec.AdmissionTime,
		ec.EmergencyCaseId, 
		ec.CallDatetime, 
		c.Name, 
		c.Number,
        c.AlternativeNumber,
		ec.Location,
        ec.AssignedVehicleId
        FROM AAU.EmergencyCase ec
		LEFT JOIN AAU.EmergencyCaller ecr ON ecr.EmergencyCaseId = ec.EmergencyCaseId
		LEFT JOIN AAU.Caller c ON c.CallerId = ecr.CallerId
		WHERE ecr.PrimaryCaller = 1
    ) ec ON ec.EmergencyCaseId = p.EmergencyCaseId
INNER JOIN AAU.PatientStatus ps ON ps.PatientStatusId = p.PatientStatusId
INNER JOIN AAU.AnimalType aty ON aty.AnimalTypeId = p.AnimalTypeId
LEFT JOIN AAU.Vehicle v ON v.VehicleId = ec.AssignedVehicleId
WHERE p.PatientId = prm_PatientId;

END$$
DELIMITER ;
