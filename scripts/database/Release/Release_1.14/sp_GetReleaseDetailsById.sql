DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetReleaseDetailsById!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetReleaseDetailsById (IN prm_PatientId INT)
BEGIN
/*
Created By: Arpit Trivedi
Created On: 21/11/20
Purpose: To fetch release details of a patient.
*/
SELECT
	JSON_OBJECT( 
	"releaseId",ReleaseDetailsId,
	"releaseRequestForm",
		JSON_OBJECT(
			"requestedUser",RequestedUser, 
			"requestedDate",DATE_FORMAT(RequestedDate, "%Y-%m-%d")
		), 
	"releaseType",ReleaseTypeId, 
	"complainerNotes",ComplainerNotes,
	"complainerInformed",ComplainerInformed,
	"Releaser1",Releaser1Id, 
	"Releaser2",Releaser2Id, 
	"releaseBeginDate",DATE_FORMAT(BeginDate, "%Y-%m-%d"), 
	"releaseEndDate",DATE_FORMAT(EndDate, "%Y-%m-%d"),
	 "visitForm",
				JSON_OBJECT(
					"streetTreatCaseId", s.StreetTreatCaseId,
				    "patientId",s.PatientId,
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
								"visit_comments",v.AdminNotes
						 )
					)
				)
		) 
AS Result
	FROM
        aau.ReleaseDetails rd
        LEFT JOIN  AAU.Streettreatcase s ON rd.PatientID = s.PatientId
        LEFT JOIN AAU.Visit v  ON s.StreetTreatCaseId = v.StreetTreatCaseId AND (v.IsDeleted IS NULL OR v.IsDeleted = 0)
	WHERE 
		rd.PatientId =  prm_PatientId;
END$$

