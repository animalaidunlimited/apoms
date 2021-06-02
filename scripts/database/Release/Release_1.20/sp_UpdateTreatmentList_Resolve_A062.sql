DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateTreatmentList_Resolve !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateTreatmentList_Resolve ( IN prm_Username VARCHAR(45), IN prm_PatientId INT, IN prm_OutOfHospital TINYINT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-04-11
Purpose: Procedure for updating the treatment list to set the OutOfHospital flag when the patient is released from the hospital.
*/

UPDATE AAU.TreatmentList SET OutOfHospital = prm_OutOfHospital WHERE PatientId = prm_PatientId;

SELECT IF(ROW_COUNT() > 0, 1, 0) AS `success`;

CALL AAU.sp_GetTreatmentListByPatientId(prm_Username, prm_PatientId);

END $$
