DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_UpdateStreatTreatCase!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateStreatTreatCase(
    IN prm_StreatTreatCaseId INT,
	IN prm_PatientId INT,
	IN prm_PriorityId INT,
	IN prm_StatusId INT,
	IN prm_TeamId INT,
	IN prm_MainProblemId INT,
	IN prm_AdminNotes TEXT,
	IN prm_OperatorNotes TEXT,
	IN prm_ClosedDate DATE,
	IN prm_EarlyReleaseFlag BOOLEAN
)
BEGIN

DECLARE vSTCaseCount INT;
DECLARE vSuccess INT;
DECLARE vPatientExists INT;

SET vPatientExists = 0;
SET vSTCaseCount = 0;

SELECT COUNT(1) INTO vSTCaseCount FROM AAU.Streattreatcase WHERE StreatTreatCaseId = prm_StreatTreatCaseId;

SELECT COUNT(1) INTO vPatientExists FROM AAU.Streattreatcase WHERE PatientId = prm_PatientId; 

IF vPatientExists = 1 THEN

	UPDATE AAU.Streattreatcase
		SET	
			PriorityId 				= prm_PriorityId,
			StatusId 				= prm_StatusId,
			TeamId 					= prm_TeamId,
			MainProblemId 			= prm_MainProblemId,
			AdminNotes 				= prm_AdminNotes,
			OperatorNotes 			= prm_OperatorNotes,
			ClosedDate 				= prm_ClosedDate,
			EarlyReleaseFlag 		= prm_EarlyReleaseFlag
		WHERE StreatTreatCaseId = prm_StreatTreatCaseId;
	SELECT 1 INTO vSuccess;

ELSEIF vPatientExists > 1 THEN
	SELECT 2 INTO vSuccess;
	
ELSE
	SELECT 3 INTO vSuccess;

END IF;

END$$
