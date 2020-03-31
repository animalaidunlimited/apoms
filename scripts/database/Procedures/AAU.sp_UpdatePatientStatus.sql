DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdatePatientStatus!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdatePatientStatus(
									IN prm_UserName VARCHAR(64),
									IN prm_PatientId INT,
                                    IN prm_PatientStatusId INT,
                                    IN prm_PatientStatusDate DATETIME,
                                    IN prm_PN CHAR(1),
                                    IN prm_SuspectedRabies TINYINT,
									OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/03/2020
Purpose: Used to update the status of a patient.
*/

DECLARE vOrganisationId INT;

DECLARE vPatientExists INT;
SET vPatientExists = 0;

SELECT COUNT(1) INTO vPatientExists FROM AAU.Patient WHERE PatientId = prm_PatientId;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vPatientExists = 1 THEN

START TRANSACTION;

	UPDATE AAU.Patient SET
			PatientStatusId = prm_PatientStatusId,
            PatientStatusDate = prm_PatientStatusDate,
            PN = prm_PN,
            SuspectedRabies = prm_SuspectedRabies
	WHERE PatientId = prm_PatientId;
   
COMMIT;         
            
    SELECT 1 INTO prm_Success;
    
    INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_UserName,prm_PatientId,'Patient',CONCAT('Update Status Id: ', prm_PatientStatusId), NOW());

ELSEIF vPatientExists >= 1 THEN

	SELECT 2 INTO prm_Success;

ELSE

	SELECT 3 INTO prm_Success;
END IF;

END$$
DELIMITER ;
