DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertRotationRoleShiftSegment!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertRotationRoleShiftSegment(
										IN prm_Username VARCHAR(45),        
										IN prm_RotationRoleShiftSegmentId INT,
										IN prm_RotationRoleId INT,
										IN prm_StartTime TIME,
										IN prm_EndTime TIME,
										IN prm_nextDay TINYINT,
										IN prm_ShiftSegmentTypeId INT,
                                        IN prm_IsDeleted TINYINT
)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 20/12/2022
Purpose: Procedure to add rotation role shift segments.
*/

DECLARE vSuccess INT;
DECLARE vRotationRoleShiftSegmentId INT;
DECLARE vRotationRoleShiftSegmentExists INT;
DECLARE vOrganisationId INT;
DECLARE vTimeNow DATETIME;

SET vRotationRoleShiftSegmentId = prm_RotationRoleShiftSegmentId;

SELECT u.OrganisationId, CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vOrganisationId, vTimeNow
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT COUNT(1) INTO vRotationRoleShiftSegmentExists FROM AAU.RotationRoleShiftSegment WHERE RotationRoleShiftSegmentId = prm_RotationRoleShiftSegmentId AND IsDeleted = 0;

IF ( vRotationRoleShiftSegmentExists = 0 ) THEN

INSERT INTO AAU.RotationRoleShiftSegment(	
	RotationRoleId,
	OrganisationId,
	StartTime,
	EndTime,
	nextDay,
	ShiftSegmentTypeId,
	IsDeleted
)
VALUES(
	prm_RotationRoleId,
	vOrganisationId,
	prm_StartTime,
	prm_EndTime,
	prm_nextDay,
	prm_ShiftSegmentTypeId,
	prm_IsDeleted
);

	SELECT LAST_INSERT_ID() INTO vRotationRoleShiftSegmentId;
    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotationRoleShiftSegmentId,'Rotation Role Shift Segment','Insert', NOW());
    
ELSEIF ( vRotationRoleShiftSegmentExists = 1  AND prm_RotationRoleShiftSegmentId IS NOT NULL ) THEN

UPDATE AAU.RotationRoleShiftSegment SET  
 	StartTime			= prm_StartTime,
	EndTime				= prm_EndTime,
	nextDay				= prm_nextDay,
	ShiftSegmentTypeId 	= prm_ShiftSegmentTypeId,
	IsDeleted			= prm_IsDeleted,
    DeletedDate			= IF(prm_IsDeleted = 1, vTimeNow, null)
    WHERE RotationRoleShiftSegmentId = prm_RotationRoleShiftSegmentId;

    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotationRoleShiftSegmentId,'Rotation Role Shift Segment','Update', NOW());
    
ELSEIF ( vRotationRoleShiftSegmentExists = 1  AND prm_RotationRoleShiftSegmentId IS NULL ) THEN

	SELECT 2 INTO vSuccess;
    
    ELSE
    
    SELECT 3 INTO vSuccess;

END IF;
    
	SELECT vRotationRoleShiftSegmentId AS rotationRoleShiftSegmentId, vSuccess AS success;
    
END$$

DELIMITER ;
