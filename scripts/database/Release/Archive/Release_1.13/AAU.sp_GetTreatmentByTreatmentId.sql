DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetTreatmentByTreatmentId!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetTreatmentByTreatmentId( IN prm_TreatmentId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 25/10/2020
Purpose: Used to return a treatment by treatment Id.
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
WHERE t.TreatmentId = prm_TreatmentId
AND t.IsDeleted = 0;

END$$
DELIMITER ;