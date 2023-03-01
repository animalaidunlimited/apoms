DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertRotationPeriod!!


-- CALL AAU.sp_UpsertRotationPeriod('Jim',  9,  'f2f387f2-da33-9e76-5e0d-c2f3e29906c5',  5,  'Week 146',  '2023-02-13',  '2023-02-19',  false,  0);

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertRotationPeriod(
		IN prm_Username VARCHAR(45),
		IN prm_RotationPeriodId INT,
        IN prm_RotationPeriodGUID VARCHAR(128),
        IN prm_RotaVersionId INT,
        IN prm_Name VARCHAR(128),
        IN prm_StartDate DATE,
        IN prm_EndDate DATE,
        IN prm_Locked TINYINT,   
        IN prm_Deleted TINYINT
)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 29/09/2022
Purpose: Procedure to add rotationPeriod
*/

DECLARE vSuccess INT;
DECLARE vRotationPeriodExists INT;
DECLARE vTimeNow DATETIME;
DECLARE vRotationPeriodId INT;
DECLARE vOverlapsExisting INT;

SET vRotationPeriodExists = 0;
SET vOverlapsExisting = 0;
SET vRotationPeriodId = prm_RotationPeriodId;

SELECT CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vTimeNow
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

-- SELECT COUNT(1) INTO vRotationPeriodExists FROM AAU.RotationPeriod WHERE RotaVersionId = prm_RotaVersionId AND StartDate <= prm_EndDate AND EndDate >= prm_StartDate ;
SELECT COUNT(1) INTO vRotationPeriodExists FROM AAU.RotationPeriod WHERE RotationPeriodGUID = prm_RotationPeriodGUID;


SELECT COUNT(1) INTO vOverlapsExisting FROM AAU.RotationPeriod WHERE RotationPeriodGUID != prm_RotationPeriodGUID AND RotaVersionId = prm_RotaVersionId AND StartDate <= prm_EndDate AND EndDate >= prm_StartDate ;

IF vRotationPeriodExists = 0 AND vOverlapsExisting = 0 THEN

INSERT INTO AAU.RotationPeriod(
	RotationPeriodGUID,
	RotaVersionId,
    `Name`,
	StartDate,
    EndDate
)
VALUES(
	prm_RotationPeriodGUID,
	prm_RotaVersionId,
    prm_Name,
    prm_StartDate,
    prm_EndDate
);

	SELECT LAST_INSERT_ID() INTO vRotationPeriodId;
    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotationPeriodId,'RotationPeriod','Insert', NOW());

ELSEIF vRotationPeriodExists = 1 AND vOverlapsExisting = 0 THEN

	UPDATE AAU.RotationPeriod SET
		`Name`		= prm_Name,
		StartDate	= prm_StartDate,
		EndDate		= prm_EndDate,
        `Locked`	= prm_Locked,
		IsDeleted	= prm_Deleted,
		DeletedDate = IF(prm_Deleted = 1, vTimeNow, NULL)         
	WHERE RotationPeriodId = vRotationPeriodId;

	SELECT 1 INTO vSuccess;    

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotationPeriodId,'RotationPeriod','Update', NOW());
    
ELSEIF vOverlapsExisting <> 0 THEN

SELECT 2 INTO vSuccess;

ELSE

SELECT 3 INTO vSuccess;

END IF;
    
	SELECT vRotationPeriodId AS rotationPeriodId, vSuccess AS success;
    
END $$

DELIMITER ;
