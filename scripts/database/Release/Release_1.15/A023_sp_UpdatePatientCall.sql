DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_UpdatePatientCall !!
DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdatePatientCall(
																	IN prm_Username VARCHAR(128),
																	IN prm_PatientCallId INT,
																	IN prm_PatientId INT,
																	IN prm_PositiveCallOutcome TINYINT,
																	IN prm_CallTime DATETIME,
																	IN prm_AssignedTo INT,
																	IN prm_CallType INT,
																	IN prm_PatientCallOutcome INT,
																	IN prm_Comments VARCHAR(1000)
                                                                    )
BEGIN

/*
Created By: Jim Mackenzie
Created On: 28/04/2020
Purpose: Used to update an existing PatientCall record.
*/

DECLARE vPatientCallExists INT;
DECLARE vOrganisationId INT;
DECLARE vSuccess INT;

SET vPatientCallExists = 0;
SET vOrganisationId = 0;
SET vSuccess = 0;

SELECT COUNT(1), MAX(OrganisationId) INTO vPatientCallExists, vOrganisationId FROM AAU.PatientCall WHERE PatientCallId = prm_PatientCallId;

IF vPatientCallExists = 1 THEN

START TRANSACTION;

	UPDATE AAU.PatientCall
		SET 
			PatientId             = prm_PatientId,
			PositiveCallOutcome   = prm_PositiveCallOutcome,
			CallDateTime          = prm_CallTime,
			AssignedToUserId      = prm_AssignedTo,
			CallTypeId            = prm_CallType,
			PatientCallOutcomeId  = prm_PatientCallOutcome,
			Comments              = prm_Comments
		WHERE PatientCallId = prm_PatientCallId;
        
COMMIT;

	SELECT 1 INTO vSuccess; 

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username, prm_PatientCallId, 'PatientCall', 'Update', NOW());

ELSEIF vPatientCallExists = 0 THEN

	SELECT 2 INTO vSuccess;
    
ELSEIF vPatientCallExists > 1 THEN

	SELECT 3 INTO vSuccess;
    
ELSE

	SELECT 4 INTO vSuccess;
END IF;

SELECT vSuccess AS success;

END$$
DELIMITER ;