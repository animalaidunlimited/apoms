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

SELECT COUNT(1) INTO vCaseNoExists FROM AAU.Streettreatcase WHERE PatientId = prm_PatientId;

IF vCaseNoExists = 0 THEN

	INSERT INTO AAU.Streettreatcase
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

	SELECT StreetTreatCaseId INTO vStreetTreatCaseId FROM AAU.Streettreatcase WHERE PatientId = prm_PatientId;
    UPDATE  AAU.Streettreatcase
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

