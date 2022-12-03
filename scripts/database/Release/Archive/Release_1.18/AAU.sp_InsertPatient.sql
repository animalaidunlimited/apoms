
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertPatient;!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertPatient(
IN prm_Username VARCHAR(128),
IN prm_EmergencyCaseId INT,
IN prm_Position INT,
IN prm_AnimalTypeId INT,
IN prm_TagNumber VARCHAR(45),
IN prm_PatientStatusId INT,
IN prm_PatientStatusDate DATETIME
)
BEGIN

DECLARE vOrganisationId INT;
DECLARE vPatientExists INT;
DECLARE vPatientId INT;
DECLARE vTagExists INT;
DECLARE vSuccess INT;
DECLARE vTagNumber VARCHAR(20);

SET vPatientExists = 0;
SET vTagExists = 0;
SET vTagNumber = NULL;


SELECT COUNT(1) INTO vPatientExists FROM AAU.Patient WHERE EmergencyCaseId = prm_EmergencyCaseId AND Position = prm_Position;

SELECT COUNT(1) INTO vTagExists FROM AAU.Patient WHERE TagNumber = prm_TagNumber;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;


IF vPatientExists = 0 AND vTagExists = 0 THEN

START TRANSACTION;

	INSERT INTO AAU.Patient
		(
			OrganisationId,        
			EmergencyCaseId,
			Position,
			AnimalTypeId,
			TagNumber,
            PatientStatusId,
            PatientStatusDate
		)
		VALUES
		(
			vOrganisationId,        
			prm_EmergencyCaseId,
			prm_Position,
			prm_AnimalTypeId,
			prm_TagNumber,
            prm_PatientStatusId,
            prm_PatientStatusDate 
		);
      

	SELECT 1 INTO vSuccess;
    SELECT LAST_INSERT_ID(),prm_TagNumber INTO vPatientId,vTagNumber;      

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,vPatientId,'Patient','Insert', NOW());
    
	COMMIT;

ELSEIF vPatientExists > 0 THEN

	SELECT 2 INTO vSuccess;

ELSEIF vTagExists > 0 THEN
    
	SELECT 3 INTO vSuccess;
    
ELSE

	SELECT 4 INTO vSuccess;
END IF;

SELECT vPatientId AS patientId, vSuccess AS success , vTagNumber;

END$$
