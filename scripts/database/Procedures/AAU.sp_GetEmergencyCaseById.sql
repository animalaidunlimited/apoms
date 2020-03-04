DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetEmergencyCaseById!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetEmergencyCaseById( IN prm_EmergencyCaseId INT, OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a case by ID.
*/

SELECT	c.EmergencyCaseId,
		c.EmergencyNumber,
		c.CallDateTime,
		c.DispatcherId,
		c.EmergencyCodeId,
		c.CallerId,
		c.CallOutcomeId,
		c.Location,
		c.Latitude,
		c.Longitude,
		c.Rescuer1Id,
		c.Rescuer2Id,
		c.AmbulanceArrivalTime,
		c.RescueTime,
		c.AdmissionTime
FROM AAU.EmergencyCase c
WHERE c.EmergencyCaseId = prm_EmergencyCaseId;

SELECT 1 INTO prm_Success;


END$$
DELIMITER ;
