DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetLastTreatmentByTreatmentDate!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetLastTreatmentByTreatmentDate( IN prm_PatientId INT,
														 IN prm_TreatmentDateTime DATETIME)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 25/10/2020
Purpose: Used to return the last treatment on a specific date.
*/

DECLARE vTreatmentId INT;

SELECT MAX(TreatmentId) INTO vTreatmentId FROM AAU.Treatment WHERE CAST(TreatmentDateTime AS DATE) = CAST(prm_TreatmentDateTime AS DATE) AND PatientId = prm_PatientId;

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
WHERE t.TreatmentId = vTreatmentId
AND t.IsDeleted = 0;

END$$
DELIMITER ;