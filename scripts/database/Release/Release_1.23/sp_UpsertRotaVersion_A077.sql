DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertRotaVersion!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertRotaVersion(
		IN prm_Username VARCHAR(45),
        IN prm_RotaId INT,
		IN prm_RotaVersionId INT,
		IN prm_RotaVersionName VARCHAR(64),
        IN prm_DefaultRotaVersion TINYINT,        
        IN prm_Deleted TINYINT
)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 27/09/2022
Purpose: Procedure to add rota version
*/

DECLARE vSuccess INT;
DECLARE vRotaVersionId INT;
DECLARE vOrganisationId INT;
DECLARE vTimeNow DATETIME;
DECLARE vRotaVersionExists TINYINT;

SET vRotaVersionId = prm_RotaVersionId;

SELECT u.OrganisationId, CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vOrganisationId, vTimeNow
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT COUNT(1) INTO vRotaVersionExists FROM AAU.RotaVersion WHERE RotaVersionId = prm_RotaVersionId;

IF(prm_DefaultRotaVersion = 1) THEN

UPDATE AAU.RotaVersion SET DefaultRotaVersion = 0 WHERE DefaultRotaVersion = 1 AND RotaId = prm_RotaId;

END IF;

IF vRotaVersionExists = 0 THEN

	INSERT INTO AAU.RotaVersion (
		OrganisationId,
		RotaId,
		RotaVersionName,
		DefaultRotaVersion
	)
	VALUES(
		vOrganisationId,
		prm_RotaId,
		prm_RotaVersionName,
		prm_DefaultRotaVersion
	);

    SELECT LAST_INSERT_ID() INTO vRotaVersionId;
    
    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotaVersionId,'RotationVersion','Insert', NOW());

ELSEIF vRotaVersionExists = 1 THEN

	UPDATE AAU.RotaVersion SET
	RotaVersionName = prm_RotaVersionName,
	DefaultRotaVersion = prm_DefaultRotaVersion,
	IsDeleted = prm_Deleted,
	DeletedDate = IF(prm_Deleted = 1, vTimeNow, NULL)
    WHERE RotaVersionId = prm_RotaVersionId;
    
	SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotaVersionId,'RotationVersion','Update', NOW());

ELSE

	SELECT 2 INTO vSuccess;

END IF ;


    
	SELECT vRotaVersionId AS rotaVersionId, vSuccess AS success;
    
END $$

DELIMITER ;
