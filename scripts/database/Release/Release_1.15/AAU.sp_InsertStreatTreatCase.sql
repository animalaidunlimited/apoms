DELIMITER !!
DROP procedure IF EXISTS AAU.sp_InsertStreatTreatCase!!

DELIMITER $$

CREATE PROCEDURE `sp_InsertStreatTreatCase`(
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
Created By: Jim Mackenzie
Created On: 21/11/2020
Purpose: Used to insert a new case.

*/


DECLARE vCaseNoExists INT;
DECLARE vSuccess INT;
DECLARE vStreatTreatCaseId INT;
SET vCaseNoExists = 0;

SELECT COUNT(1) INTO vCaseNoExists FROM AAU.streattreatcase WHERE PatientId = prm_PatientId;

IF vCaseNoExists = 0 THEN

	INSERT INTO AAU.streattreatcase
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
    SELECT LAST_INSERT_ID() INTO vStreatTreatCaseId;
    
	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (NULL,vStreatTreatCaseId,'Case','Insert', NOW());
    
ELSEIF vCaseNoExists > 0 THEN
	SELECT 2 INTO vSuccess;

ELSE
	SELECT 3 INTO vSuccess;
END IF;

SELECT vStreatTreatCaseId, vSuccess;

END$$