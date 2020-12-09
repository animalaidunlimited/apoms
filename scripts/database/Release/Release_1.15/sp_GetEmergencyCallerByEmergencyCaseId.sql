DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetEmergencyCallerByEmergencyCaseId !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetEmergencyCallerByEmergencyCaseId (IN prm_EmergencyCaseId INT)
BEGIN

SELECT CallerId FROM AAU.EmergencyCaller 
WHERE EmergencyCaseId = prm_EmergencyCaseId
AND IsDeleted = 0;


END$$
DELIMITER ;
