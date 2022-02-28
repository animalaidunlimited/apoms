DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdatePatientMedia !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdatePatientMedia(
IN prm_Username VARCHAR(45),
IN prm_PatientMediaItemId INT,
IN prm_MediaType VARCHAR(45),
IN prm_isPrimary BOOLEAN,
IN prm_DateTime VARCHAR(45),
IN prm_HeightPX INT,
IN prm_WidthPX INT,
IN prm_Tags VARCHAR(1000),
IN prm_Deleted BOOLEAN)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 28/04/2020
Purpose: Used to update an existing PatientMediaItem record.


Modified By: Ankit Singh
Modified On: 04/05/2021
Purpose: removed comment column
*/

DECLARE vPatientMediaItemExists INT;
DECLARE vOrganisationId INT;
DECLARE vPatientId INT;
DECLARE vSuccess INT;

SET vPatientMediaItemExists = 0;
SET vOrganisationId = 0;
SET vPatientId = 0;
SET vSuccess = 0;

SELECT COUNT(1), MAX(OrganisationId), MAX(PatientId) INTO vPatientMediaItemExists, vOrganisationId, vPatientId FROM AAU.PatientMediaItem WHERE PatientMediaItemId = prm_PatientMediaItemId;

IF vPatientMediaItemExists = 1 THEN

START TRANSACTION;

		-- Unset the current primary image if the new one is primary
		IF prm_IsPrimary = 1 THEN
			UPDATE AAU.PatientMediaItem SET IsPrimary = 0 WHERE PatientId = vPatientId AND IsPrimary = 1;
		END IF;

		UPDATE AAU.PatientMediaItem
			SET 
			DateTime  = DATE_FORMAT(prm_DateTime,'%Y-%m-%dT%H:%i:%s'),
			IsPrimary = prm_IsPrimary,
			HeightPX  = prm_HeightPX,
			WidthPX   = prm_WidthPX,
			Tags      = prm_Tags,
			MediaType = prm_MediaType,
			IsDeleted = prm_Deleted,
			DeletedDateTime = IF(prm_Deleted = 1, CURRENT_TIMESTAMP(), NULL)
		WHERE PatientMediaItemId = prm_PatientMediaItemId;
        
COMMIT;



	SELECT 1 INTO vSuccess; 

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username, prm_PatientMediaItemId, 'PatientMediaItem', 'Update', NOW());

ELSEIF vPatientMediaItemExists = 0 THEN

	SELECT 2 INTO vSuccess;
    
ELSEIF vPatientMediaItemExists > 1 THEN

	SELECT 3 INTO vSuccess;
    
ELSE

	SELECT 4 INTO vSuccess;
END IF;
-- STR_TO_DATE(LEFT(prm_DateTime,19), '%Y-%m-%dT%H:%i:%s'),

SELECT vSuccess AS `success`, prm_PatientMediaItemId AS `mediaItemId`;

END$$
