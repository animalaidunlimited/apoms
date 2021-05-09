DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertPatientCallerInteraction !!
DROP PROCEDURE IF EXISTS AAU.sp_InsertPatientCall !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_InsertPatientCallerInteraction(
IN prm_Username VARCHAR(128),
IN prm_PatientId INT,
IN prm_PositiveInteraction TINYINT,
IN prm_CallTime DATETIME,
IN prm_DoneBy INT,
IN prm_CallType INT,
IN prm_PatientCallerInteractionOutcome INT,
IN prm_Comments VARCHAR(1000))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 28/04/2020
Purpose: Used to insert a new PatientCall.
*/
DECLARE vOrganisationId INT;
DECLARE vPatientCallExists INT;
DECLARE vPatientCallerInteractionId INT;
DECLARE vCreatedUserId INT;
DECLARE vSuccess INT;

SET vSuccess = 0;
SET vPatientCallExists = 0;
SET vCreatedUserId = 0;
SET vPatientCallerInteractionId = 0;

SELECT COUNT(1) INTO vPatientCallExists FROM AAU.PatientCallerInteraction WHERE PatientCallerInteractionId = vPatientCallerInteractionId;

SELECT OrganisationId, UserId INTO vOrganisationId, vCreatedUserId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vPatientCallExists = 0 THEN

START TRANSACTION;

	INSERT INTO AAU.PatientCallerInteraction
		(
        OrganisationId,        
		PatientId,
		PositiveInteraction,
		CallDateTime,
		DoneByUserId,
		CallTypeId,
		PatientCallerInteractionOutcomeId,
		CreatedDateTime,
		CreatedBy,
		Comments
		)
		VALUES
		(
        vOrganisationId,
		prm_PatientId,
		prm_PositiveInteraction,
		prm_CallTime,
		prm_DoneBy,
		prm_CallType,
		prm_PatientCallerInteractionOutcome,
		CURRENT_TIMESTAMP(),
		vCreatedUserId,
		prm_Comments
		);
        
COMMIT;

	SELECT 1 INTO vSuccess;
    SELECT LAST_INSERT_ID() INTO vPatientCallerInteractionId;      

	INSERT INTO AAU.Logging (OrganisationId, 
    UserName, 
    RecordId, 
    ChangeTable, 
    LoggedAction, 
    DateTime)
	VALUES (vOrganisationId, 
    prm_Username, 
    vPatientCallerInteractionId, 
    'PatientCall', 
    'Insert', 
    NOW());

ELSEIF vPatientCallExists > 0 THEN

	SELECT 2 INTO vSuccess;
    
ELSE

	SELECT 3 INTO vSuccess;
END IF;


SELECT vPatientCallerInteractionId AS patientCallerInteractionId, vSuccess AS success;

END$$
DELIMITER ;
