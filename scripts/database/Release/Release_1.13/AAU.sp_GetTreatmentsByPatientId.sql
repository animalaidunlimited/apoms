DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetTreatmentsByPatientId!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetTreatmentsByPatientId( IN prm_PatientId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 25/10/2020
Purpose: Used to return a treatment by patient Id.
*/

SELECT	    

JSON_MERGE_PRESERVE(
	JSON_OBJECT("treatmentId", t.TreatmentId),
	JSON_OBJECT("patientId", t.PatientId),
    JSON_OBJECT("treatmentDateTime", DATE_FORMAT(t.TreatmentDateTime, "%Y-%m-%dT%H:%i:%s")),
    JSON_OBJECT("nextTreatmentDateTime", DATE_FORMAT(t.NextTreatmentDateTime, "%Y-%m-%dT%H:%i:%s")),    
    JSON_OBJECT("eyeDischarge", t.EyeDischargeId),
    JSON_OBJECT("nasalDischarge", t.NasalDischargeId),    
    JSON_OBJECT("comment", t.comment)    
) AS Result   
    
FROM AAU.Treatment t
WHERE t.Patient = prm_PatientId;

END$$
DELIMITER ;