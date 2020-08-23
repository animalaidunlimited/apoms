DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertPatientCall!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertPatientCall(
IN prm_Username VARCHAR(128),
IN prm_PatientId INT,
IN prm_PositiveCallOutcome TINYINT,
IN prm_CallTime DATETIME,
IN prm_AssignedTo INT,
IN prm_CallType INT,
IN prm_PatientCallOutcome INT,
IN prm_Comments VARCHAR(1000),
INOUT prm_PatientCallId INT,
OUT prm_Success INT)

BEGIN

/*
Created By: Jim Mackenzie
Created On: 28/04/2020
Purpose: Used to insert a new PatientCall.
*/
DECLARE vOrganisationId INT;
DECLARE vPatientCallExists INT;
DECLARE vCreatedUserId INT;

SET vPatientCallExists = 0;
SET vCreatedUserId = 0;

SELECT COUNT(1) INTO vPatientCallExists FROM AAU.PatientCall WHERE PatientCallId = prm_PatientCallId;

SELECT OrganisationId, UserId INTO vOrganisationId, vCreatedUserId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vPatientCallExists = 0 THEN

START TRANSACTION;

	INSERT INTO AAU.PatientCall
		(
        OrganisationId,        
		PatientId,
		PositiveCallOutcome,
		CallDateTime,
		AssignedToUserId,
		CallTypeId,
		PatientCallOutcomeId,
		CreatedDateTime,
		CreatedBy,
		Comments
		)
		VALUES
		(
        vOrganisationId,
		prm_PatientId,
		prm_PositiveCallOutcome,
		prm_CallTime,
		prm_AssignedTo,
		prm_CallType,
		prm_PatientCallOutcome,
		CURRENT_TIMESTAMP(),
		vCreatedUserId,
		prm_Comments
		);
        
COMMIT;

	SELECT 1 INTO prm_Success;
    SELECT LAST_INSERT_ID() INTO prm_PatientCallId;      

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username, prm_PatientCallId, 'PatientCall', 'Insert', NOW());

ELSEIF vPatientCallExists > 0 THEN

	SELECT 2 INTO prm_Success;
    
ELSE

	SELECT 3 INTO prm_Success;
END IF;




END$$
DELIMITER ;
