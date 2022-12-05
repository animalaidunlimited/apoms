DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertAreaShift!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertAreaShift(
		IN prm_Username VARCHAR(45),
		IN prm_AreaShiftId INT,
        IN prm_AreaShiftGUID VARCHAR(128),
        IN prm_RotaVersionId INT,
        IN prm_Sequence INT,
        IN prm_Colour VARCHAR(20),
        IN prm_RotationRoleId INT,
        IN prm_Deleted TINYINT
)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 29/09/2022
Purpose: Procedure to add an Area Shift
*/

DECLARE vSuccess INT;
DECLARE vAreaShiftId INT;
DECLARE vAreaShiftExists INT;
DECLARE vTimeNow DATETIME;

SET vAreaShiftId = prm_AreaShiftId;

SELECT CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vTimeNow
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT COUNT(1) INTO vAreaShiftExists FROM AAU.AreaShift WHERE AreaShiftGUID = prm_AreaShiftGUID;

IF vAreaShiftExists = 0 THEN

INSERT INTO AAU.AreaShift(
	AreaShiftGUID,
	RotaVersionId,    
	Sequence,
    Colour,
    RotationRoleId
)
VALUES(
	prm_AreaShiftGUID,
	prm_RotaVersionId,
    prm_Sequence,
    prm_Colour,
    prm_RotationRoleId
);

	SELECT LAST_INSERT_ID() INTO vAreaShiftId;
    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vAreaShiftId,'AreaShift','Insert', NOW());

ELSEIF vAreaShiftExists = 1 THEN

	UPDATE AAU.AreaShift SET
		Sequence = prm_Sequence,
        Colour = prm_Colour,
		RotationRoleId = prm_RotationRoleId,
		IsDeleted = prm_Deleted,
		DeletedDate = IF(prm_Deleted = 1, vTimeNow, NULL)
	WHERE AreaShiftId = prm_AreaShiftId;

	SELECT 1 INTO vSuccess;    

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vAreaShiftId,'AreaShift','Update', NOW());
    
ELSE

SELECT 2 INTO vSuccess;    

END IF;
    
	SELECT vAreaShiftId AS areaShiftId, vSuccess AS success;
    
END $$

DELIMITER ;
