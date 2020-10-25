DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateTreatment!!

DELIMITER $$


CREATE PROCEDURE AAU.sp_UpdateTreatment(
IN prm_Username VARCHAR(64),
IN prm_PatientId INT,
IN prm_TreatmentId INT,
IN prm_TreatmentDateTime DATETIME,
IN prm_NextTreatmentDateTime DATETIME,
IN prm_EyeDischarge INT,
IN prm_NasalDischarge INT,
IN prm_Comment VARCHAR(1024))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 25/10/2020
Purpose: Used to update an existing Treatment record.
*/

DECLARE vOrganisationId INT;
DECLARE vTreatmentExists INT;
DECLARE vSuccess INT;

SET vOrganisationId = 0;
SET vSuccess = 0;

SELECT COUNT(1) INTO vTreatmentExists FROM AAU.Treatment WHERE TreatmentId = prm_TreatmentId;
SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vTreatmentExists = 1 THEN

START TRANSACTION;
		UPDATE AAU.Treatment
			SET 
			TreatmentDateTime		= prm_TreatmentDateTime,
			NextTreatmentDateTime	= prm_NextTreatmentDateTime,
			EyeDischargeId			= prm_EyeDischarge,
			NasalDischargeId		= prm_NasalDischarge,
			Comment					= prm_Comment
		WHERE TreatmentId = prm_TreatmentId;
COMMIT;

	SELECT 1 INTO vSuccess; 

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username, prm_TreatmentId, 'Treatment', 'Update', NOW());

ELSEIF vTreatmentExists = 0 THEN

	SELECT 2 INTO vSuccess;
    
ELSEIF vTreatmentExists > 1 THEN

	SELECT 3 INTO vSuccess;
    
ELSE

	SELECT 4 INTO vSuccess;
END IF;

SELECT vSuccess AS success, prm_TreatmentId AS treatmentId;

END