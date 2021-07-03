
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetOutstandingRescueByEmergencyCaseId!!

DELIMITER $$


CREATE PROCEDURE AAU.sp_GetOutstandingRescueByEmergencyCaseId(IN prm_EmergencyCaseId INT)
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
			JSON_OBJECT("rescuer1Id", r1.UserId),
			JSON_OBJECT("rescuer1Abbreviation", r1.Initials),
            JSON_OBJECT("rescuer1Colour", r1.Colour),
			JSON_OBJECT("rescuer2Id", r2.UserId),
			JSON_OBJECT("rescuer2Abbreviation", r2.Initials),
            JSON_OBJECT("rescuer2Colour", r1.Colour),
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
            JSON_OBJECT("patients", p.Patients)

            ) AS `Rescues`
FROM AAU.EmergencyCase ec
INNER JOIN
(
SELECT p.EmergencyCaseId,
JSON_ARRAYAGG(ant.AnimalType) AS Patients
FROM AAU.Patient p
INNER JOIN AAU.AnimalType ant ON ant.AnimalTypeId = p.AnimalTypeId
GROUP BY p.EmergencyCaseId
) p ON p.EmergencyCaseId = ec.EmergencyCaseId 
INNER JOIN AAU.Caller c ON c.CallerId = ec.CallerId
LEFT JOIN AAU.User r1 ON r1.UserId = ec.Rescuer1Id
LEFT JOIN AAU.User r2 ON r2.UserId = ec.Rescuer2Id
WHERE ec.EmergencyCaseId = prm_EmergencyCaseId;

END


SELECT *
FROM AAU.User
WHERE UserName = 'Komal'

SELECT *
FROM AAU.EmergencyCode

INSERT INTO AAU.UserJobType (UserId, JobTypeId) VALUES (16, 1)
59

select *
from AAU.EmergencyCase ec

SELECT EmergencyCaseId, count(1)
FROM AAU.Patient
GROUP BY EmergencyCaseId
order by count(1) desc



DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetOutstandingRescueByEmergencyCaseId!!

DELIMITER $$


CREATE PROCEDURE AAU.sp_GetOutstandingRescueByEmergencyCaseId(IN prm_EmergencyCaseId INT)
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
			JSON_OBJECT("rescuer1Id", r1.UserId),
			JSON_OBJECT("rescuer1Abbreviation", r1.Initials),
            JSON_OBJECT("rescuer1Colour", r1.Colour),
			JSON_OBJECT("rescuer2Id", r2.UserId),
			JSON_OBJECT("rescuer2Abbreviation", r2.Initials),
            JSON_OBJECT("rescuer2Colour", r1.Colour),
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
            JSON_OBJECT("patients", p.Patients)

            ) AS `Rescues`
FROM AAU.EmergencyCase ec
INNER JOIN
(
SELECT p.EmergencyCaseId,
JSON_ARRAYAGG(ant.AnimalType) AS Patients
FROM AAU.Patient p
INNER JOIN AAU.AnimalType ant ON ant.AnimalTypeId = p.AnimalTypeId
GROUP BY p.EmergencyCaseId
) p ON p.EmergencyCaseId = ec.EmergencyCaseId 
INNER JOIN AAU.Caller c ON c.CallerId = ec.CallerId
LEFT JOIN AAU.User r1 ON r1.UserId = ec.Rescuer1Id
LEFT JOIN AAU.User r2 ON r2.UserId = ec.Rescuer2Id
WHERE ec.EmergencyCaseId = prm_EmergencyCaseId;

END


SELECT *
FROM AAU.User
WHERE UserName = 'Komal'

SELECT *
FROM AAU.EmergencyCode

INSERT INTO AAU.UserJobType (UserId, JobTypeId) VALUES (16, 1)
59

select *
from AAU.EmergencyCase ec

SELECT EmergencyCaseId, count(1)
FROM AAU.Patient
GROUP BY EmergencyCaseId
order by count(1) desc



DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetOutstandingRescueByEmergencyCaseId!!

DELIMITER $$


CREATE PROCEDURE AAU.sp_GetOutstandingRescueByEmergencyCaseId(IN prm_EmergencyCaseId INT)
BEGIN

/******