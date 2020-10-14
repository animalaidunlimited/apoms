DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientByPatientId!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetPatientByPatientId(IN prm_PatientId INT )
BEGIN


/*
Created By: Jim Mackenzie
Created On: 29/03/2020
Purpose: Used to return a Patient by ID.

Modfied By: Jim Mackenzie
Modfied On: 07/10/2020
Purpose: Adding patient detail columns
*/

SELECT	    

JSON_MERGE_PRESERVE(
	JSON_OBJECT("PatientId", p.PatientId),
	JSON_OBJECT("position", p.Position),
	JSON_OBJECT("animalTypeId", p.AnimalTypeId),
	JSON_OBJECT("tagNumber", p.TagNumber),
    JSON_OBJECT("createdDate", DATE_FORMAT(ec.CallDateTime,"%Y-%m-%dT%H:%i:%s")),
	JSON_OBJECT("patientStatusId", p.PatientStatusId),
	JSON_OBJECT("patientStatusDate", DATE_FORMAT(p.PatientStatusDate, "%Y-%m-%d")),
	JSON_OBJECT("isDeleted", p.IsDeleted),
    JSON_OBJECT("PN", p.PN),
    JSON_OBJECT("suspectedRabies", p.SuspectedRabies),
    JSON_OBJECT("currentLocation", ps.PatientStatus),    
    JSON_OBJECT("mainProblems", p.MainProblems),
    JSON_OBJECT("description", p.Description),
    JSON_OBJECT("sex", p.Sex),
    JSON_OBJECT("treatmentPriority", p.TreatmentPriority),
    JSON_OBJECT("abcStatus", p.ABCStatus),
    JSON_OBJECT("releaseStatus", p.ReleaseStatus),
    JSON_OBJECT("temperament", p.Temperament)
    
) AS Result   
    
FROM AAU.Patient p
INNER JOIN AAU.PatientStatus ps ON ps.PatientStatusId = p.PatientStatusId
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
WHERE p.PatientId = prm_PatientId;



END$$
DELIMITER ;
