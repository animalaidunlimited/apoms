DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_GetAllVisitIdsByPatientId!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetAllVisitIdsByPatientId(IN prm_PatientId INT)
BEGIN

/*
Created By: Ankit Singh
Created On: 01/12/2020
Purpose: Used to return a list of the visit IDs by patient Id.
*/

	SELECT v.VisitId
	FROM AAU.Visit v 
	INNER JOIN AAU.StreetTreatCase stc ON stc.StreetTreatCaseId = v.StreetTreatCaseId
	WHERE PatientId = prm_PatientId;
	
END$$

