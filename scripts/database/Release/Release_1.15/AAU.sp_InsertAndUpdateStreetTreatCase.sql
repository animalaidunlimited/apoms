DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_InsertAndUpdateStreetTreatCase;!!
DELIMITER $$
CREATE  PROCEDURE AAU.sp_InsertAndUpdateStreetTreatCase(
									IN prm_PatientId INT,
									IN prm_PriorityId INT,
									IN prm_StatusId INT,
									IN prm_TeamId INT,
                                    IN prm_MainProblemId INT,
									IN prm_AdminComments TEXT,
									IN prm_OperatorNotes TEXT,
                                    IN prm_ClosedDate DATE,
                                    IN prm_EarlyReleaseFlag BOOLEAN
)
BEGIN
/*
Created By: Ankit Singh
Created On: 27/11/2029
Purpose: Used to insert a new Streat treat case and update a Street treat case.

*/

DECLARE vCaseNoExists INT;
DECLARE vSuccess INT;
DECLARE vStreetTreatCaseId INT;
SET vCaseNoExists = 0;

SELECT COUNT(1) INTO vCaseNoExists FROM AAU.streettreatcase WHERE PatientId = prm_PatientId;

IF vCaseNoExists = 0 THEN

	INSERT INTO AAU.streettreatcase
						(
                        PatientId,
						PriorityId,
						StatusId,
						TeamId,
                        MainProblemId,
						AdminComments,
						OperatorNotes,
                        ClosedDate,
                        EarlyReleaseFlag
						)
				VALUES
						(
                        prm_PatientId,
						prm_PriorityId,
						prm_StatusId,
						prm_TeamId,
                        prm_MainProblemId,
						prm_AdminComments,
						prm_OperatorNotes,
                        prm_ClosedDate,
                        prm_EarlyReleaseFlag
						);
	SELECT 1 INTO vSuccess;
    SELECT LAST_INSERT_ID() INTO vStreetTreatCaseId;
    
	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (NULL,vStreetTreatCaseId,'Case','Insert', NOW());
    
ELSEIF vCaseNoExists > 0 THEN

	SELECT StreetTreatCaseId INTO vStreetTreatCaseId FROM AAU.streettreatcase WHERE PatientId = prm_PatientId;
    UPDATE  AAU.streettreatcase
    SET 
		PriorityId = prm_PriorityId,
		StatusId = prm_StatusId,
		TeamId = prm_TeamId,
		MainProblemId = prm_MainProblemId,
		AdminComments = prm_AdminComments,
		OperatorNotes = prm_OperatorNotes,
		ClosedDate = prm_ClosedDate,
		EarlyReleaseFlag = prm_EarlyReleaseFlag
	WHERE
		StreetTreatCaseId = vStreetTreatCaseId;
	SELECT 2 INTO vSuccess;

ELSE
	SELECT 3 INTO vSuccess;
END IF;
SELECT vStreetTreatCaseId, vSuccess;
END$$

DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetStreetTreatCaseByPatientId`(
							IN prm_PatientId INT
)
BEGIN
DECLARE vSuccess INT;
DECLARE visitExists INT;

SELECT count(1) INTO visitExists FROM AAU.visit WHERE StreetTreatCaseId = (SELECT StreetTreatCaseId FROM AAU.streettreatcase WHERE PatientId=prm_PatientId );

IF visitExists > 1 THEN
SELECT
	JSON_MERGE_PRESERVE(
			JSON_OBJECT("streetTreatCaseId",s.StreetTreatCaseId),
			JSON_OBJECT("patientId",""),
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
		AAU.visit v
        LEFT JOIN AAU.streettreatcase s ON s.StreetTreatCaseId = v.StreetTreatCaseId
	WHERE 
		s.PatientId = prm_PatientId AND (v.IsDeleted IS NULL OR v.IsDeleted = 0);
ELSE 
	SELECT
	JSON_MERGE_PRESERVE(
			JSON_OBJECT("streetTreatCaseId",s.StreetTreatCaseId),
			JSON_OBJECT("patientId",""),
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
		FROM AAU.streettreatcase s
	WHERE
		s.PatientId = prm_PatientId AND (v.IsDeleted IS NULL OR v.IsDeleted = 0);
	
END IF;
END$$
