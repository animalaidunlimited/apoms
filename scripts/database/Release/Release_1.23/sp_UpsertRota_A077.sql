DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertRota!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertRota(
		IN prm_Username VARCHAR(45),
		IN prm_RotaId INT,
		IN prm_RotaName VARCHAR(64),
        IN prm_DefaultRota TINYINT,
        IN prm_Deleted TINYINT
)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 27/09/2022
Purpose: Procedure to add rota
*/

DECLARE vSuccess INT;
DECLARE vRotaId INT;
DECLARE vRotaExists INT;
DECLARE vOrganisationId INT;
DECLARE vTimeNow DATETIME;

SET vRotaId = prm_RotaId;

SELECT u.OrganisationId, CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vOrganisationId, vTimeNow
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT COUNT(1) INTO vRotaExists FROM AAU.Rota WHERE RotaId = prm_RotaId;

IF(prm_DefaultRota = 1) THEN

UPDATE AAU.Rota SET DefaultRota = 0 WHERE DefaultRota = 1;

END IF;

IF vRotaExists = 0 THEN

INSERT INTO AAU.Rota(
	OrganisationId,
	RotaName,
	DefaultRota
)
VALUES(
	vOrganisationId,
	prm_RotaName,
	prm_DefaultRota
);

	SELECT LAST_INSERT_ID() INTO vRotaId;
    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotaId,'Rota','Insert', NOW());

ELSEIF vRotaExists = 1 THEN

	UPDATE AAU.Rota SET
	RotaName = prm_RotaName,
	DefaultRota = prm_DefaultRota,
	IsDeleted = prm_Deleted,
	DeletedDate = IF(prm_Deleted = 1, vTimeNow, NULL)
	WHERE RotaId = prm_rotaId;

	SELECT 1 INTO vSuccess;    

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotaId,'Rota','Update', NOW());
    
ELSE

SELECT 2 INTO vSuccess;    

END IF;
    
	SELECT vRotaId AS rotaId, vSuccess AS success;
    
END $$

DELIMITER ;
