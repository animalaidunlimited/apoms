DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientIdListByEmergencycaseId !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPatientIdListByEmergencycaseId(IN prm_EmergencyCaseId INT)
BEGIN

SELECT PatientId FROM AAU.Patient
WHERE EmergencyCaseId = prm_EmergencyCaseId AND IsDeleted = 0;


END$$
DELIMITER ;
