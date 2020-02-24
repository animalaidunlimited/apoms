DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPatientById ( IN prm_PatientId INT, OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a Patient by ID.
*/

SELECT	
		PatientId,
		EmergencyCaseId,
		Position,
		AnimalTypeId,
		TagNumber,
		CreatedDate,
		IsDeleted,
		eletedDate
FROM AAU.Patient
WHERE PatientId = prm_PatientId;

SELECT 1 INTO prm_Success;


END$$
DELIMITER ;
