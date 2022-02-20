DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetStreetTreatCaseByPatientId !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetStreetTreatCaseByPatientId (
							IN prm_PatientId INT
)
BEGIN

/*
Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Replacing team with assigned vehicle.
*/

DECLARE vSuccess INT;
DECLARE visitExists INT;
DECLARE vStreetTreatCaseIdExists INT;

SELECT COUNT(StreetTreatCaseId) INTO vStreetTreatCaseIdExists FROM AAU.Streettreatcase WHERE PatientId = prm_PatientId;

SELECT COUNT(DISTINCT s.StreetTreatCaseId) INTO visitExists
FROM AAU.StreettreatCase s
INNER JOIN AAU.Visit v ON s.PatientId = prm_PatientId 
WHERE (v.IsDeleted IS NULL OR v.IsDeleted = 0);

IF visitExists > 0 AND vStreetTreatCaseIdExists> 0 THEN
SELECT
	JSON_MERGE_PRESERVE(
			JSON_OBJECT("streetTreatCaseId",s.StreetTreatCaseId),
			JSON_OBJECT("patientId",s.PatientId),
			JSON_OBJECT("casePriority",s.PriorityId),
			JSON_OBJECT("assignedVehicleId",s.assignedVehicleId),
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
	FROM AAU.Visit v
        INNER JOIN AAU.Streettreatcase s ON s.StreetTreatCaseId = v.StreetTreatCaseId AND s.PatientId = prm_PatientId
	WHERE IFNULL(v.IsDeleted,0) = 0;
        
ELSEIF visitExists = 0  AND vStreetTreatCaseIdExists > 0 THEN 
	SELECT
	JSON_MERGE_PRESERVE(
			JSON_OBJECT("streetTreatCaseId",s.StreetTreatCaseId),
			JSON_OBJECT("patientId",s.PatientId),
			JSON_OBJECT("casePriority",s.PriorityId),
			JSON_OBJECT("assignedVehicleId",s.AssignedVehicleId),
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
	FROM AAU.StreetTreatCase s
	WHERE s.PatientId = prm_PatientId ;
ELSE
	SELECT null AS Result;
END IF;

END$$
DELIMITER ;
