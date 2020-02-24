DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertPatient!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertPatient(
IN prm_Username VARCHAR(128),
IN prm_EmergencyCaseId int(11),
IN prm_Position int(11),
IN prm_AnimalTypeId int(11),
IN prm_TagNumber varchar(5),
OUT prm_OutPatientId INT,
OUT prm_Success INT)

BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to insert a new Patient.
*/
DECLARE vOrganisationId INT;

DECLARE vPatientExists INT;
SET vPatientExists = 0;

SELECT COUNT(1) INTO vPatientExists FROM AAU.Patient WHERE EmergencyCaseId = prm_EmergencyCaseId AND Position = prm_Position;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vPatientExists = 0 THEN

START TRANSACTION;

	INSERT INTO AAU.Patient
		(
        OrganisationId,
        EmergencyCaseId,
		Position,
		AnimalTypeId,
		TagNumber
		)
		VALUES
		(
        vOrganisationId,
        prm_EmergencyCaseId,
		prm_Position,
		prm_AnimalTypeId,
		prm_TagNumber
		);
        
COMMIT;

	SELECT 1 INTO prm_Success;
    SELECT LAST_INSERT_ID() INTO prm_OutPatientId;      

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,prm_CallerId,'Patient','Insert', NOW());

ELSEIF vPatientExists >= 1 THEN

	SELECT 2 INTO prm_Success;

ELSE

	SELECT 3 INTO prm_Success;
END IF;




END$$
DELIMITER ;
