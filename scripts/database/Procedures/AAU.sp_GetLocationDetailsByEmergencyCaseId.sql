DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetLocationDetailsByEmergencyCaseId!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetLocationDetailsByEmergencyCaseId( IN prm_EmergencyCaseId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a call by CallerId by ID.
*/

SELECT 


JSON_OBJECT("locationDetails",
JSON_MERGE_PRESERVE(
JSON_OBJECT("location", ec.Location),
JSON_OBJECT("latitude", ec.Latitude),
JSON_OBJECT("longitude", ec.Longitude)
)) AS Result
			
FROM AAU.EmergencyCase ec
WHERE ec.EmergencyCaseId = prm_emergencyCaseId
GROUP BY ec.EmergencyCaseId;

END$$
DELIMITER ;

-- CALL AAU.sp_GetLocationDetailsByEmergencyCaseId(34);
