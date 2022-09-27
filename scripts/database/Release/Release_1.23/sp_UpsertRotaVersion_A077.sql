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

SET vRotaVersionId = prm_RotaVersionId;

SELECT u.OrganisationId, CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vOrganisationId, vTimeNow
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

IF(prm_DefaultRotaVersion = 1) THEN

UPDATE AAU.Rota SET DefaultRotaVersion = 0 WHERE DefaultRotaVersion = 1 AND RotaId = prm_RotaId;

END IF;

INSERT INTO AAU.RotaVersion(
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
) ON DUPLICATE KEY UPDATE
RotaVersionName = prm_RotaVersionName,
DefaultRotaVersion = prm_DefaultRotaVersion,
IsDeleted = prm_Deleted,
DeletedDate = IF(prm_Deleted = 1, vTimeNow, NULL);

	SELECT 1 INTO vSuccess;
    SELECT LAST_INSERT_ID() INTO vRotaVersionId;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotaVersionId,'Rota version save','Upsert', NOW());
    
	SELECT vRotaVersionId AS rotaVersionId, vSuccess AS success;
    
END $$
DELIMITER ;
