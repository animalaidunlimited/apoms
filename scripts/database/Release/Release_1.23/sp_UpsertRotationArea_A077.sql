DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertRotationArea!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertRotationArea(
		IN prm_Username VARCHAR(45),
		IN prm_RotationAreaId INT,
        IN prm_RotationArea VARCHAR(32),
		IN prm_SortOrder INT,
        IN prm_Colour VARCHAR(10),
        IN prm_Deleted TINYINT
)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 27/09/2022
Purpose: Procedure to add rotation areas.
*/

DECLARE vSuccess INT;
DECLARE vRotationAreaId INT;
DECLARE vRotationAreaIdExists INT;
DECLARE vOrganisationId INT;
DECLARE vTimeNow DATETIME;

SET vRotationAreaId = prm_RotationAreaId;

SELECT u.OrganisationId, CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vOrganisationId, vTimeNow
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT COUNT(1) INTO vRotationAreaIdExists FROM AAU.RotationArea WHERE RotationAreaId = prm_RotationAreaId;

IF ( vRotationAreaIdExists = 0 ) THEN

INSERT INTO AAU.RotationArea(
	OrganisationId,
	RotationArea,
    SortOrder,
    Colour,
	IsDeleted
)
VALUES(
	vOrganisationId,
	prm_RotationArea,
	prm_SortOrder,
    prm_Colour,
    prm_Deleted
);

	SELECT LAST_INSERT_ID() INTO vRotationAreaId;
    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotationAreaId,'Rotation Area','Insert', NOW());
    
ELSEIF ( vRotationAreaIdExists = 1 ) THEN

UPDATE AAU.RotationArea SET
	OrganisationId = vOrganisationId,
	RotationArea = prm_RotationArea,
    SortOrder = prm_SortOrder,
    Colour = prm_Colour,
	IsDeleted = prm_Deleted,
    DeletedDate = IF(prm_Deleted = 1, vTimeNow, null)
    WHERE RotationAreaId = prm_rotationAreaId;

    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotationAreaId,'Rotation Area','Update', NOW()); 
    
    ELSE
    
    SELECT 2 INTO vSuccess;

END IF;
    
	SELECT vRotationAreaId AS rotationAreaId, vSuccess AS success;
    
END$$

DELIMITER ;
