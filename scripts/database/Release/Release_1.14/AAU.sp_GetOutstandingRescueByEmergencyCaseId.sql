DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetOutstandingRescueByEmergencyCaseId!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetOutstandingRescueByEmergencyCaseId( IN prm_EmergencyCaseId INT)
BEGIN


/**************************************************************************
Author: Jim Mackenzie
Date: 16/04/2020
Purpose: To retrieve outstanding rescues for display in the rescue board.

Updated By: Arpit Trivedi
Date: 29/11/2020
Purpose: To retrieve outstanding rescues and releases for display on board.
***************************************************************************/

SELECT 
JSON_MERGE_PRESERVE(
			JSON_OBJECT("actionStatus", AAU.fn_GetRescueStatus(p.ReleaseDetailsId, 
																p.RequestedUser, 
																p.RequestedDate, 
																p.Releaser1Id, 
																p.Releaser2Id, 
																p.PickupDate, 
																p.BeginDate, 
																p.EndDate,
																ec.Rescuer1Id,
																ec.Rescuer2Id, 
																ec.AmbulanceArrivalTime, 
																ec.RescueTime, 
																ec.AdmissionTime, 
																ec.CallOutcomeId
																)),
			JSON_OBJECT("staff1", IF(p.ReleaseDetailsId IS NULL,r1.UserId,p.Releaser1Id)),
			JSON_OBJECT("staff1Abbreviation", IF(p.ReleaseDetailsId IS NULL,r1.Initials,p.Releaser1Initials)),
            JSON_OBJECT("staff1Colour", IF(p.ReleaseDetailsId IS NULL, r1.Colour,p.Releaser1Colour)),
			JSON_OBJECT("staff2",IF(p.ReleaseDetailsId IS NULL,r2.UserId,p.Releaser2Id)),
			JSON_OBJECT("staff2Abbreviation", IF(p.ReleaseDetailsId IS NULL,r2.Initials,IFNULL(p.Releaser2Initials,''))),
            JSON_OBJECT("staff2Colour", IF(p.ReleaseDetailsId IS NULL, r2.Colour,IF(p.Releaser2Id IS NULL, null, p.Releaser2Colour))),
            JSON_OBJECT("ambulanceArrivalTime", ec.AmbulanceArrivalTime),
            JSON_OBJECT("rescueTime", ec.RescueTime),
            JSON_OBJECT("releaseId", p.ReleaseDetailsId),
            JSON_OBJECT("pickupDate", p.PickupDate),
            JSON_OBJECT("releaseBeginDate", p.BeginDate),
            JSON_OBJECT("releaseEndDate", p.EndDate),
            JSON_OBJECT("releaseTypeId", p.ReleaseTypeId),
            JSON_OBJECT("ambulanceAction", IF(p.ReleaseDetailsId IS NULL, 'Rescue', 'Release')),
			JSON_OBJECT("emergencyCaseId", ec.EmergencyCaseId),
            JSON_OBJECT("emergencyNumber", ec.EmergencyNumber),
            JSON_OBJECT("emergencyCodeId", ec.EmergencyCodeId),
            JSON_OBJECT("callDateTime", ec.CallDateTime),
            JSON_OBJECT("callOutcomeId", ec.CallOutcomeId),
			JSON_OBJECT("callerName", c.Name),
            JSON_OBJECT("callerNumber", c.Number),
            JSON_OBJECT("location", ec.Location),
            JSON_OBJECT("latitude", ec.Latitude),
            JSON_OBJECT("longitude", ec.Longitude),
			JSON_OBJECT("latLngLiteral",
				JSON_MERGE_PRESERVE(
				JSON_OBJECT("lat",IFNULL(ec.Latitude, 0.0)),
				JSON_OBJECT("lng",IFNULL(ec.Longitude, 0.0))
				)),            
            JSON_OBJECT("animalTypes", p.AnimalTypes),
            JSON_OBJECT("patients", p.Patients),
            JSON_OBJECT("isLargeAnimal", p.IsLargeAnimal)

            ) AS `ambulanceAssignment`
FROM AAU.EmergencyCase ec
INNER JOIN
(
	SELECT p.EmergencyCaseId,
	rd.ReleaseDetailsId,
    rl1.Initials AS Releaser1Initials,
    rl2.Initials AS Releaser2Initials,
    rl1.Colour AS Releaser1Colour,
    rl2.Colour AS Releaser2Colour,
    rd.RequestedUser,
    rd.RequestedDate,
    rd.ReleaseTypeId,
    rd.Releaser1Id,
    rd.Releaser2Id,
    rd.PickupDate,
    rd.BeginDate,
    rd.EndDate,
	JSON_ARRAYAGG(ant.AnimalType) AS AnimalTypes,
    JSON_ARRAYAGG(p.PatientId) AS Patients,
	MAX(LargeAnimal) as IsLargeAnimal
FROM AAU.Patient p
INNER JOIN AAU.AnimalType ant ON ant.AnimalTypeId = p.AnimalTypeId
LEFT JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId
LEFT JOIN AAU.User rl1 ON rl1.UserId = rd.Releaser1Id
LEFT JOIN AAU.User rl2 ON rl2.UserId = rd.Releaser2Id
GROUP BY p.EmergencyCaseId,
rd.ReleaseDetailsId,
    rl1.Initials,
    rl2.Initials,
    rl1.Colour,
    rl2.Colour,
    rd.RequestedUser,
    rd.RequestedDate,
    rd.ReleaseTypeId,
    rd.Releaser1Id,
    rd.Releaser2Id,
    rd.PickupDate,
    rd.BeginDate,
    rd.EndDate
) p ON p.EmergencyCaseId = ec.EmergencyCaseId 
INNER JOIN AAU.Caller c ON c.CallerId = ec.CallerId
LEFT JOIN AAU.User r1 ON r1.UserId = ec.Rescuer1Id
LEFT JOIN AAU.User r2 ON r2.UserId = ec.Rescuer2Id
WHERE ec.EmergencyCaseId = prm_EmergencyCaseId;

END$$
DELIMITER ;
