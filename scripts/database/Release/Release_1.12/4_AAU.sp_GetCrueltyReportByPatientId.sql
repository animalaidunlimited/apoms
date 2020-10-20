DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCrueltyReportByPatientId!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetCrueltyReportByPatientId(IN prm_PatientId INT )
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/03/2020
Purpose: Used to return a cruelty report by Patient by ID.
*/

SELECT	    

JSON_MERGE_PRESERVE(
	JSON_OBJECT("crueltyReportId", cr.CrueltyReportId),
	JSON_OBJECT("patientId", cr.PatientId),
	JSON_OBJECT("crueltyReport", cr.CrueltyReport),
	JSON_OBJECT("crueltyDate", cr.CrueltyDate),
	JSON_OBJECT("postCrueltyReport", cr.PostCrueltyReport),
	JSON_OBJECT("crueltyCode", cr.CrueltyCode),
	JSON_OBJECT("animalCondition", cr.AnimalCondition),
	JSON_OBJECT("crueltyInspector", cr.CrueltyInspectorUserId),
	JSON_OBJECT("nameOfAccused", cr.NameOfAccused),
	JSON_OBJECT("mobileNumberOfAccused", cr.MobileNumberOfAccused),
	JSON_OBJECT("firNumber", cr.FIRNumber),
	JSON_OBJECT("act", cr.Act),
	JSON_OBJECT("policeComplaintNumber", cr.PoliceComplaintNumber),
	JSON_OBJECT("policeStation", cr.PoliceStation),
	JSON_OBJECT("policeOfficerName", cr.PoliceOfficerName),
	JSON_OBJECT("policeOfficerDesignation", cr.PoliceOfficerDesignation),
	JSON_OBJECT("policeOfficerNumber", cr.PoliceOfficerNumber),
	JSON_OBJECT("actionTaken", cr.ActionTaken),
	JSON_OBJECT("animalLocationAfterAction", AnimalLocationAfterAction)
    
) AS Result   
    
FROM AAU.CrueltyReport cr
WHERE cr.PatientId = prm_PatientId;

END$$
DELIMITER ;
