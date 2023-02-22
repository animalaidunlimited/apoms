DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertRotationAreaPosition!!

-- CALL AAU.sp_UpsertRotationAreaPosition('Jim', 2, 1, 'Medical 2.1',2, '#fffffff', 0);

-- SELECT COUNT(1) FROM AAU.RotationAreaPosition WHERE RotationAreaPosition = 'A Kennel' AND OrganisationId = 1 AND IsDeleted = 0;

-- SELECT * FROM AAU.RotationAreaPosition;

-- SELECT * FROM AAU.Logging ORDER BY 1 DESC;

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertRotationAreaPosition(
		IN prm_Username VARCHAR(45),
		IN prm_RotationAreaPositionId INT,
        IN prm_RotationAreaId INT,
        IN prm_Position VARCHAR(32),
		IN prm_SortOrder INT,
        IN prm_Colour VARCHAR(10),
        IN prm_Deleted TINYINT
)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 12/02/2023
Purpose: Procedure to add rotation area positions.
*/

DECLARE vSuccess INT;
DECLARE vRotationAreaPositionId INT;
DECLARE vRotationAreaPositionIdExists INT;
DECLARE vOrganisationId INT;
DECLARE vTimeNow DATETIME;

SET vRotationAreaPositionId = prm_RotationAreaPositionId;

SELECT u.OrganisationId, CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vOrganisationId, vTimeNow
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT COUNT(1) INTO vRotationAreaPositionIdExists FROM AAU.RotationAreaPosition WHERE RotationAreaPositionId = prm_RotationAreaPositionId;

IF ( vRotationAreaPositionIdExists = 0 ) THEN

INSERT INTO AAU.RotationAreaPosition(
	OrganisationId,
    RotationAreaId,
	RotationAreaPosition,
    SortOrder,
    Colour,
	IsDeleted
)
VALUES(
	vOrganisationId,
    prm_RotationAreaId,
	prm_Position,
	prm_SortOrder,
    prm_Colour,
    prm_Deleted
);

	SELECT LAST_INSERT_ID() INTO vRotationAreaPositionId;
    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotationAreaPositionId,'Rotation Area','Insert', NOW());
    
ELSEIF ( vRotationAreaPositionIdExists = 1  AND prm_RotationAreaPositionId IS NOT NULL ) THEN

UPDATE AAU.RotationAreaPosition SET
	OrganisationId = vOrganisationId,
    RotationAreaId = prm_RotationAreaId,
	RotationAreaPosition = prm_Position,
    SortOrder = prm_SortOrder,
    Colour = prm_Colour,
	IsDeleted = prm_Deleted,
    DeletedDate = IF(prm_Deleted = 1, vTimeNow, null)
    WHERE RotationAreaPositionId = prm_RotationAreaPositionId;

    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotationAreaPositionId,'Rotation Area','Update', NOW()); 

ELSEIF ( vRotationAreaPositionIdExists = 1  AND prm_RotationAreaPositionId IS NULL ) THEN

SELECT 2 INTO vSuccess;

ELSE

SELECT 3 INTO vSuccess;

END IF;
    
	SELECT vRotationAreaPositionId AS RotationAreaPositionId, vSuccess AS success;
    
END$$

DELIMITER ;
