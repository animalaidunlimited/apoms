DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_DeletePatientById!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_DeletePatientById(IN prm_Username VARCHAR(64), IN prm_PatientId INT, OUT prm_OutPatientId INT, OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to delete patient by id
*/
DECLARE vOrganisationId INT;

DECLARE vPatientCount INT;
SET vPatientCount = 0;

SELECT prm_PatientId INTO prm_OutPatientId;

SELECT COUNT(1) INTO vPatientCount FROM AAU.Patient WHERE PatientId = prm_PatientId;
                                                    
                                                    
IF vPatientCount > 0 THEN

START TRANSACTION;

UPDATE AAU.Patient SET
IsDeleted = 1,
DeletedDate = NOW()
WHERE PatientId = prm_PatientId;
		
COMMIT;
        
SELECT 1 INTO prm_Success;

  SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

  INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId,prm_Username,prm_PatientId,'Patient','Delete', NOW());
    
ELSE

SELECT 3 INTO prm_Success;

END IF;


END$$
DELIMITER ;



