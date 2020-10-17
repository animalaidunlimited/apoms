DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientOutcomeDetailsByPatientId!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetPatientOutcomeDetailsByPatientId(IN prm_PatientId INT )
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/03/2020
Purpose: Used to return a outcome details by Patient by ID.
*/

SELECT	    

JSON_MERGE_PRESERVE(
	JSON_OBJECT("patientOutcomeDetailsId", po.PatientOutcomeDetailsId),
	JSON_OBJECT("patientId", po.PatientId),
    
    JSON_OBJECT("vaccinationDetails", 
    JSON_MERGE_PRESERVE(
	JSON_OBJECT("megavac1Date", po.Megavac1Date),
	JSON_OBJECT("megavac2Date", po.Megavac2Date),
	JSON_OBJECT("rabiesVaccinationDate", po.RabiesVaccinationDate)
    )),
    JSON_OBJECT("antibioticDetails", 
    JSON_MERGE_PRESERVE(
	JSON_OBJECT("antibiotics1Id", po.Antibiotics1Id),
	JSON_OBJECT("antibiotics1Id", po.Antibiotics1Id),
	JSON_OBJECT("antibiotics1Id", po.Antibiotics1Id)
    )),
    JSON_OBJECT("isoReason",     
	JSON_OBJECT("isoReasonId", po.IsoReasonId)
    )
    
) AS Result   
    
FROM AAU.PatientOutcomeDetails po
WHERE po.PatientId = prm_PatientId;

END$$
DELIMITER ;