DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetOutstandingRescueByEmergencyCaseId!!

DELIMITER $$
CREATE PROCEDURE `sp_GetOutstandingRescueByEmergencyCaseId`(IN prm_EmergencyCaseId INT)
BEGIN

/*****************************************
Author: Jim Mackenzie
Date: 16/04/2020
Purpose: To retrieve outstanding rescues
for display in the rescue board.
*****************************************/

SELECT 
JSON_MERGE_PRESERVE(
			JSON_OBJECT("rescueStatus", AAU.fn_GetRescueStatus(ec.Rescuer1Id, ec.Rescuer2Id, ec.AmbulanceArrivalTime, ec.RescueTime, ec.AdmissionTime, ec.CallOutcomeId)),
			JSON_OBJECT("rescuer1Id", r1.RescuerId),
			JSON_OBJECT("rescuer1Abbreviation", r1.Abbreviation),
            JSON_OBJECT("rescuer1Colour", r1.Abbreviation),
			JSON_OBJECT("rescuer2Id", r2.RescuerId),
			JSON_OBJECT("rescuer2Abbreviation", r2.Abbreviation),
            JSON_OBJECT("rescuer2Colour", r1.Abbreviation),
			JSON_OBJECT("emergencyCaseId", ec.EmergencyCaseId),
            JSON_OBJECT("emergencyNumber", ec.EmergencyNumber),
            JSON_OBJECT("emergencyCodeId", ec.EmergencyCodeId),
            JSON_OBJECT("callDateTime", ec.CallDateTime),
            JSON_OBJECT("callOutcomeId", ec.CallOutcomeId),
			JSON_OBJECT("callerName", c.Name),
            JSON_OBJECT("callerNumber", c.Number),
            JSON_OBJECT("location", ec.Location),
            JSON_OBJECT("latitude", ec.Latitude),
            JSON_OBJECT("longitude", ec.Longitude)

            ) AS `Rescues`
FROM AAU.EmergencyCase ec
INNER JOIN AAU.Caller c ON c.CallerId = ec.CallerId
LEFT JOIN AAU.Rescuer r1 ON r1.RescuerId = ec.Rescuer1Id
LEFT JOIN AAU.Rescuer r2 ON r2.RescuerId = ec.Rescuer2Id
WHERE ec.EmergencyCaseId = prm_EmergencyCaseId
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

-- CALL AAU.sp_GetOutstandingRescueByEmergencyCaseId(47);