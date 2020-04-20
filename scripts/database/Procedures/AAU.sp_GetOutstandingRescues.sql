DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetOutstandingRescues!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetOutstandingRescues(IN prm_OrganisationId INT)
BEGIN

/*****************************************
Author: Jim Mackenzie
Date: 16/04/2020
Purpose: To retrieve outstanding rescues
for display in the rescue board.
*****************************************/

SELECT
	ec.EmergencyCaseId,
	ec.EmergencyNumber,
	ec.EmergencyCodeId,
	ec.CallDateTime,
	ec.CallOutcomeId,
	ec.Location,
	ec.Latitude,
	ec.Longitude,
	r1.Rescuer `Rescuer1`,
	r1.ImageUrl `Rescuer1ImageURL`,
	r2.Rescuer `Rescuer2`,
	r2.ImageUrl `Rescuer2ImageURL`,
	c.Name `CallerName`,
	c.Number `CallerNumber`,
    AAU.fn_GetRescueStatus(ec.Rescuer1Id, ec.Rescuer2Id, ec.AmbulanceArrivalTime, ec.RescueTime, ec.AdmissionTime, ec.CallOutcomeId) `RescueStatus`
FROM AAU.EmergencyCase ec
INNER JOIN AAU.Caller c ON c.CallerId = ec.CallerId
LEFT JOIN AAU.Rescuer r1 ON r1.RescuerId = ec.Rescuer1Id
LEFT JOIN AAU.Rescuer r2 ON r2.RescuerId = ec.Rescuer2Id
WHERE ec.OrganisationId = prm_OrganisationId
AND ec.callOutcomeId IS NULL
and (
ec.Rescuer1Id IS NULL
OR ec.Rescuer2Id IS NULL
OR (ec.AmbulanceArrivalTime IS NULL
AND ec.RescueTime IS NULL)
OR ec.RescueTime IS NULL
OR ec.AdmissionTime IS NULL
OR ec.CallOutcomeId IS NULL);

END$$
DELIMITER ;

-- CALL AAU.sp_GetOutstandingRescues(1);