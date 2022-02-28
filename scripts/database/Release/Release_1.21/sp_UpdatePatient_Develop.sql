DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdatePatient !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdatePatient(
									IN prm_UserName VARCHAR(64),
									IN prm_PatientId INT,
									IN prm_EmergencyCaseId INT,
									IN prm_GUID VARCHAR(128),
									IN prm_AnimalTypeId INT,
                                    IN prm_IsDeleted INT,
                                    IN prm_TagNumber VARCHAR(45),
                                    IN prm_PatientCallOutcomeId INT,
                                    IN prm_SameAsEmergencyNumber INT,
									IN prm_PatientStatusDate DATETIME
)
BEGIN

DECLARE vOrganisationId INT;
DECLARE vPatientExists INT;
DECLARE vPatientId INT;
DECLARE vTagNumber VARCHAR(45);
DECLARE vExistingTagNumber VARCHAR(45);
DECLARE vSameAsEmergencyCaseId INT;
DECLARE vSuccess INT;

SET vTagNumber = NULL;
SET vSameAsEmergencyCaseId = NULL;

SELECT COUNT(1) INTO vPatientExists
FROM AAU.Patient WHERE PatientId <> prm_PatientId
AND EmergencyCaseId = prm_EmergencyCaseId
AND GUID = prm_GUID AND IsDeleted = 0;

SELECT TagNumber INTO vExistingTagNumber FROM AAU.Patient WHERE PatientId = prm_PatientId;

SELECT EmergencyCaseId INTO vSameAsEmergencyCaseId FROM AAU.EmergencyCase WHERE EmergencyNumber = prm_SameAsEmergencyNumber;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vPatientExists = 0 THEN

	UPDATE AAU.Patient SET
			GUID		= prm_GUID,
			AnimalTypeId	= prm_AnimalTypeId,
			TagNumber		= IF(prm_IsDeleted = 1, NULL, UPPER(prm_TagNumber)),
            PatientCallOutcomeId = prm_PatientCallOutcomeId,
            SameAsEmergencyCaseId = vSameAsEmergencyCaseId,
            IsDeleted		= prm_IsDeleted,
            PatientStatusDate = prm_PatientStatusDate,
            DeletedDate		= CASE
								WHEN prm_IsDeleted = FALSE THEN NULL
                                WHEN prm_IsDeleted = TRUE AND DeletedDate IS NULL THEN NOW()
							  END
	WHERE PatientId = prm_PatientId;

    -- Now update the Census in case there were records entered there early.
    IF IFNULL(prm_TagNumber, '') <> '' AND vExistingTagNumber <> prm_TagNumber THEN
		UPDATE AAU.Census SET TagNumber = prm_TagNumber WHERE PatientId = prm_PatientId;
    END IF;

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username, prm_PatientId,'Patient','Update', NOW());

    SELECT 1,prm_TagNumber,prm_PatientId INTO vSuccess,vTagNumber,vPatientId;

ELSEIF vPatientExists >= 1 THEN

	SELECT 2 INTO vSuccess;

ELSE

	SELECT 3 INTO vSuccess;
END IF;

SELECT vPatientId AS patientId, vTagNumber, vSuccess AS success;

END$$

DELIMITER ;
