DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdatePatientMedia!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdatePatientMedia(
IN prm_Username VARCHAR(45),
IN prm_PatientMediaItemId INT,
IN prm_MediaType VARCHAR(45),
IN prm_URL VARCHAR(1000),
IN prm_DateTime VARCHAR(45),
IN prm_Comment VARCHAR(1000),
IN prm_HeightPX INT,
IN prm_WidthPX INT,
IN prm_Tags VARCHAR(1000),
IN prm_Deleted BOOLEAN,
OUT prm_Success INT)

BEGIN

/*
Created By: Jim Mackenzie
Created On: 28/04/2020
Purpose: Used to update an existing PatientMediaItem record.
*/

DECLARE vPatientMediaItemExists INT;
DECLARE vOrganisationId INT;

SET vPatientMediaItemExists = 0;
SET vOrganisationId = 0;

SELECT COUNT(1), MAX(OrganisationId) INTO vPatientMediaItemExists, vOrganisationId FROM AAU.PatientMediaItem WHERE PatientMediaItemId = prm_PatientMediaItemId;

IF vPatientMediaItemExists = 1 THEN

START TRANSACTION;

	UPDATE AAU.PatientMediaItem
		SET 
        DateTime  = STR_TO_DATE(LEFT(prm_DateTime,19), '%Y-%m-%dT%H:%i:%s'), 
        URL       = prm_URL,
        Comment   = prm_Comment,
        HeightPX  = prm_HeightPX,
        WidthPX   = prm_WidthPX,
        Tags      = prm_Tags,
        MediaType = prm_MediaType,
        IsDeleted = prm_Deleted,
        DeletedDateTime = IF(prm_Deleted = 1, CURRENT_TIMESTAMP(), NULL)
		WHERE PatientMediaItemId = prm_PatientMediaItemId;
        
COMMIT;

	SELECT 1 INTO prm_Success; 

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username, prm_PatientMediaItemId, 'PatientMediaItem', 'Update', NOW());

ELSEIF vPatientMediaItemExists = 0 THEN

	SELECT 2 INTO prm_Success;
    
ELSEIF vPatientMediaItemExists > 1 THEN

	SELECT 3 INTO prm_Success;
    
ELSE

	SELECT 4 INTO prm_Success;
END IF;


END$$
DELIMITER ;
