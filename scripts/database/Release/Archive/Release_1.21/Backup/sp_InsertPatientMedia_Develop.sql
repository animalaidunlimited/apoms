DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertPatientMedia !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertPatientMedia(
IN prm_Username VARCHAR(64),
IN prm_MediaType VARCHAR(45),
IN prm_URL VARCHAR(1000),
IN prm_IsPrimary BOOLEAN,
IN prm_DateTime VARCHAR(45),
IN prm_PatientId INT,
IN prm_HeightPX INT,
IN prm_WidthPX INT,
IN prm_Tags VARCHAR(1000)
)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 22/07/2020
Purpose: Used to insert a new media item for a patient.


Modified By: Ankit
Created On:02/05/2021
Purpose: Removed comment column

*/

DECLARE vMediaItemExists INT DEFAULT 0;
DECLARE vMediaItemItemId INT;
DECLARE vOrganisationId INT;
DECLARE vSuccess INT;

SELECT COUNT(1) INTO vMediaItemExists FROM AAU.PatientMediaItem WHERE URL = prm_URL;
SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vMediaItemExists = 0 THEN

START TRANSACTION;

	INSERT INTO AAU.PatientMediaItem
		(
        OrganisationId,
        PatientId,
        DateTime,
        URL,
        IsPrimary,
        HeightPX,
        WidthPX,
        Tags,
        MediaType   
		)
		VALUES
		(
        vOrganisationId,
        prm_PatientId,
        STR_TO_DATE(LEFT(prm_DateTime,19), '%Y-%m-%dT%H:%i:%s'),        
        prm_URL,
        prm_IsPrimary, 
        prm_HeightPX,
		prm_WidthPX,
		prm_Tags,
		prm_MediaType
		);
        
COMMIT;

	SELECT 1 INTO vSuccess;
    SELECT LAST_INSERT_ID() INTO vMediaItemItemId;	

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username, vMediaItemItemId,'Media Item','Insert', NOW());

ELSEIF vMediaItemExists >= 1 THEN

	SELECT 2 INTO vSuccess;

ELSE

	SELECT 3 INTO vSuccess;
END IF;

SELECT vSuccess AS `success`, vMediaItemItemId AS `mediaItemId`;

END$$
DELIMITER ;
