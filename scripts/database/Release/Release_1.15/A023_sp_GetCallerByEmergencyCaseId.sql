DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCallerByEmergencyCaseId !!

DELIMITER $$

CREATE DEFINER=`root`@`localhost` PROCEDURE AAU.sp_GetCallerByEmergencyCaseId ( IN prm_EmergencyCaseId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a call by CallerId by ID.
*/

SELECT 
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("callerId", c.CallerId),
JSON_OBJECT("callerName", c.Name),
JSON_OBJECT("callerNumber", c.Number),
JSON_OBJECT("callerAlternativeNumber", c.AlternativeNumber),
JSON_OBJECT('primaryCaller', ecr.PrimaryCaller)
)) AS Result
			
FROM AAU.Caller c
INNER JOIN AAU.EmergencyCaller ecr ON ecr.CallerId = c.CallerId
WHERE ecr.EmergencyCaseId = prm_EmergencyCaseId AND ecr.IsDeleted = 0
GROUP BY ecr.EmergencyCaseId;

END$$
DELIMITER ;
