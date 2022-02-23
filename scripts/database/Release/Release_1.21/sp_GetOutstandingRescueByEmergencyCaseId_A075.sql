DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetOutstandingRescueByEmergencyCaseId !!

-- CALL AAU.sp_GetOutstandingRescueByEmergencyCaseId(104161,null,"Rescue");

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetOutstandingRescueByEmergencyCaseId( IN prm_EmergencyCaseId INT,
 IN prm_PatientId INT,
 IN prm_AmbulanceAction VARCHAR(45))
BEGIN


/**************************************************************************
Author: Jim Mackenzie
Date: 16/04/2020
Purpose: To retrieve outstanding rescues for display in the rescue board.

Updated By: Arpit Trivedi
Date: 29/11/2020
Purpose: To retrieve outstanding rescues and releases for display on board.

Updated By: Arpit Trivedi
Date: 28/04/2021
Purpose: Moved the Outcome to the patient level so now it will retrieve the rescues and releases on the patient call outcome.

Updated By: Jim Mackenzie
Date: 28/04/2021
Purpose: Altering status based upon whether the admission area has been added

***************************************************************************/

 WITH RescueReleaseSTPatientId AS (
	SELECT PatientId
    FROM AAU.Patient
    WHERE EmergencyCaseId = prm_EmergencyCaseId
    AND IFNULL(prm_PatientId, PatientId) = PatientId
),

EmergencyCaseIds AS
(
SELECT EmergencyCaseId
FROM AAU.Patient
WHERE PatientId IN (SELECT PatientId FROM RescueReleaseSTPatientId)
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
    SELECT DISTINCT
		p.EmergencyCaseId,
        MAX(p.PatientCallOutcomeId) AS `PatientCallOutcomeId`,
        IFNULL(rd.PatientId, p.EmergencyCaseId) AS `PatientId`, -- Tricking the query to group rescues together, but keep releases apart.
		JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
            JSON_OBJECT("animalType", ant.AnimalType),
            JSON_OBJECT("animalTypeId", p.AnimalTypeId),
            JSON_OBJECT("patientId", IFNULL(rd.PatientId, p.PatientId)),
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
					JSON_OBJECT("sameAsNumber",p.SameAsEmergencyCaseId)
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
        WHERE pp.PatientId IN (SELECT PatientId FROM RescueReleaseSTPatientId)
		GROUP BY pp.PatientId
    ) pp ON pp.PatientId = p.PatientId
    LEFT JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId
    LEFT JOIN AAU.TreatmentList tl ON tl.PatientId = p.PatientId AND tl.Admission = 1
    LEFT JOIN AAU.CallOutcome co ON co.CallOutcomeId = p.PatientCallOutcomeId
    LEFT JOIN AAU.StreetTreatCase std ON std.PatientId = p.PatientId
	LEFT JOIN
    (
		SELECT	pmi.PatientId,
				COUNT(pmi.PatientId) as mediaCount
		FROM AAU.PatientMediaItem pmi
        WHERE pmi.PatientId IN (SELECT PatientId FROM RescueReleaseSTPatientId)
        AND pmi.IsDeleted = 0
		GROUP BY pmi.PatientId
    ) pmi ON pmi.PatientId = p.PatientId
    WHERE p.PatientId IN (SELECT PatientId FROM RescueReleaseSTPatientId)
    GROUP BY p.EmergencyCaseId,
    IFNULL(rd.PatientId, p.EmergencyCaseId)
)
,
DriverViewObject AS
(
	SELECT CASE
            WHEN rd.ReleaseDetailsId IS NOT NULL AND std.StreetTreatCaseId IS NULL AND rd.IsStreetTreatRelease = 0 THEN 'Release'
            WHEN rd.ReleaseDetailsId IS NULL AND std.StreetTreatCaseId IS NOT NULL THEN 'StreetTreat'
            WHEN rd.ReleaseDetailsId IS NOT NULL AND std.StreetTreatCaseId IS NOT NULL AND rd.IsStreetTreatRelease = 1 THEN 'STRelease'
            WHEN rd.ReleaseDetailsId IS NOT NULL AND std.StreetTreatCaseId IS NOT NULL AND rd.EndDate IS NOT NULL
            AND prm_AmbulanceAction = 'StreetTreat' THEN 'StreetTreat'
            WHEN rd.ReleaseDetailsId IS NOT NULL AND std.StreetTreatCaseId IS NOT NULL AND rd.EndDate IS NOT NULL
            AND prm_AmbulanceAction = 'Release' THEN 'Release'
           -- WHEN rd.ReleaseDetailsId IS NOT NULL AND std.StreetTreatCaseId IS NOT NULL AND rd.IsStreetTreatRelease = 0 THEN 'Release'
            ELSE 'Rescue' END
            AS AmbulanceAction,
            			AAU.fn_GetRescueStatus(
						rd.ReleaseDetailsId,
						rd.RequestedUser,
						rd.RequestedDate,
						rd.AssignedVehicleId,
						rd.PickupDate,
						rd.BeginDate,
						rd.EndDate,
						ec.AssignedVehicleId,
						ec.AmbulanceArrivalTime,
						ec.RescueTime,
						ec.AdmissionTime,
						p.PatientCallOutcomeId,
						tl.InTreatmentAreaId
					) AS `ActionStatusId`,
			IF((rd.AssignedVehicleId IS NULL AND std.AssignedVehicleId IS NULL),ec.AssignedVehicleId,
				IF((rd.AssignedVehicleId IS NOT NULL AND std.AssignedVehicleId IS NULL),rd.AssignedVehicleId,
				IF((rd.AssignedVehicleId IS NULL AND std.AssignedVehicleId IS NOT NULL),std.AssignedVehicleId,
				IF((rd.AssignedVehicleId IS NOT NULL AND std.AssignedVehicleId IS NOT NULL),std.AssignedVehicleId,NULL)
				))) AS driverAssignedVehicleId,
            rd.ReleaseDetailsId,
            rd.AssignedVehicleId AS ReleaseAssignedVehicleId,
            rd.AmbulanceAssignmentTime AS ReleaseAmbulanceAssignmentTime,
            rd.RequestedDate,
            rd.ComplainerNotes,
			ec.Comments,
            rd.Releaser1Id,
            std.StreetTreatCaseId,
            std.AssignedVehicleId AS StreetTreatAssignedVehicleId,
            std.AmbulanceAssignmentTime AS StreetTreatAmbulanceAssignmentTime,
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
			CASE WHEN
				rd.ReleaseDetailsId IS NULL AND std.StreetTreatCaseId IS NOT NULL AND v.VisitId IS NOT NULL THEN v.VisitId
                WHEN rd.ReleaseDetailsId IS NULL AND std.StreetTreatCaseId IS NOT NULL AND rd.ReleaseDetailsId IS NOT NULL AND rd.EndDate IS NOT NULL THEN v.VisitId
                ELSE NULL
			END visitId,
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
LEFT JOIN AAU.Priority p ON p.PriorityId = std.PriorityId
LEFT JOIN AAU.MainProblem mp ON mp.MainProblemId = std.MainProblemId
LEFT JOIN AAU.Visit v ON v.StreetTreatCaseId = std.StreetTreatCaseId
LEFT JOIN AAU.EmergencyCode ecd ON ecd.EmergencyCodeId = ec.EmergencyCodeId

),

DriverVehicleUserListCTE AS (
SELECT JSON_ARRAYAGG(u.UserId) rescuerList,
vs.VehicleId
FROM AAU.VehicleShift vs
INNER JOIN AAU.VehicleShiftUser vsu ON vsu.VehicleShiftId = vs.VehicleShiftId
INNER JOIN AAU.User u ON u.UserId = vsu.UserId
WHERE vs.VehicleId IN (SELECT driverAssignedVehicleId FROM DriverViewObject )
AND vs.StartDate<= NOW() AND vs.EndDate >= NOW() AND IFNULL(vs.IsDeleted,0) = 0
-- GROUP BY u.UserId,
-- vs.VehicleId
GROUP BY vs.VehicleId
),
DriverViewCTE AS (
	SELECT *
    FROM DriverViewObject dvo
    LEFT JOIN DriverVehicleUserListCTE dvuc ON dvuc.VehicleId = dvo.driverAssignedVehicleId
   -- WHERE IF(AmbulanceAction = 'StreetTreat', VisitBeginDate <= NOW() AND IFNULL(VisitEndDate, NOW()) >= NOW(), VisitBeginDate IS NULL AND VisitEndDate IS NULL)
)


SELECT
JSON_MERGE_PRESERVE(
JSON_OBJECT("actionStatus", null),
JSON_OBJECT("actionStatusId", ActionStatusId),
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
JSON_OBJECT("streetTreatAmbulanceId", StreetTreatAssignedVehicleId),
JSON_OBJECT("streetTreatAmbulanceAssignmentDate", DATE_Format(StreetTreatAmbulanceAssignmentTime,"%Y-%m-%dT%H:%i:%s")),
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
JSON_OBJECT('rescuerList',rescuerList),
callerDetails,
Patients)AS DriverViewData
FROM DriverViewCTE;


END$$
DELIMITER ;
