DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdatePatientDetails!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdatePatientDetails(
									IN prm_UserName VARCHAR(64),
									IN prm_PatientId INT,
                                    IN prm_AnimalTypeId INT,
                                    IN prm_MainProblems VARCHAR(256),
                                    IN prm_Description VARCHAR(256),
                                    IN prm_Sex INT,
                                    IN prm_TreatmentPriority INT,
                                    IN prm_ABCStatus INT,
                                    IN prm_ReleaseStatus INT,
                                    IN prm_Temperament INT)
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
				AnimalTypeId		= prm_AnimalTypeId,
				MainProblems		= prm_MainProblems,
				Description			= prm_Description,
				Sex					= prm_Sex,
				TreatmentPriority	= prm_TreatmentPriority,
				ABCStatus			= prm_ABCStatus,
				ReleaseStatus		= prm_ReleaseStatus,
				Temperament			= prm_Temperament
	WHERE PatientId = prm_PatientId;
   
COMMIT;         
            
    SELECT 1 INTO prm_Success;
    
    INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_UserName,prm_PatientId,'Patient',CONCAT('Update patient details'), NOW());

ELSEIF vPatientExists >= 1 THEN

	SELECT 2 INTO prm_Success;

ELSE

	SELECT 3 INTO prm_Success;
END IF;

END$$
DELIMITER ;
