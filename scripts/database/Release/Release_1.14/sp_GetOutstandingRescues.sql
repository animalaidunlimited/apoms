DELIMITER $$

DROP PROCEDURE IF EXISTS AAU.sp_GetOutstandingRescues;

CREATE PROCEDURE AAU.sp_GetOutstandingRescues(IN prm_UserName VARCHAR(45))
BEGIN


/*****************************************
Author: Jim Mackenzie
Date: 16/04/2020
Purpose: To retrieve outstanding rescues
for display in the rescue board.
*****************************************/

/*****************************************
Updated By: Jim Mackenzie
Date: 29/11/2020
Purpose: To retrieve outstanding rescues and releases
for display on  board.
*****************************************/

DECLARE vOrganisationId INT;

SELECT o.OrganisationId INTO vOrganisationId
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

DROP TABLE IF EXISTS outstandingActions;


CREATE TEMPORARY TABLE outstandingActions(
ActionStatus INT,
AmbulanceAssignment JSON
);


INSERT INTO outstandingActions
SELECT 
AAU.fn_GetRescueStatus(
	p.ReleaseDetailsId, 
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
) AS `ActionStatus`,
    JSON_MERGE_PRESERVE(
    JSON_OBJECT("staff1", IF(p.releaseDetailsId IS NULL,r1.UserId,p.Releaser1Id)),
    JSON_OBJECT("staff1Abbreviation", IF(p.releaseDetailsId IS NULL,r1.Initials,p.releaser1Initials)),
    JSON_OBJECT("staff2", IF(p.releaseDetailsId IS NULL,r2.UserId,IFNULL(p.Releaser2Id, null))),
    JSON_OBJECT("staff2Abbreviation",IF(p.releaseDetailsId IS NULL,r2.Initials,IFNULL(p.releaser2Initials,''))),
    JSON_OBJECT("ambulanceAssignment",
    JSON_ARRAYAGG(
    JSON_MERGE_PRESERVE(
			JSON_OBJECT("actionStatus", AAU.fn_GetRescueStatus(
				p.ReleaseDetailsId, 
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
            JSON_OBJECT("ambulanceAction", IF(p.ReleaseDetailsId IS NULL,'Rescue','Release')),
            JSON_OBJECT("complainerNotes", p.ComplainerNotes),
            JSON_OBJECT("complianerInformed", p.ComplainerInformed),
            JSON_OBJECT("callerId", p.CallerId),
            JSON_OBJECT("releaseId", p.ReleaseDetailsId),
            JSON_OBJECT("requestedUser", p.RequestedUser),
            JSON_OBJECT("requestedDate", p.RequestedDate),
            JSON_OBJECT("releaseTypeId", p.ReleaseTypeId),
            JSON_OBJECT("pickupDate", p.PickupDate),
            JSON_OBJECT("releaseBeginDate", p.BeginDate),
            JSON_OBJECT("releaseEndDate", p.EndDate),
            JSON_OBJECT("staff1", IF(p.ReleaseDetailsId IS NULL,r1.UserId, p.Releaser1Id)),
			JSON_OBJECT("mediaCount" , IFNULL(p.MediaCount, 0)),
            JSON_OBJECT("tagNumber" , p.TagNumber),
			JSON_OBJECT("staff2", IF(p.ReleaseDetailsId IS NULL, r2.UserId, IFNULL(p.Releaser2Id, null))),
            JSON_OBJECT("ambulanceArrivalTime", ec.AmbulanceArrivalTime),
            JSON_OBJECT("rescueTime", ec.RescueTime),            
			JSON_OBJECT("emergencyCaseId", ec.EmergencyCaseId),
            JSON_OBJECT("emergencyNumber", ec.EmergencyNumber),
            JSON_OBJECT("emergencyCodeId", ec.EmergencyCodeId),
            JSON_OBJECT("callDateTime", ec.CallDateTime),
            JSON_OBJECT("callOutcomeId", ec.CallOutcomeId),
            JSON_OBJECT("location", ec.Location),
            JSON_OBJECT("latitude", ec.Latitude),
            JSON_OBJECT("longitude", ec.Longitude),
			JSON_OBJECT("latLngLiteral",
            JSON_MERGE_PRESERVE(
            JSON_OBJECT("lat",IFNULL(ec.Latitude, 0.0)),
            JSON_OBJECT("lng",IFNULL(ec.Longitude, 0.0))
            )),            
            JSON_OBJECT("callerName", c.Name),
            JSON_OBJECT("callerNumber", c.Number),
            JSON_OBJECT("animalTypes", p.AnimalTypes),
            JSON_OBJECT("patients", p.Patients),
            JSON_OBJECT("isLargeAnimal", p.IsLargeAnimal)
            )
    )))
    FROM AAU.EmergencyCase ec
INNER JOIN
(
	SELECT rd.ReleaseDetailsId, 
    rd.Releaser1Id, 
    rd.releaser1Initials,
    rd.Releaser2Id, 
    rd.releaser2Initials,
    rd.RequestedUser,
    rd.CallerId,
    rd.RequestedDate,
    rd.ReleaseTypeId,
    rd.ComplainerNotes,
    rd.ComplainerInformed,
    rd.PickupDate,
    rd.Begindate,
    rd.EndDate,
    p.EmergencyCaseId,
    p.TagNumber,
	JSON_ARRAYAGG(ant.AnimalType) AS AnimalTypes,
    pm.MediaCount,
    JSON_ARRAYAGG(p.PatientId) AS Patients,
    MAX(LargeAnimal) as IsLargeAnimal
	FROM AAU.Patient p
	INNER JOIN AAU.AnimalType ant ON ant.AnimalTypeId = p.AnimalTypeId
	LEFT JOIN (
		SELECT ReleaseDetailsId, 
        PatientId, 
        CallerId,
        RequestedUser, 
        RequestedDate, 
		ReleaseTypeId, 
        ComplainerNotes, 
        ComplainerInformed, 
        Releaser1Id,
        rl1.Initials AS releaser1Initials,
        rl2.Initials AS releaser2Initials,
		Releaser2Id, 
        PickupDate,
        BeginDate, EndDate 
        FROM AAU.ReleaseDetails rd
		LEFT JOIN AAU.User rl1 ON rl1.UserId = rd.Releaser1Id
		LEFT JOIN AAU.User rl2 ON rl2.UserId = rd.Releaser2Id
    ) AS rd ON rd.PatientId = p.PatientId
    LEFT JOIN (
		SELECT COUNT(URL) AS MediaCount,PatientId
		FROM AAU.PatientMediaItem
		GROUP BY PatientId
    ) pm ON pm.PatientId = p.PatientId
    GROUP BY p.EmergencyCaseId
) p ON p.EmergencyCaseId = ec.EmergencyCaseId
INNER JOIN AAU.Caller c ON c.CallerId = ec.CallerId
LEFT JOIN AAU.User r1 ON r1.UserId = ec.Rescuer1Id
LEFT JOIN AAU.User r2 ON r2.UserId = ec.Rescuer2Id
WHERE ec.OrganisationId = 1 AND (
	(
		ec.CallOutcomeId IS NULL 
        AND p.ReleaseDetailsId IS NULL
	)
	OR (
			ec.callOutcomeId IS NOT NULL 
			AND p.ReleaseDetailsId IS NOT NULL
			AND p.EndDate IS NULL
		)
	OR (
			ec.Rescuer1Id IS NULL
			OR ec.Rescuer2Id IS NULL
			OR (
					ec.AmbulanceArrivalTime IS NULL
					AND ec.RescueTime IS NULL
				)
			OR ec.RescueTime IS NULL
			OR ec.AdmissionTime IS NULL
			OR ec.CallOutcomeId IS NULL
		)
)
GROUP BY AAU.fn_GetRescueStatus(p.ReleaseDetailsId, 
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
),
IF(p.releaseDetailsId IS NULL,r1.UserId,p.Releaser1Id),
IF(p.releaseDetailsId IS NULL,r1.Initials,p.releaser1Initials),
IF(p.releaseDetailsId IS NULL,r2.UserId,p.Releaser2Id),
IF(p.releaseDetailsId IS NULL,r2.Initials,IFNULL(p.releaser2Initials,''));



SELECT
    JSON_OBJECT("outstandingActions",
    JSON_ARRAYAGG(
    JSON_MERGE_PRESERVE(
JSON_OBJECT("actionStatus", grouped.ActionStatus),
JSON_OBJECT("actionStatusName",
CASE grouped.ActionStatus
WHEN 1 THEN "Received"
WHEN 2 THEN "Assigned"
WHEN 3 THEN "Arrived/Picked"
WHEN 4 THEN "Rescued/Released"
WHEN 5 THEN "Admitted"
END
),
grouped.actionGroups))) AS `Result`
FROM
	(
	SELECT raw.ActionStatus,
	JSON_OBJECT("actionGroups", 
		JSON_ARRAYAGG(    
	raw.AmbulanceAssignment
	)) AS `actionGroups`
FROM outstandingActions raw
 GROUP BY raw.ActionStatus

 ) AS grouped;
 
 
END$$
DELIMITER ;
