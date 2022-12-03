DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdatePatientCallerInteraction !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdatePatientCall !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdatePatientCallerInteraction(
														IN prm_Username VARCHAR(128),
														IN prm_PatientCallerInteractionId INT,
														IN prm_PatientId INT,
														IN prm_PositiveInteraction TINYINT,
														IN prm_CallTime DATETIME,
														IN prm_DoneBy INT,
														IN prm_CallType INT,
														IN prm_PatientCallerInteractionOutcome INT,
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

SELECT COUNT(1), MAX(OrganisationId) INTO vPatientCallExists, vOrganisationId FROM AAU.PatientCallerInteraction WHERE PatientCallerInteractionId = prm_PatientCallerInteractionId;

IF vPatientCallExists = 1 THEN

START TRANSACTION;

	UPDATE AAU.PatientCallerInteraction
		SET 
			PatientId             = prm_PatientId,
			PositiveInteraction   = prm_PositiveInteraction,
			CallDateTime          = prm_CallTime,
			DoneByUserId      = prm_DoneBy,
			CallTypeId            = prm_CallType,
			PatientCallerInteractionOutcomeId  = prm_PatientCallerInteractionOutcome,
			Comments              = prm_Comments
		WHERE PatientCallerInteractionId = prm_PatientCallerInteractionId;
        
COMMIT;

	SELECT 1 INTO vSuccess; 

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username, prm_PatientCallerInteractionId, 'PatientCall', 'Update', NOW());

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
