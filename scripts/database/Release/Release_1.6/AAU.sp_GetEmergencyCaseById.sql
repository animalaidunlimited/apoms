DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetEmergencyCaseById!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetEmergencyCaseById( IN prm_EmergencyCaseId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a case by ID.
*/

SELECT 
JSON_MERGE_PRESERVE(
JSON_OBJECT("emergencyDetails",
JSON_MERGE_PRESERVE(
JSON_OBJECT("emergencyCaseId", ec.EmergencyCaseId),
JSON_OBJECT("emergencyNumber", ec.EmergencyNumber),
JSON_OBJECT("callDateTime", DATE_FORMAT(ec.CallDateTime, "%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("dispatcher", ec.DispatcherId),
JSON_OBJECT("code",
JSON_MERGE_PRESERVE(
JSON_OBJECT("EmergencyCodeId", ec.EmergencyCodeId),
JSON_OBJECT("EmergencyCode", c.EmergencyCode)
)),
JSON_OBJECT("updateTime", DATE_FORMAT(ec.UpdateTime, "%Y-%m-%dT%H:%i:%s"))
)),
JSON_OBJECT("callOutcome",
JSON_MERGE_PRESERVE(
JSON_OBJECT("CallOutcome",
JSON_MERGE_PRESERVE(
JSON_OBJECT("CallOutcomeId", ec.CallOutcomeId),
JSON_OBJECT("CallOutcome", o.CallOutcome)
)),
JSON_OBJECT("sameAsNumber", sa.EmergencyNumber)
)
)

) AS Result
			
FROM AAU.EmergencyCase ec
LEFT JOIN AAU.EmergencyCode c ON c.EmergencyCodeId = ec.EmergencyCodeId
LEFT JOIN AAU.CallOutcome o ON o.CallOutcomeId = ec.CallOutcomeId
LEFT JOIN AAU.EmergencyCase sa ON sa.EmergencyCaseId = ec.SameAsEmergencyCaseId
WHERE ec.EmergencyCaseId = prm_emergencyCaseId
GROUP BY ec.EmergencyCaseId;


END$$
DELIMITER ;
