DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetOutstandingRescues!!

DELIMITER $$
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

SELECT u.OrganisationId INTO vOrganisationId
FROM AAU.User u
WHERE UserName = prm_Username LIMIT 1;

SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

WITH RescuesReleases AS
(
SELECT PatientId
FROM AAU.EmergencyCase ec
INNER JOIN AAU.Patient p ON p.EmergencyCaseId = ec.EmergencyCaseId
WHERE ec.OrganisationId = vOrganisationId
AND ec.CallOutcomeId IS NULL
AND p.IsDeleted = 0

UNION

SELECT PatientId
FROM AAU.ReleaseDetails rd
WHERE rd.OrganisationId = vOrganisationId
AND rd.EndDate IS NULL

),
EmergencyCaseIds AS
(
SELECT EmergencyCaseId
FROM AAU.Patient
WHERE PatientId IN (SELECT PatientId FROM RescuesReleases)
),
CallerCTE AS 
(
SELECT ecr.EmergencyCaseId,
	JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
	JSON_OBJECT('callerId', c.CallerId),
	JSON_OBJECT('callerName', c.Name),
	JSON_OBJECT('callerNumber', c.Number)
	)) AS callerDetails
	FROM AAU.Caller c
	INNER JOIN AAU.Emergencycaller ecr ON ecr.CallerId = c.CallerId
    WHERE ecr.IsDeleted = 0
    AND ecr.EmergencyCaseId IN (SELECT EmergencyCaseId FROM EmergencyCaseIds)
	GROUP BY ecr.EmergencyCaseId
),
PatientsCTE AS
(
    SELECT
		p.EmergencyCaseId,
        MAX(p.PatientId) AS PatientId,
		JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
            JSON_OBJECT("animalType", ant.AnimalType),
            JSON_OBJECT("patientId", p.PatientId),
            JSON_OBJECT("tagNumber", p.TagNumber),
            JSON_OBJECT("largeAnimal", ant.LargeAnimal),
            JSON_OBJECT("mediaCount", IFNULL(pmi.mediaCount,0)),
            pp.PatientProblems
		)) AS Patients     
    FROM AAU.Patient p    
    INNER JOIN AAU.AnimalType ant ON ant.AnimalTypeId = p.AnimalTypeId
    INNER JOIN (
		SELECT pp.PatientId,
			JSON_OBJECT("problems", GROUP_CONCAT(pr.Problem)) AS PatientProblems
		FROM AAU.PatientProblem pp
		INNER JOIN AAU.Problem pr ON pr.ProblemId = pp.ProblemId
        WHERE pp.PatientId IN (SELECT PatientId FROM RescuesReleases)
		GROUP BY pp.PatientId
    ) pp ON pp.PatientId = p.PatientId
    LEFT JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId
	LEFT JOIN
    (
		SELECT	pmi.PatientId,
				COUNT(pmi.PatientId) as mediaCount
		FROM AAU.PatientMediaItem pmi
        WHERE pmi.PatientId IN (SELECT PatientId FROM RescuesReleases)
		GROUP BY pmi.PatientId
    ) pmi ON pmi.PatientId = p.PatientId
    WHERE p.PatientId IN (SELECT PatientId FROM RescuesReleases)
    GROUP BY p.EmergencyCaseId,
    rd.ReleaseDetailsId
),
ReleaseRescueCTE AS
(
SELECT AAU.fn_GetRescueStatus(
				rd.ReleaseDetailsId, 
				rd.RequestedUser, 
				rd.RequestedDate, 
				rd.Releaser1Id, 
				rd.Releaser2Id, 
                rd.PickupDate,
				rd.BeginDate, 
				rd.EndDate, 
				ec.Rescuer1Id, 
				ec.Rescuer2Id, 
				ec.AmbulanceArrivalTime, 
				ec.RescueTime, 
				ec.AdmissionTime, 
				ec.CallOutcomeId
            ) AS ActionStatus,
            IF(rd.ReleaseDetailsId IS NULL,'Rescue','Release') AS AmbulanceAction,
            rd.ReleaseDetailsId,
            rd.RequestedDate,
            rd.ReleaseTypeId,
            rd.PickupDate,
            rd.BeginDate,
            rd.EndDate,
            IF(rd.ReleaseDetailsId IS NULL,ec.Rescuer1Id, rd.Releaser1Id) AS Staff1Id,
			IF(rd.ReleaseDetailsId IS NULL, ec.Rescuer2Id, rd.Releaser2Id) AS Staff2Id,
            ec.AmbulanceArrivalTime,
            ec.RescueTime,            
			ec.EmergencyCaseId,
            ec.EmergencyNumber,
            ec.EmergencyCodeId,
            ec.CallDateTime,
            ec.CallOutcomeId,
            ec.Location,			
            JSON_MERGE_PRESERVE(
            JSON_OBJECT("lat",IFNULL(ec.Latitude, 0.0)),
            JSON_OBJECT("lng",IFNULL(ec.Longitude, 0.0))
            ) AS latLngLiteral,            
            JSON_OBJECT("callerDetails",c.callerDetails) AS callerDetails,
            JSON_OBJECT("patients",p.Patients) AS Patients
FROM PatientsCTE p
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
INNER JOIN CallerCTE c ON c.EmergencyCaseId = ec.EmergencyCaseId
LEFT JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId
),
actionsCTE AS 
(
SELECT	
	r.ActionStatus,
    r.Staff1Id,    
    r.Staff2Id,
    JSON_OBJECT("ambulanceAction", r.AmbulanceAction) AS AmbulanceAction,
    JSON_OBJECT("ambulanceAssignment",
    JSON_ARRAYAGG(
    JSON_MERGE_PRESERVE(
    JSON_OBJECT("actionStatus", IFNULL(r.ActionStatus,'')),
    JSON_OBJECT("ambulanceAction", IFNULL(r.AmbulanceAction,'')),    
	JSON_OBJECT("releaseId", r.ReleaseDetailsId),
    JSON_OBJECT("requestedDate", DATE_FORMAT(r.RequestedDate, "%Y-%m-%dT%H:%i:%s")),
	JSON_OBJECT("releaseTypeId", r.ReleaseTypeId),
	JSON_OBJECT("pickupDate", DATE_FORMAT(r.PickupDate, "%Y-%m-%dT%H:%i:%s")),
	JSON_OBJECT("releaseBeginDate", DATE_FORMAT(r.BeginDate, "%Y-%m-%dT%H:%i:%s")),
	JSON_OBJECT("releaseEndDate", DATE_FORMAT(r.EndDate, "%Y-%m-%dT%H:%i:%s")),
	JSON_OBJECT("staff1", r.Staff1Id),
	JSON_OBJECT("staff2", r.Staff2Id),
	JSON_OBJECT("ambulanceArrivalTime", IFNULL(r.AmbulanceArrivalTime,'')),
	JSON_OBJECT("rescueTime", IFNULL(r.RescueTime,'')),            
	JSON_OBJECT("emergencyCaseId", r.EmergencyCaseId),
	JSON_OBJECT("emergencyNumber", r.EmergencyNumber),
	JSON_OBJECT("emergencyCodeId", r.EmergencyCodeId),
	JSON_OBJECT("callDateTime", IFNULL(r.CallDateTime,'')),
	JSON_OBJECT("callOutcomeId", IFNULL(r.CallOutcomeId,'')),
	JSON_OBJECT("location", IFNULL(r.Location,'')),
	JSON_OBJECT("latLngLiteral", r.latLngLiteral),
	r.callerDetails,
	IFNULL(r.Patients,'')
    ))) AS ambulanceAssignment
FROM ReleaseRescueCTE r
GROUP BY	r.Staff1Id,
			r.Staff2Id,
			r.ActionStatus,
			r.AmbulanceAction
),
ActionGroupsCTE AS
(
SELECT
ag.ActionStatus,
JSON_OBJECT("staff1", ag.Staff1Id) AS Staff1Id,
JSON_OBJECT("staff1Abbreviation", s1.Initials) AS Staff1Initials,
JSON_OBJECT("staff2", ag.Staff2Id) AS Staff2Id,
JSON_OBJECT("staff2Abbreviation", s2.Initials) AS Staff2Initials,
JSON_OBJECT("actions", 
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
ag.AmbulanceAction,
ag.ambulanceAssignment))) AS ActionGroups
FROM actionsCTE ag
LEFT JOIN AAU.User s1 ON s1.UserId = ag.Staff1Id
LEFT JOIN AAU.User s2 ON s2.UserId = ag.Staff2Id
GROUP BY
ag.ActionStatus,
ag.Staff1Id,
s1.Initials,
ag.Staff2Id,
s2.Initials
),
StatusGroupCTE AS
(
SELECT
JSON_MERGE_PRESERVE(
JSON_OBJECT("actionStatus", ag.ActionStatus),
JSON_OBJECT("actionStatusName",
CASE ag.ActionStatus
WHEN 1 THEN "Received"
WHEN 2 THEN "Assigned"
WHEN 3 THEN "Arrived/Picked"
WHEN 4 THEN "Rescued/Released"
WHEN 5 THEN "Admitted"
END
),
JSON_OBJECT("statusGroups",
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
ag.Staff1Id,
ag.Staff1Initials,
ag.Staff2Id,
ag.Staff2Initials,
ag.ActionGroups)))) AS ActionStatusGroups
FROM ActionGroupsCTE ag
GROUP BY ag.ActionStatus
)

SELECT 

JSON_OBJECT("outstandingActions", 
JSON_ARRAYAGG(
stat.ActionStatusGroups)
) AS Result

FROM StatusGroupCTE stat;
 
END$$
DELIMITER ;
