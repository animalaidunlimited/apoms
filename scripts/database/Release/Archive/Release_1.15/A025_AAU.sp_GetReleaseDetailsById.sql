DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetReleaseDetailsById !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_GetReleaseDetailsById(IN prm_PatientId INT)
BEGIN
/*
Created By: Arpit Trivedi
Created On: 21/11/20
Purpose: To fetch release details of a patient.
*/
SELECT
	JSON_OBJECT( 
	"releaseId",rd.ReleaseDetailsId,
    "patientId",rd.PatientId,
	"releaseRequestForm",
		JSON_OBJECT(
			"requestedUser",u.UserName, 
			"requestedDate",DATE_FORMAT(rd.RequestedDate, "%Y-%m-%dT%H:%i:%s")
		), 
	"releaseType",rd.ReleaseTypeId, 
	"complainerNotes",rd.ComplainerNotes,
	"complainerInformed",rd.ComplainerInformed,
	"Releaser1",rd.Releaser1Id, 
	"Releaser2",rd.Releaser2Id, 
	"releaseBeginDate",DATE_FORMAT(rd.BeginDate, "%Y-%m-%dT%H:%i:%s"), 
	"releaseEndDate",DATE_FORMAT(rd.EndDate, "%Y-%m-%dT%H:%i:%s"),
	 "visitForm",
				JSON_OBJECT(
					"streetTreatCaseId", s.StreetTreatCaseId,
				    "patientId",rd.PatientId,
				    "casePriority",s.PriorityId,
				    "teamId",s.TeamId,
				    "mainProblem",s.MainProblemId,
				    "adminNotes",s.AdminComments,
				    "streetTreatCaseStatus",s.StatusId,
					"visits", v.Visits
				)
		) 
AS Result
	FROM
        AAU.ReleaseDetails rd
        INNER JOIN AAU.User u ON u.UserId = rd.RequestedUser
        LEFT JOIN AAU.StreetTreatCase s ON rd.PatientID = s.PatientId
        LEFT JOIN
        (
        SELECT v.StreetTreatCaseId, JSON_ARRAYAGG(
						JSON_OBJECT(
								"visitId",v.VisitId,
								"visit_day",v.Day,
								"visit_status",v.StatusId,
								"visit_type",v.VisitTypeId,
								"visit_comments",v.AdminNotes
						 )
					) AS `visits`
        FROM AAU.Visit v
        WHERE IFNULL(v.IsDeleted,0) = 0
        GROUP BY v.StreetTreatCaseId
        ) v
        ON v.StreetTreatCaseId = s.StreetTreatCaseId
	WHERE 
		rd.PatientId =  prm_PatientId;
END