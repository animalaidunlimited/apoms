
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetOutstandingRescue2 !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetOutstandingRescue2(IN prm_UserName VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;

SELECT u.OrganisationId INTO vOrganisationId
FROM AAU.User u
WHERE UserName = prm_Username LIMIT 1;

WITH RescuesReleases AS
(
SELECT PatientId
FROM  AAU.Patient p
WHERE p.OrganisationId = vOrganisationId
AND p.PatientCallOutcomeId IS NULL
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
EmergencyCaseCTE AS
(
SELECT  
ec.EmergencyCaseId,
ec.Rescuer1Id,
ec.Rescuer2Id, 
ec.AssignedVehicleId,
ec.EmergencyNumber,
ec.AmbulanceArrivalTime,
ec.RescueTime,
ec.AdmissionTime,
ec.EmergencyCodeId,
ec.CallDateTime,
ecd.EmergencyCode,
ec.Location,
ec.Latitude,
ec.Longitude
FROM AAU.EmergencyCase ec
LEFT JOIN AAU.User r1 ON r1.UserId = ec.Rescuer1Id
LEFT JOIN AAU.User r2 ON r2.UserId = ec.Rescuer2Id
LEFT JOIN AAU.EmergencyCode ecd ON ecd.EmergencyCodeId = ec.EmergencyCodeId
WHERE ec.EmergencyCaseId IN (SELECT EmergencyCaseId FROM EmergencyCaseIds) AND ec.IsDeleted = 0 OR ec.IsDeleted IS Null 
),

PatientsCTE AS
(
    SELECT
		p.EmergencyCaseId ,
        p.PatientCallOutcomeId,
        p.PatientId,
        JSON_ARRAYAGG(
        JSON_MERGE_PRESERVE(
			JSON_OBJECT('patientId',p.PatientId),
			JSON_OBJECT('animalTypeId',p.AnimalTypeId),
            JSON_OBJECT("animalType", ant.AnimalType),
			JSON_OBJECT('tagnumber',p.TagNumber),
			JSON_OBJECT('patientStatusId',p.PatientStatusId),
			JSON_OBJECT('patientStatusDate',p.PatientStatusDate),
			JSON_OBJECT('patientCallOutcomeId',p.PatientCallOutcomeId),
            pp.PatientProblems
            )
        ) AS Patients
    FROM AAU.Patient p
    INNER JOIN AAU.AnimalType ant ON ant.AnimalTypeId = p.AnimalTypeId
    INNER JOIN (
		SELECT pp.PatientId,
			JSON_OBJECT("problems", GROUP_CONCAT(pr.Problem)) AS PatientProblems
		FROM AAU.PatientProblem pp
		INNER JOIN AAU.Problem pr ON pr.ProblemId = pp.ProblemId
		GROUP BY pp.PatientId
    ) pp ON pp.PatientId = p.PatientId
    WHERE p.EmergencyCaseId IN (SELECT EmergencyCaseId FROM EmergencyCaseCTE)
	GROUP BY p.EmergencyCaseId
)



SELECT  
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
	JSON_OBJECT('patients', p.Patients),
	JSON_OBJECT('emergencyCaseId',ec.EmergencyCaseId),
	JSON_OBJECT('assignedVehicleId',ec.AssignedVehicleId),
	JSON_OBJECT('emergencyNumber',ec.EmergencyNumber),
    JSON_OBJECT('emergencyCode',ec.EmergencyCode),
    JSON_OBJECT('emergencyCodeId',ec.EmergencyCodeId),
	JSON_OBJECT('actionStatus',
    CASE AAU.fn_GetRescueStatus(
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
            )
			WHEN 1 THEN "Received"
			WHEN 2 THEN "Assigned"
			WHEN 3 THEN "Arrived/Picked"
			WHEN 4 THEN "Rescued/Released"
			WHEN 5 THEN "Admitted"
			END
    
		),
	JSON_OBJECT('callerDetails', ca.CallerDetails),
    JSON_OBJECT("callDateTime", ec.CallDateTime),
    JSON_OBJECT("location", ec.Location),
    JSON_OBJECT("latLngLiteral",
		JSON_MERGE_PRESERVE(
			JSON_OBJECT("lat",IFNULL(ec.Latitude, 0.0)),
			JSON_OBJECT("lng",IFNULL(ec.Longitude, 0.0))
		)
	),
	JSON_OBJECT("releaseId", rd.ReleaseDetailsId),
	JSON_OBJECT("requestedDate", DATE_FORMAT(rd.RequestedDate, "%Y-%m-%dT%H:%i:%s")),
	JSON_OBJECT("pickupDate", DATE_FORMAT(rd.PickupDate, "%Y-%m-%dT%H:%i:%s")),
	JSON_OBJECT("releaseBeginDate", DATE_FORMAT(rd.BeginDate, "%Y-%m-%dT%H:%i:%s")),
	JSON_OBJECT("releaseEndDate", DATE_FORMAT(rd.EndDate, "%Y-%m-%dT%H:%i:%s")),
	JSON_OBJECT("releaseType", CONCAT(IF(rd.ReleaseDetailsId IS NULL,"","Normal"), IF(IFNULL(rd.ComplainerNotes,"") <> ""," + Complainer special instructions",""), IF(rd.Releaser1Id IS NULL,""," + Specific staff"), IF(std.StreetTreatCaseId IS NULL,""," + StreetTreat release"))),
	JSON_OBJECT("ambulanceAction", IF(rd.ReleaseDetailsId IS NULL, 'Rescue', 'Release'))
)  )
AS Cases

FROM  EmergencyCaseCTE ec 
LEFT JOIN PatientsCTE p  ON p.EmergencyCaseId = ec.EmergencyCaseId
LEFT JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId
LEFT JOIN AAU.TreatmentList tl ON tl.PatientId = p.PatientId
LEFT JOIN AAU.StreetTreatCase std ON std.PatientId = rd.PatientId
INNER JOIN (
	SELECT 
    ecr.EmergencyCaseId,
	JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
	JSON_OBJECT('callerId', c.CallerId),
	JSON_OBJECT('callerName',c.Name),
	JSON_OBJECT('callerNumber', c.Number)
	)) AS callerDetails
    FROM AAU.Caller c
    INNER JOIN AAU.EmergencyCaller ecr ON ecr.CallerId = c.CallerId
    WHERE ecr.IsDeleted = 0
    AND ecr.EmergencyCaseId IN (SELECT EmergencyCaseId FROM EmergencyCaseIds)
    GROUP BY ecr.EmergencyCaseId
) ca ON  ca.EmergencyCaseId = ec.EmergencyCaseId;


END$$
DELIMITER ;