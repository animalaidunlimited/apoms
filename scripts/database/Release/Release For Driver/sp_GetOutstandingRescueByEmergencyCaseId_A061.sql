DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetOutstandingRescueByEmergencyCaseId !!

DELIMITER $$
CREATE  PROCEDURE AAU.sp_GetOutstandingRescueByEmergencyCaseId( IN prm_EmergencyCaseId INT, IN prm_PatientId INT)
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

 WITH BastPatientsCTE AS
 (
 SELECT PatientId
 FROM AAU.Patient
 WHERE EmergencyCaseId = prm_EmergencyCaseId
 AND (PatientId = prm_PatientId OR prm_PatientId IS NULL)
 ),
 PatientsCTE AS
 (
 SELECT
		p.EmergencyCaseId,
        p.PatientCallOutcomeId,
        MAX(p.PatientId) AS PatientId,
        JSON_Object("patients",
		JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
            JSON_OBJECT("animalType", ant.AnimalType),
            JSON_OBJECT("patientId", p.PatientId),
            JSON_OBJECT("tagNumber", p.TagNumber),
            JSON_OBJECT("largeAnimal", ant.LargeAnimal),
            JSON_OBJECT("mediaCount", IFNULL(pmi.mediaCount,0)),
            pp.PatientProblems
            )
		)) AS Patients     
    FROM AAU.Patient p
    INNER JOIN AAU.AnimalType ant ON ant.AnimalTypeId = p.AnimalTypeId
    INNER JOIN (
		SELECT pp.PatientId,
		JSON_OBJECT("problems", GROUP_CONCAT(pr.Problem)) AS PatientProblems
		FROM AAU.PatientProblem pp
		INNER JOIN AAU.Problem pr ON pr.ProblemId = pp.ProblemId
        WHERE pp.PatientId IN (SELECT PatientId FROM BastPatientsCTE)
		GROUP BY pp.PatientId
    ) pp ON pp.PatientId = p.PatientId
    LEFT JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId
	LEFT JOIN
    (
		SELECT	pmi.PatientId,
				COUNT(pmi.PatientId) as mediaCount
		FROM AAU.PatientMediaItem pmi
        WHERE pmi.PatientId IN (SELECT PatientId FROM BastPatientsCTE)
		GROUP BY pmi.PatientId
    ) pmi ON pmi.PatientId = p.PatientId
    WHERE p.PatientId IN (SELECT PatientId FROM BastPatientsCTE)
    GROUP BY p.EmergencyCaseId,
    rd.ReleaseDetailsId
)


SELECT JSON_MERGE_PRESERVE(
JSON_OBJECT("actionStatus", AAU.fn_GetRescueStatus(	rd.ReleaseDetailsId, 
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
																)),
                                                                JSON_OBJECT("staff1", IF(rd.ReleaseDetailsId IS NULL,r1.UserId,rd.Releaser1Id)),
			JSON_OBJECT("staff1Abbreviation", IF(rd.ReleaseDetailsId IS NULL,r1.Initials,rl1.Initials)),
            JSON_OBJECT("staff1Colour", IF(rd.ReleaseDetailsId IS NULL, r1.Colour,rl1.Colour)),
			JSON_OBJECT("staff2",IF(rd.ReleaseDetailsId IS NULL,r2.UserId,rd.Releaser2Id)),
			JSON_OBJECT("staff2Abbreviation", IF(rd.ReleaseDetailsId IS NULL,r2.Initials,IFNULL(rl2.Initials,''))),
            JSON_OBJECT("staff2Colour", IF(rd.ReleaseDetailsId IS NULL, r2.Colour,IF(rd.Releaser2Id IS NULL, null, rl2.Colour))),
            JSON_OBJECT("assignedVehicleId", IF(rd.ReleaseDetailsId IS NULL, ec.assignedVehicleId, rd.assignedVehicleId)),
			JSON_OBJECT("ambulanceAssignmentTime", DATE_FORMAT(IF(rd.ReleaseDetailsId IS NULL, ec.ambulanceAssignmentTime, rd.ambulanceAssignmentTime), "%Y-%m-%dT%H:%i:%s")),
            JSON_OBJECT("ambulanceArrivalTime", ec.AmbulanceArrivalTime),
            JSON_OBJECT("rescueTime", ec.RescueTime),
            JSON_OBJECT("releaseId", rd.ReleaseDetailsId),
            JSON_OBJECT("requestedDate", DATE_FORMAT(rd.RequestedDate, "%Y-%m-%dT%H:%i:%s")),
			JSON_OBJECT("pickupDate", DATE_FORMAT(rd.PickupDate, "%Y-%m-%dT%H:%i:%s")),
			JSON_OBJECT("releaseBeginDate", DATE_FORMAT(rd.BeginDate, "%Y-%m-%dT%H:%i:%s")),
			JSON_OBJECT("releaseEndDate", DATE_FORMAT(rd.EndDate, "%Y-%m-%dT%H:%i:%s")),
            JSON_OBJECT("releaseType", CONCAT(IF(rd.ReleaseDetailsId IS NULL,"","Normal"), IF(IFNULL(rd.ComplainerNotes,"") <> ""," + Complainer special instructions",""), IF(rd.Releaser1Id IS NULL,""," + Specific staff"), IF(std.StreetTreatCaseId IS NULL,""," + StreetTreat release"))),
            JSON_OBJECT("ambulanceAction", IF(rd.ReleaseDetailsId IS NULL, 'Rescue', 'Release')),
			JSON_OBJECT("emergencyCaseId", ec.EmergencyCaseId),
            JSON_OBJECT("emergencyNumber", ec.EmergencyNumber),
            JSON_OBJECT("emergencyCodeId", ec.EmergencyCodeId),
            JSON_OBJECT("emergencyCode", ecd.EmergencyCode),
            JSON_OBJECT("callDateTime", ec.CallDateTime),
            JSON_OBJECT("callOutcomeId", p.PatientCallOutcomeId),
 			JSON_OBJECT('callerDetails', ca.CallerDetails),
            JSON_OBJECT("filteredCandidate", TRUE),
            p.Patients,
            JSON_OBJECT("location", ec.Location),
            JSON_OBJECT("latitude", ec.Latitude),
            JSON_OBJECT("longitude", ec.Longitude),
			JSON_OBJECT("latLngLiteral",
				JSON_MERGE_PRESERVE(
				JSON_OBJECT("lat",IFNULL(ec.Latitude, 0.0)),
				JSON_OBJECT("lng",IFNULL(ec.Longitude, 0.0))
				))) AS `ambulanceAssignment`
FROM PatientsCTE p
INNER JOIN AAU.EmergencyCase ec ON ec.EmergencycaseId = p.EmergencycaseId
INNER JOIN (
	SELECT ecr.EmergencyCaseId,
	JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
	JSON_OBJECT('callerId', c.CallerId),
	JSON_OBJECT('callerName',c.Name),
	JSON_OBJECT('callerNumber', c.Number)
	)) AS callerDetails
	FROM AAU.Caller c
	INNER JOIN AAU.Emergencycaller ecr ON ecr.CallerId = c.CallerId
    WHERE ecr.IsDeleted = 0
    AND ecr.EmergencyCaseId = prm_EmergencyCaseId
	GROUP BY ecr.EmergencyCaseId
) ca ON ca.EmergencycaseId = ec.EmergencyCaseId
LEFT JOIN AAU.ReleaseDetails rd ON rd.PatientId = p.PatientId
LEFT JOIN AAU.StreetTreatCase std ON std.PatientId = rd.PatientId
LEFT JOIN AAU.EmergencyCode ecd ON ecd.EmergencyCodeId = ec.EmergencyCodeId
LEFT JOIN AAU.TreatmentList tl ON tl.PatientId = p.PatientId AND tl.Admission = 1
LEFT JOIN AAU.User rl1 ON rl1.UserId = rd.Releaser1Id
LEFT JOIN AAU.User rl2 ON rl2.UserId = rd.Releaser2Id
LEFT JOIN AAU.User r1 ON r1.UserId = ec.Rescuer1Id
LEFT JOIN AAU.User r2 ON r2.UserId = ec.Rescuer2Id;

END$$
DELIMITER ;
