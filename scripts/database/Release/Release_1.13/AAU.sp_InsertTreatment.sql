DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertTreatment!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_InsertTreatment(
IN prm_Username VARCHAR(64),
IN prm_PatientId INT,
IN prm_TreatmentDateTime DATETIME,
IN prm_NextTreatmentDateTime DATETIME,
IN prm_EyeDischarge INT,
IN prm_NasalDischarge INT,
IN prm_Comment VARCHAR(1024)
)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 25/10/2020
Purpose: Used to insert a treatment record for a patient.
*/
DECLARE vOrganisationId INT;
DECLARE vTreatmentExists INT;
DECLARE vSuccess INT;
DECLARE vTreatmentId INT;

SET vTreatmentExists = 0;
SET vSuccess = 0;

SELECT COUNT(1) INTO vTreatmentExists FROM AAU.Treatment WHERE PatientId = prm_PatientId AND TreatmentDateTime = prm_TreatmentDateTime;
SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vTreatmentExists = 0 THEN

START TRANSACTION;

	INSERT INTO AAU.Treatment
		(
        OrganisationId,
        PatientId,
        TreatmentDateTime,
        NextTreatmentDateTime,
        EyeDischargeId,
        NasalDischargeId,
        Comment  
		)
		VALUES
		(
        vOrganisationId,
        prm_PatientId,
        prm_TreatmentDateTime,
        prm_NextTreatmentDateTime,
        prm_EyeDischarge,
        prm_NasalDischarge,
        prm_Comment
		);
        
COMMIT;

	SELECT 1 INTO vSuccess;
    SELECT LAST_INSERT_ID() INTO vTreatmentId;	

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,vTreatmentId,'Treatment','Insert', NOW());

ELSEIF vTreatmentExists >= 1 THEN

	SELECT 2 INTO vSuccess;

ELSE

	SELECT 3 INTO vSuccess;
END IF;

SELECT vSuccess AS success, vTreatmentId AS treatmentId;


END