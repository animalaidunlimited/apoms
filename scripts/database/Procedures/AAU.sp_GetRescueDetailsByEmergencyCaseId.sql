DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetRescueDetailsByEmergencyCaseId!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetRescueDetailsByEmergencyCaseId( IN prm_EmergencyCaseId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a case by ID.
*/

SELECT 

JSON_OBJECT("rescueDetails",
JSON_MERGE_PRESERVE(
JSON_OBJECT("rescuer1", ec.Rescuer1Id),
JSON_OBJECT("rescuer2", ec.Rescuer2Id),
JSON_OBJECT("ambulanceArrivalTime", DATE_FORMAT(ec.AmbulanceArrivalTime, "%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("admissionTime", DATE_FORMAT(ec.AdmissionTime, "%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("rescueTime", DATE_FORMAT(ec.RescueTime, "%Y-%m-%dT%H:%i:%s"))

)) AS Result
			
FROM AAU.EmergencyCase ec
WHERE ec.EmergencyCaseId = prm_emergencyCaseId
GROUP BY ec.EmergencyCaseId;


END$$
DELIMITER ;

-- CALL AAU.sp_GetRescueDetailsByEmergencyCaseId(34);