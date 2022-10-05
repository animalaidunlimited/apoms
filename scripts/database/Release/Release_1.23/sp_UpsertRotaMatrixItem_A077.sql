DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertRotaMatrixItem!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertRotaMatrixItem(
		IN prm_Username VARCHAR(45),
        IN prm_RotaVersionId INT,
        IN prm_AreaShiftGUID VARCHAR(128),
        IN prm_RotationPeriodGUID VARCHAR(128),        
        IN prm_UserId INT
)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 29/09/2022
Purpose: Procedure to add a Rota Matrix Item
*/

DECLARE vSuccess INT;
DECLARE vRotaMatrixItemId INT;
DECLARE vRotaItemExists INT;
DECLARE vTimeNow DATETIME;

SET vRotaItemExists = 0;
SET vRotaMatrixItemId = -1;

SELECT CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vTimeNow
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT RotaMatrixItemId, COUNT(1)  INTO vRotaMatrixItemId, vRotaItemExists FROM AAU.RotaMatrixItem
WHERE AreaShiftGUID = prm_AreaShiftGUID AND RotationPeriodGUID = prm_RotationPeriodGUID
GROUP BY RotaMatrixItemId;

IF vRotaItemExists = 0 THEN

INSERT INTO AAU.RotaMatrixItem(
	RotaVersionId,    
	RotationPeriodGUID,
	AreaShiftGUID,	
	UserId
)
VALUES(
	prm_RotaVersionId,    
	prm_RotationPeriodGUID,
	prm_AreaShiftGUID,	
	prm_UserId
);

	SELECT LAST_INSERT_ID() INTO vRotaMatrixItemId;
    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotaMatrixItemId,'RotaMatrix','Insert', NOW());

ELSEIF vRotaItemExists = 1 THEN

	UPDATE AAU.RotaMatrixItem SET
		UserId = prm_UserId
	WHERE AreaShiftGUID = prm_AreaShiftGUID AND RotationPeriodGUID = prm_RotationPeriodGUID;

	SELECT 1 INTO vSuccess;    

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotaMatrixItemId,'RotaMatrix','Update', NOW());
    
ELSE

SELECT 2 INTO vSuccess;    

END IF;
    
	SELECT vRotaMatrixItemId AS rotaMatrixItemId, vSuccess AS success;
    
END $$
DELIMITER ;
