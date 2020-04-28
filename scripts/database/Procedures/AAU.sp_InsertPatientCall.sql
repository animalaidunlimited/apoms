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
IN prm_CreatedDate DATETIME,
IN prm_CreatedBy INT,
IN prm_Comments VARCHAR(1000),
OUT prm_Success INT)

BEGIN

/*
Created By: Jim Mackenzie
Created On: 28/04/2020
Purpose: Used to insert a new Patient.
*/
DECLARE vOrganisationId INT;
DECLARE vPatientExists INT;

SET vPatientExists = 0;


SELECT COUNT(1) INTO vPatientExists FROM AAU.Patient WHERE EmergencyCaseId = prm_EmergencyCaseId AND Position = prm_Position;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vPatientExists = 0 THEN

START TRANSACTION;

	INSERT INTO AAU.PatientCall
		(
        OrganisationId,        
		PatientId,
		PositiveCallOutcome,
		CallTime,
		AssignedTo,
		CallType,
		PatientCallOutcome,
		CreatedDate,
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
		prm_CreatedDate,
		prm_CreatedBy,
		prm_Comments
		);
        
COMMIT;

	SELECT 1 INTO prm_Success;
    SELECT LAST_INSERT_ID() INTO prm_OutPatientId;      

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,prm_OutPatientId,'PatientCall','Insert', NOW());

ELSEIF vPatientExists > 0 THEN

	SELECT 2 INTO prm_Success;
    
ELSE

	SELECT 3 INTO prm_Success;
END IF;




END$$
DELIMITER ;
