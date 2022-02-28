DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_getCurrentPatientsByEmergencyCaseId !!
DROP PROCEDURE IF EXISTS AAU.sp_GetCurrentPatientsByEmergencyCaseId !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCurrentPatientsByEmergencyCaseId( IN prm_EmergencyCaseId INT, OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a patients by Emergency Case Id.

Modified By: Jim Mackenzie
Modified On: 28/02/2022
Modification: Replacing Position with GUID.
*/

SELECT
p.PatientId,
p.EmergencyCaseId,
p.GUID,
p.AnimalTypeId,
p.TagNumber
FROM AAU.Patient p
WHERE p.EmergencyCaseId = prm_EmergencyCaseId;

SELECT 1 INTO prm_Success;


END$$
DELIMITER ;
