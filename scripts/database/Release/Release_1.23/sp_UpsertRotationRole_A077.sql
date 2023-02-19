DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertRotationRole!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertRotationRole(
		IN prm_Username VARCHAR(45),
		IN prm_RotationRoleId INT,
        IN prm_RotationRole VARCHAR(45),
        IN prm_Colour VARCHAR(10),
		IN prm_SortOrder INT,        
        IN prm_Deleted TINYINT
)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 27/09/2022
Purpose: Procedure to add rotation Roles.
*/

DECLARE vSuccess INT;
DECLARE vRotationRoleId INT;
DECLARE vRotationRoleIdExists INT;
DECLARE vOrganisationId INT;
DECLARE vTimeNow DATETIME;

SET vRotationRoleId = prm_RotationRoleId;

SELECT u.OrganisationId, CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vOrganisationId, vTimeNow
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT COUNT(1) INTO vRotationRoleIdExists FROM AAU.RotationRole WHERE RotationRoleId = prm_RotationRoleId;

IF ( vRotationRoleIdExists = 0 ) THEN

INSERT INTO AAU.RotationRole(	
	OrganisationId,
	RotationRole,
	Colour,
	SortOrder,
	IsDeleted
)
VALUES(
	vOrganisationId,
	prm_RotationRole,
    prm_Colour,
	prm_SortOrder,
    prm_Deleted
);

	SELECT LAST_INSERT_ID() INTO vRotationRoleId;
    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotationRoleId,'Rotation Role','Insert', NOW());
    
ELSEIF ( vRotationRoleIdExists = 1  AND prm_RotationRoleId IS NOT NULL ) THEN

UPDATE AAU.RotationRole SET
	OrganisationId		= vOrganisationId,    
	RotationRole		= prm_RotationRole,
    Colour				= prm_Colour,
    SortOrder			= prm_SortOrder,    
	IsDeleted			= prm_Deleted,
    DeletedDate			= IF(prm_Deleted = 1, vTimeNow, null)
    WHERE RotationRoleId = prm_rotationRoleId;

    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotationRoleId,'Rotation Role','Update', NOW());
    
ELSEIF ( vRotationRoleIdExists = 1  AND prm_RotationRoleId IS NULL ) THEN

	SELECT 2 INTO vSuccess;
    
    ELSE
    
    SELECT 3 INTO vSuccess;

END IF;
    
	SELECT vRotationRoleId AS rotationRoleId, vSuccess AS success;
    
END$$

DELIMITER ;
