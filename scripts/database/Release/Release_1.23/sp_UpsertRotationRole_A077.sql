DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertRotationRole!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertRotationRole(
		IN prm_Username VARCHAR(45),
		IN prm_RotationRoleId INT,
        IN prm_RotationAreaId INT,
        IN prm_RotationRole VARCHAR(45),
        IN prm_Colour VARCHAR(10),
        IN prm_StartTime TIME,
        IN prm_Endtime TIME,
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
    RotationAreaId,
	Colour,
	StartTime,
	EndTime,
	SortOrder,
	IsDeleted
)
VALUES(
	vOrganisationId,
	prm_RotationRole,
    prm_RotationAreaId,
    prm_Colour,
    prm_StartTime,
    prm_EndTime,
	prm_SortOrder,
    prm_Deleted
);

	SELECT LAST_INSERT_ID() INTO vRotationRoleId;
    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotationRoleId,'Rotation Role','Insert', NOW());
    
ELSEIF ( vRotationRoleIdExists = 1 ) THEN

UPDATE AAU.RotationRole SET
	OrganisationId = vOrganisationId,    
	RotationRole = prm_RotationRole,
    RotationAreaId = prm_RotationAreaId,
    StartTime = prm_StartTime,
    EndTime = prm_EndTime,
    Colour = prm_Colour,
    SortOrder = prm_SortOrder,    
	IsDeleted = prm_Deleted,
    DeletedDate = IF(prm_Deleted = 1, vTimeNow, null)
    WHERE RotationRoleId = prm_rotationRoleId;

    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotationRoleId,'Rotation Role','Update', NOW()); 
    
    ELSE
    
    SELECT 2 INTO vSuccess;

END IF;
    
	SELECT vRotationRoleId AS rotationRoleId, vSuccess AS success;
    
END$$

DELIMITER ;
