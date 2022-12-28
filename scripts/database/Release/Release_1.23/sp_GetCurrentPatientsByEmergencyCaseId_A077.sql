DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCurrentPatientsByEmergencyCaseId !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCurrentPatientsByEmergencyCaseId( IN prm_EmergencyCaseId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a patients by Emergency Case Id.

Modified By: Jim Mackenzie
Modified On: 28/02/2022
Modification: Replacing Position with GUID.

Modified By: Jim Mackenzie
Modified On: 22/12/2022
Modification: Removing out parameter
*/

SELECT
p.PatientId,
p.EmergencyCaseId,
p.GUID,
p.AnimalTypeId,
p.TagNumber
FROM AAU.Patient p
WHERE p.EmergencyCaseId = prm_EmergencyCaseId;

SELECT 1 AS `success`;


END$$
DELIMITER ;
