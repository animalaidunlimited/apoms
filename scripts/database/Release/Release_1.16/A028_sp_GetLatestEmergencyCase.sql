DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetLatestEmergencyCase

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetLatestEmergencyCase()
BEGIN

SELECT DISTINCT GUID, EmergencyNumber 
FROM AAU.EmergencyCase 
WHERE EmergencyNumber = (SELECT MAX(EmergencyNumber) FROM AAU.EmergencyCase);

END$$
DELIMITER ;
