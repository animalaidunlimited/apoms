DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetDriverViewDetails !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetDriverViewDetails(IN prm_Date DATETIME)
BEGIN

/*
Created Date: 11/06/2021
CreatedBy: Arpit Trivedi
Purpose: To get the cases for driver view
*/

WITH RescueReleaseST AS
(SELECT p.PatientId FROM AAU.EmergencyCase ec
INNER JOIN AAU.Patient p ON p.EmergencyCaseId = ec.EmergencyCaseId
WHERE CAST('2021-06-11' AS DATE) >= CAST(ec.AmbulanceAssignmentTime AS DATE) AND (CAST('2021-06-11' AS DATE) <=  COALESCE(CAST(ec.AdmissionTime AS DATE), CAST(ec.RescueTime AS DATE), CURDATE()))
AND (p.PatientCallOutcomeId IS NULL OR p.PatientCallOutcomeId IS NOT NULL)

UNION 

SELECT rd.PatientId FROM AAU.ReleaseDetails rd
WHERE CAST('2021-06-11' AS DATE) >= CAST(rd.AmbulanceAssignmentTime AS DATE) AND CAST('2021-06-11' AS DATE) <= IFNULL(CAST(rd.EndDate AS DATE), CURDATE())

UNION

SELECT st.PatientId FROM AAU.StreetTreatCase st
INNER JOIN AAU.Visit v ON v.StreetTreatCaseId = st.StreetTreatCaseId
WHERE CAST(v.Date AS DATE) = CAST('2021-06-11' AS DATE) AND st.AmbulanceAssignmentTime IS NOT NULL
),
EmergencyCaseIds AS
(
SELECT EmergencyCaseId
FROM AAU.Patient
WHERE PatientId IN (SELECT PatientId FROM RescueReleaseST)
),
CallerCTE AS 
(
SELECT ecr.EmergencyCaseId,
	JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
	JSON_OBJECT('callerId', c.CallerId),
	JSON_OBJECT('callerName', c.Name),
	JSON_OBJECT('callerNumber', c.Number),
    JSON_OBJECT('callerAlternativeNumber', c.AlternativeNumber)
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
        p.PatientCallOutcomeId AS `PatientCallOutcomeId`,
        p.PatientId,
		JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
            JSON_OBJECT("animalType", ant.AnimalType),
            JSON_OBJECT("animalTypeId", p.AnimalTypeId),
            JSON_OBJECT("patientId", p.PatientId),
            JSON_OBJECT("position", p.Position),
            JSON_OBJECT("tagNumber", p.TagNumber),
            JSON_OBJECT("largeAnimal", ant.LargeAnimal),
            JSON_OBJECT("admissionAccepted", tl.InAccepted),
            JSON_OBJECT("admissionArea", tl.InTreatmentAreaId),
            JSON_OBJECT("callOutcome",
				JSON_MERGE_PRESERVE(
					JSON_OBJECT("CallOutcome",
						JSON_MERGE_PRESERVE(
						JSON_OBJECT("CallOutcomeId",p.PatientCallOutcomeId),
						JSON_OBJECT("CallOutcome",co.CallOutcome))
					),
					JSON_OBJECT("sameAsNumber",p.SameAsNumber)
                )
            ),
            JSON_OBJECT("mediaCount", IFNULL(pmi.mediaCount,0)),
            pp.PatientProblems,
            pp.problemsJSON
		)) AS Patients
    FROM AAU.Patient p    
    INNER JOIN AAU.AnimalType ant ON ant.AnimalTypeId = p.AnimalTypeId
    INNER JOIN (
		SELECT pp.PatientId,JSON_OBJECT("problems",
		 JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(                    
				JSON_OBJECT("problemId", pp.ProblemId),                        
				JSON_OBJECT("problem", pr.Problem) 
				)
			 )
		) AS problemsJSON,
		JSON_OBJECT("problemsString", GROUP_CONCAT(pr.Problem)) AS PatientProblems
		FROM AAU.PatientProblem pp
		INNER JOIN AAU.Problem pr ON pr.ProblemId = pp.ProblemId
        WHERE pp.PatientId IN (SELECT PatientId FROM RescueReleaseST)
		GROUP BY pp.PatientId
    ) pp ON pp.PatientId = p.PatientId
    LEFT JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId
    LEFT JOIN AAU.TreatmentList tl ON tl.PatientId = p.PatientId AND tl.Admission = 1
    LEFT JOIN AAU.CallOutcome co ON co.CallOutcomeId = p.PatientCallOutcomeId
    LEFT JOIN AAU.StreetTReatCase std ON std.PatientId = p.PatientId
	LEFT JOIN
    (
		SELECT	pmi.PatientId,
				COUNT(pmi.PatientId) as mediaCount
		FROM AAU.PatientMediaItem pmi
        WHERE pmi.PatientId IN (SELECT PatientId FROM RescueReleaseST)
        AND pmi.IsDeleted = 0
		GROUP BY pmi.PatientId
    ) pmi ON pmi.PatientId = p.PatientId
    WHERE p.PatientId IN (SELECT PatientId FROM RescueReleaseST)
    GROUP BY p.EmergencyCaseId,
    IFNULL(rd.PatientId, p.EmergencyCaseId)
)
,
DriverViewCTE AS
(
SELECT 
			IF((rd.ReleaseDetailsId IS NULL AND std.StreetTreatCaseId IS NULL),'Rescue', 
				IF((rd.ReleaseDetailsId IS NOT NULL AND std.StreetTreatCaseId IS NULL),'Release',
				IF((rd.ReleaseDetailsId IS NULL AND std.StreetTreatCaseId IS NOT NULL),'StreetTreat',
				IF((rd.ReleaseDetailsId IS NOT NULL AND std.StreetTreatCaseId IS NOT NULL),'STRelease',NULL)
				))) AS AmbulanceAction,
            rd.ReleaseDetailsId,
            rd.AssignedVehicleId AS ReleaseAssignedVehicleId,
            rd.AmbulanceAssignmentTime AS ReleaseAmbulanceAssignmentTime,
            rd.RequestedDate,
            rd.ComplainerNotes,
			ec.Comments,
            rd.Releaser1Id,
            std.StreetTreatCaseId,
            std.MainProblemId,
            ec.AssignedVehicleId,
            ec.AmbulanceAssignmentTime,
            ec.Admissiontime,
            mp.MainProblem,
            std.PriorityId,
            p.Priority,
            tl.InTreatmentAreaId,
            p.PatientCallOutcomeId,
            rd.PickupDate,
            p.PatientId,
            rd.BeginDate,
            rd.EndDate,
			v.VisitId,
            v.VisitBeginDate,
            v.VisitEndDate,
            v.VisitTypeId, 
			v.Date, 
			v.StatusId, 
			v.AdminNotes, 
			v.OperatorNotes, 
            ec.AmbulanceArrivalTime,
            ec.RescueTime,            
			ec.EmergencyCaseId,
            ec.EmergencyNumber,
            ec.EmergencyCodeId,
            ec.DispatcherId,
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
LEFT JOIN AAU.EmergencyCase ec ON ec.EmergencyCaseId = p.EmergencyCaseId
LEFT JOIN CallerCTE c ON c.EmergencyCaseId = ec.EmergencyCaseId
LEFT JOIN AAU.TreatmentList tl ON tl.PatientId = p.PatientId 
LEFT JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId
LEFT JOIN AAU.StreetTreatCase std ON std.PatientId = p.PatientId
LEFT JOIN AAU.priority p ON p.PriorityId = std.PriorityId
LEFT JOIN AAU.MainProblem mp ON mp.MainProblemId = std.MainProblemId
LEFT JOIN AAU.Visit v ON v.StreetTreatCaseId = std.StreetTreatCaseId
LEFT JOIN AAU.EmergencyCode ecd ON ecd.EmergencyCodeId = ec.EmergencyCodeId)

SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE( 
JSON_OBJECT("actionStatus", null),
JSON_OBJECT("ambulanceAction", AmbulanceAction),
JSON_OBJECT("releaseDetailsId", ReleaseDetailsId),
JSON_OBJECT("releaseRequestDate", RequestedDate),
JSON_OBJECT("releaseComplainerNotes", ComplainerNotes),
JSON_OBJECT("streetTreatCaseId", StreetTreatCaseId),
JSON_OBJECT("streetTreatMainProblemId", MainProblemId),
JSON_OBJECT("streetTreatMainProblem", MainProblem),
JSON_OBJECT("streetTreatPriorityId", PriorityId),
JSON_OBJECT("streetTreatPriority", Priority),
JSON_OBJECT("patientCallOutcomeId", PatientCallOutcomeId),
JSON_OBJECT("releasePickupDate", DATE_Format(PickupDate,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("patientId", PatientId),
JSON_OBJECT("releaseBeginDate", DATE_Format(BeginDate,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("releaseEndDate", DATE_Format(EndDate,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("visitBeginDate", DATE_Format(VisitBeginDate,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("visitEndDate", DATE_Format(VisitEndDate,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("ambulanceArrivalTime", DATE_Format(AmbulanceArrivalTime,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("rescueTime", DATE_Format(RescueTime,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("emergencyCaseId", EmergencyCaseId),
JSON_OBJECT("dispatcher", DispatcherId),
JSON_OBJECT("visitTypeId", VisitTypeId),
JSON_OBJECT("visitDate", Date),
JSON_OBJECT("visitStatusId", StatusId),
JSON_OBJECT("visitAdminNotes", AdminNotes),
JSON_OBJECT("visitOperatorNotes", OperatorNotes),
JSON_OBJECT("rescueAmbulanceId", AssignedVehicleId),
JSON_OBJECT("rescueAmbulanceAssignmentDate", DATE_Format(AmbulanceAssignmentTime,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("releaseAmbulanceId", ReleaseAssignedVehicleId),
JSON_OBJECT("releaseAmbulanceAssignmentDate", DATE_Format(ReleaseAmbulanceAssignmentTime,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("admissionTime", DATE_Format(AdmissionTime,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("inTreatmentAreaId", InTreatmentAreaId),
JSON_OBJECT("emergencyNumber", EmergencyNumber),
JSON_OBJECT("emergencyCodeId", EmergencyCodeId),
JSON_OBJECT("emergencyCode", EmergencyCode),
JSON_OBJECT("caseComments", Comments),
JSON_OBJECT("visitId", VisitId),
JSON_OBJECT("callDateTime", DATE_Format(CallDateTime,"%Y-%m-%dT%H:%i:%s")),
JSON_OBJECT("location", Location),
JSON_OBJECT("latLngLiteral", latLngLiteral),
JSON_OBJECT("isUpdated", FALSE),
callerDetails,
Patients))AS DriverViewData
FROM DriverViewCTE;

END$$

DELIMITER ;
