DELIMITER !!
DROP procedure IF EXISTS AAU.sp_GetStreetTreatCaseByPatientId!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetStreetTreatCaseByPatientId(
							IN prm_PatientId INT
)BEGIN
DECLARE vSuccess INT;
DECLARE visitExists INT;
DECLARE vStreetTreatCaseIdExists INT;

SELECT count(StreetTreatCaseId) INTO vStreetTreatCaseIdExists FROM AAU.Streettreatcase WHERE PatientId=prm_PatientId;

SELECT count(1) INTO visitExists FROM AAU.Visit WHERE StreetTreatCaseId = (SELECT DISTINCT s.StreetTreatCaseId FROM AAU.Streettreatcase s, AAU.Visit v WHERE s.PatientId=prm_PatientId  AND (v.IsDeleted IS NULL OR v.IsDeleted = 0));

IF visitExists > 0 AND vStreetTreatCaseIdExists> 0 THEN
SELECT
	JSON_MERGE_PRESERVE(
			JSON_OBJECT("streetTreatCaseId",s.StreetTreatCaseId),
			JSON_OBJECT("patientId",s.PatientId),
			JSON_OBJECT("casePriority",s.PriorityId),
			JSON_OBJECT("teamId",s.TeamId),
			JSON_OBJECT("mainProblem",s.MainProblemId),
            JSON_OBJECT("adminNotes",s.AdminComments),
            JSON_OBJECT("streetTreatCaseStatus",s.StatusId),
            JSON_OBJECT("visits",
				JSON_ARRAYAGG(
					JSON_MERGE_PRESERVE(
						JSON_OBJECT("visitId",v.VisitId),
						JSON_OBJECT("visit_day",v.Day),
						JSON_OBJECT("visit_status",v.StatusId),
						JSON_OBJECT("visit_type",v.VisitTypeId),
						JSON_OBJECT("visit_comments",v.AdminNotes)
					)
				)
            )
	) 
AS Result
	FROM
		AAU.Visit v
        LEFT JOIN AAU.Streettreatcase s ON s.StreetTreatCaseId = v.StreetTreatCaseId
	WHERE 
		s.PatientId = prm_PatientId AND (v.IsDeleted IS NULL OR v.IsDeleted = 0);
        
ELSEIF visitExists = 0  AND vStreetTreatCaseIdExists > 0 THEN 
	SELECT
	JSON_MERGE_PRESERVE(
			JSON_OBJECT("streetTreatCaseId",s.StreetTreatCaseId),
			JSON_OBJECT("patientId",s.PatientId),
			JSON_OBJECT("casePriority",s.PriorityId),
			JSON_OBJECT("teamId",s.TeamId),
			JSON_OBJECT("mainProblem",s.MainProblemId),
            JSON_OBJECT("adminNotes",s.AdminComments),
            JSON_OBJECT("streetTreatCaseStatus",s.StatusId),
            JSON_OBJECT("visits",
				JSON_ARRAYAGG(
					JSON_MERGE_PRESERVE(
						JSON_OBJECT("visitId",null),
						JSON_OBJECT("visit_day",null),
						JSON_OBJECT("visit_status",null),
						JSON_OBJECT("visit_type",null),
						JSON_OBJECT("visit_comments",null)
					)
				)
            )
		)
	AS Result
		FROM
			AAU.Streettreatcase s
	WHERE
		s.PatientId = prm_PatientId ;
ELSE
	SELECT null AS Result;
END IF;

END$$