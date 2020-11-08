DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertPatientOutcomeDetails!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertPatientOutcomeDetails(
								IN prm_PatientOutcomeDetailsId INT,
								IN prm_PatientId INT,
								IN prm_Megavac1Date DATE,
								IN prm_Megavac2Date DATE,
								IN prm_RabiesVaccinationDate DATE,
								IN prm_Antibiotics1Id INT,
								IN prm_Antibiotics2Id INT,
								IN prm_Antibiotics3Id INT,
								IN prm_IsoReasonId INT
)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 22/07/2020
Purpose: Used to insert a new media item for a patient.
*/
DECLARE vOrganisationId INT;
DECLARE vSuccess INT;
DECLARE vPatientOutcomeDetailsId INT;

DECLARE vPatientOutcomeDetailsExists INT;
SET vPatientOutcomeDetailsExists = 0;
SET vSuccess = 0;

SELECT COUNT(1) INTO vPatientOutcomeDetailsExists FROM AAU.PatientOutcomeDetails WHERE PatientId = prm_PatientId;
SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vPatientOutcomeDetailsExists = 0 THEN

START TRANSACTION;

	INSERT INTO AAU.PatientOutcomeDetails
		(
		PatientId,
		Megavac1Date,
		Megavac2Date,
		RabiesVaccinationDate,
		Antibiotics1Id,
		Antibiotics2Id,
		Antibiotics3Id,
		IsoReasonId 
		)
		VALUES
		(
		prm_PatientOutcomeDetailsId,
		prm_PatientId,
		prm_Megavac1Date,
		prm_Megavac2Date,
		prm_RabiesVaccinationDate,
		prm_Antibiotics1Id,
		prm_Antibiotics2Id,
		prm_Antibiotics3Id,
		prm_IsoReasonId
		);
        
COMMIT;

	SELECT 1 INTO vSuccess;
    SELECT LAST_INSERT_ID() INTO vPatientOutcomeDetailsId;	

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,vPatientOutcomeDetailsId,'Patient Outcome Details','Insert', NOW());

ELSEIF vPatientOutcomeDetailsExists >= 1 THEN

	SELECT 2 INTO vSuccess;

ELSE
	SELECT 3 INTO vSuccess;
END IF;

SELECT vSuccess AS success, vPatientOutcomeDetailsId AS patientOutcomeDetailsId;


END