DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCallerByEmergencyCaseId!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCallerByEmergencyCaseId( IN prm_EmergencyCaseId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a call by CallerId by ID.
*/

SELECT 


JSON_OBJECT("callerDetails",
JSON_MERGE_PRESERVE(
JSON_OBJECT("callerId", c.CallerId),
JSON_OBJECT("callerName", c.Name),
JSON_OBJECT("callerNumber", c.Number),
JSON_OBJECT("callerAlternativeNumber", c.AlternativeNumber)
)) AS Result
			
FROM AAU.EmergencyCase ec
INNER JOIN AAU.Caller c ON c.CallerId = ec.CallerId
WHERE ec.EmergencyCaseId = prm_emergencyCaseId
GROUP BY ec.EmergencyCaseId;

END$$
DELIMITER ;

-- CALL AAU.sp_GetCallerByEmergencyCaseId(34);