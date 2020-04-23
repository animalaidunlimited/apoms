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

WITH outstandingRescuesCTE AS (
SELECT 
AAU.fn_GetRescueStatus(ec.Rescuer1Id, ec.Rescuer2Id, ec.AmbulanceArrivalTime, ec.RescueTime, ec.AdmissionTime, ec.CallOutcomeId) AS `RescueStatus`,
    JSON_MERGE_PRESERVE(
    JSON_OBJECT("rescuer1", r1.RescuerId),
    JSON_OBJECT("rescuer1Abbreviation", r1.Abbreviation),
    JSON_OBJECT("rescuer2", r2.RescuerId),
    JSON_OBJECT("rescuer2Abbreviation", r2.Abbreviation),
    JSON_OBJECT("rescues",
    JSON_ARRAYAGG(
    JSON_MERGE_PRESERVE(
			JSON_OBJECT("RescueStatus", AAU.fn_GetRescueStatus(ec.Rescuer1Id, ec.Rescuer2Id, ec.AmbulanceArrivalTime, ec.RescueTime, ec.AdmissionTime, ec.CallOutcomeId)),
			JSON_OBJECT("rescuer1", r1.RescuerId),
			JSON_OBJECT("rescuer2", r2.RescuerId),
			JSON_OBJECT("emergencyCaseId", ec.EmergencyCaseId),
            JSON_OBJECT("emergencyNumber", ec.EmergencyNumber),
            JSON_OBJECT("emergencyCodeId", ec.EmergencyCodeId),
            JSON_OBJECT("callDateTime", ec.CallDateTime),
            JSON_OBJECT("callOutcomeId", ec.CallOutcomeId),
            JSON_OBJECT("location", ec.Location),
            JSON_OBJECT("latitude", ec.Latitude),
            JSON_OBJECT("longitude", ec.Longitude),
            JSON_OBJECT("callerName", c.Name),
            JSON_OBJECT("callerNumber", c.Number)
            )
    )
    )) AS `Rescues`
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
OR ec.CallOutcomeId IS NULL)
GROUP BY AAU.fn_GetRescueStatus(ec.Rescuer1Id, ec.Rescuer2Id, ec.AmbulanceArrivalTime, ec.RescueTime, ec.AdmissionTime, ec.CallOutcomeId),
r1.Rescuer,r1.ImageUrl,r2.Rescuer,r2.ImageUrl
)


SELECT
    JSON_OBJECT("outstandingRescues",
    JSON_ARRAYAGG(
    JSON_MERGE_PRESERVE(
JSON_OBJECT("rescueStatus", grouped.RescueStatus),
JSON_OBJECT("rescueStatusName",
CASE grouped.RescueStatus
WHEN 1 THEN "Received"
WHEN 2 THEN "Assigned"
WHEN 3 THEN "Arrived"
WHEN 4 THEN "Rescued"
WHEN 5 THEN "Admitted"
END
),
grouped.rescuerGroups))) AS `Result`
FROM
	(
	SELECT raw.RescueStatus,
	JSON_OBJECT("rescuerGroups", 
		JSON_ARRAYAGG(    
	raw.Rescues
	)) AS `rescuerGroups`
FROM outstandingRescuesCTE raw
 GROUP BY raw.RescueStatus

 ) AS grouped;

END$$
DELIMITER ;

-- CALL AAU.sp_GetOutstandingRescues(1);