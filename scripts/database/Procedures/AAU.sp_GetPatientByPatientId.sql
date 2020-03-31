DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientByPatientId!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPatientByPatientId ( IN prm_PatientId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/03/2020
Purpose: Used to return a Patient by ID.
*/

SELECT	    

JSON_MERGE_PRESERVE(
	JSON_OBJECT("PatientId", PatientId),
	JSON_OBJECT("position", Position),
	JSON_OBJECT("animalTypeId", AnimalTypeId),
	JSON_OBJECT("tagNumber", TagNumber),
    JSON_OBJECT("createdDate", DATE_FORMAT(CreatedDate,"%Y-%m-%dT%H:%i:%s")),
	JSON_OBJECT("patientStatusId", PatientStatusId),
	JSON_OBJECT("patientStatusDate", DATE_FORMAT(PatientStatusDate, "%Y-%m-%d")),
	JSON_OBJECT("isDeleted", IsDeleted),
    JSON_OBJECT("PN", PN),
    JSON_OBJECT("suspectedRabies", SuspectedRabies)
) AS Result   
    
FROM AAU.Patient
WHERE PatientId = prm_PatientId;



END$$
DELIMITER ;

-- CALL AAU.sp_GetPatientByPatientId(200)