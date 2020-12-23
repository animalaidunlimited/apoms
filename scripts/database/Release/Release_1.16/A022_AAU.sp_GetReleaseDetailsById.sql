CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetReleaseDetailsById`(IN prm_PatientId INT)
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
			"requestedDate",DATE_FORMAT(rd.RequestedDate, "%Y-%m-%d")
		), 
	"releaseType",rd.ReleaseTypeId, 
	"complainerNotes",rd.ComplainerNotes,
	"complainerInformed",rd.ComplainerInformed,
	"Releaser1",rd.Releaser1Id, 
	"Releaser2",rd.Releaser2Id, 
	"releaseBeginDate",DATE_FORMAT(rd.BeginDate, "%Y-%m-%d"), 
	"releaseEndDate",DATE_FORMAT(rd.EndDate, "%Y-%m-%d"),
	"streetTreatForm",
				JSON_OBJECT(
					"streetTreatCaseId", s.StreetTreatCaseId,
				    "patientId",rd.PatientId,
				    "casePriority",s.PriorityId,
				    "teamId",s.TeamId,
				    "mainProblem",s.MainProblemId,
				    "adminNotes",s.AdminComments,
				    "streetTreatCaseStatus",s.StatusId,
					"visits",
					JSON_ARRAYAGG(
						JSON_OBJECT(
								"visitId",v.VisitId,
								"visit_day",v.Day,
								"visit_status",v.StatusId,
								"visit_type",v.VisitTypeId,
								"visit_comments",v.AdminNotes,
                                "visit_date",v.Date
						 )
					)
				)
		) 
AS Result
	FROM
        AAU.ReleaseDetails rd
        INNER JOIN AAU.User u ON u.UserId = rd.RequestedUser
        LEFT JOIN AAU.StreetTreatCase s ON rd.PatientID = s.PatientId
        LEFT JOIN AAU.Visit v  ON s.StreetTreatCaseId = v.StreetTreatCaseId AND (v.IsDeleted IS NULL OR v.IsDeleted = 0)
	WHERE 
		rd.PatientId =  prm_PatientId
	GROUP BY rd.ReleaseDetailsId, s.StreetTreatCaseId;
END