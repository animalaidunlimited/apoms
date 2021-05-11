DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetOutstandingRescues !!

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
DECLARE ReleaseType VARCHAR(60);

SELECT u.OrganisationId INTO vOrganisationId
FROM AAU.User u
WHERE UserName = prm_Username LIMIT 1;

WITH RescuesReleases AS
(
SELECT PatientId
FROM  AAU.Patient p
WHERE p.OrganisationId = 1
AND p.PatientCallOutcomeId IS NULL
AND p.IsDeleted = 0

UNION

SELECT PatientId
FROM AAU.ReleaseDetails rd
WHERE rd.OrganisationId = 1
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
	INNER JOIN AAU.EmergencyCaller ecr ON ecr.CallerId = c.CallerId
    WHERE ecr.IsDeleted = 0
    AND ecr.EmergencyCaseId IN (SELECT EmergencyCaseId FROM EmergencyCaseIds)
	GROUP BY ecr.EmergencyCaseId
),
UserCTE AS
(
	SELECT UserId, Initials
	FROM AAU.User
),
PatientsCTE AS
(
    SELECT
		p.EmergencyCaseId,
        MAX(p.PatientCallOutcomeId) AS `PatientCallOutcomeId`,
        IFNULL(rd.PatientId, p.EmergencyCaseId) AS `PatientId`, -- Tricking the query to group rescues together, but keep releases apart.
		JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
            JSON_OBJECT("animalType", ant.AnimalType),
            JSON_OBJECT("patientId", p.PatientId),
            JSON_OBJECT("tagNumber", p.TagNumber),
            JSON_OBJECT("largeAnimal", ant.LargeAnimal),
            JSON_OBJECT("PatientCallOutcomeId", p.PatientCallOutcomeId),
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
        AND pmi.IsDeleted = 0
		GROUP BY pmi.PatientId
    ) pmi ON pmi.PatientId = p.PatientId
    WHERE p.PatientId IN (SELECT PatientId FROM RescuesReleases)
    GROUP BY p.EmergencyCaseId,
    IFNULL(rd.PatientId, p.EmergencyCaseId)
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
                p.PatientCallOutcomeId,
                tl.InTreatmentAreaId
            ) AS ActionStatus,
            IF(rd.ReleaseDetailsId IS NULL,'Rescue','Release') AS AmbulanceAction,
            rd.ReleaseDetailsId,
            rd.RequestedDate,
            rd.ComplainerNotes,
            rd.Releaser1Id,
            std.StreetTreatCaseId,
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
            ecd.EmergencyCode,
            ec.CallDateTime,
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
LEFT JOIN AAU.TreatmentList tl ON tl.PatientId = p.PatientId AND Admission = 1
LEFT JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId
LEFT JOIN AAU.StreetTreatCase std ON std.PatientId = rd.PatientId
LEFT JOIN AAU.EmergencyCode ecd ON ecd.EmergencyCodeId = ec.EmergencyCodeId
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
	JSON_OBJECT("releaseType", CONCAT(IF(r.ReleaseDetailsId IS NULL,"","Normal"), IF(IFNULL(r.ComplainerNotes,"") <> ""," + Complainer special instructions",""), IF(r.Releaser1Id IS NULL,""," + Specific staff"), IF(r.StreetTreatCaseId IS NULL,""," + StreetTreat release"))),
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
    JSON_OBJECT("emergencyCode", r.EmergencyCode),
	JSON_OBJECT("callDateTime", IFNULL(r.CallDateTime,'')),
	JSON_OBJECT("location", IFNULL(r.Location,'')),
	JSON_OBJECT("latLngLiteral", r.latLngLiteral),
	r.callerDetails,
    JSON_OBJECT("filteredCandidate", TRUE),
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
LEFT JOIN UserCTE s1 ON s1.UserId = ag.Staff1Id
LEFT JOIN UserCTE s2 ON s2.UserId = ag.Staff2Id
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
