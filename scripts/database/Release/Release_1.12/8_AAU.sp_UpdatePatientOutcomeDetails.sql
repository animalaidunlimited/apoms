DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdatePatientOutcomeDetails!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdatePatientOutcomeDetails(
								IN prm_PatientOutcomeDetailsId INT,
								IN prm_PatientId INT,
								IN prm_Megavac1Date DATE,
								IN prm_Megavac2Date DATE,
								IN prm_RabiesVaccinationDate DATE,
								IN prm_Antibiotics1Id INT,
								IN prm_Antibiotics2Id INT,
								IN prm_Antibiotics3Id INT,
								IN prm_IsoReasonId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 17/10/2020
Purpose: Used to update the outcome details of a patient.
*/

DECLARE vOrganisationId INT;
DECLARE vSuccess INT;

DECLARE vPatientOutcomeDetailsExists INT;
SET vPatientOutcomeDetailsExists = 0;
SET vSuccess = 0;


SELECT COUNT(1) INTO vPatientOutcomeDetailsExists FROM AAU.PatientOutcomeDetails WHERE PatientId = prm_PatientId;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vPatientOutcomeDetailsExists = 1 THEN

START TRANSACTION;

	UPDATE AAU.PatientOutcomeDetails SET
				Megavac1Date			= prm_Megavac1Date,
				Megavac2Date			= prm_Megavac2Date,
				RabiesVaccinationDate	= prm_RabiesVaccinationDate,
				Antibiotics1Id			= prm_Antibiotics1Id,
				Antibiotics2Id			= prm_Antibiotics2Id,
				Antibiotics3Id			= prm_Antibiotics3Id,
				IsoReasonId				= prm_IsoReasonId
	WHERE PatientId = prm_PatientId;
   
COMMIT;         
            
    SELECT 1 INTO vSuccess;
    
    INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_UserName,prm_PatientOutcomeDetailsId,'Patient Outcome Details','Update', NOW());

ELSEIF vPatientOutcomeDetailsExists >= 1 THEN

	SELECT 2 INTO vSuccess;

ELSE

	SELECT 3 INTO vSuccess;
END IF;

SELECT vSuccess AS success, prm_PatientOutcomeDetailsId AS patientOutcomeDetailsId;

END$$
DELIMITER ;
