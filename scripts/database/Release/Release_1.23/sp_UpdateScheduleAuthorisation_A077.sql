DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateScheduleAuthorisation!!

-- CALL AAU.sp_UpsertRotationArea('Jim', NULL, 'A Kennel', 3, '#fffffff', 0)

-- SELECT COUNT(1) FROM AAU.RotationArea WHERE RotationArea = 'A Kennel' AND OrganisationId = 1 AND IsDeleted = 0;


DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateScheduleAuthorisation(
		IN prm_Username VARCHAR(45),
        IN prm_RotaDayAuthorisationId INT,
        IN prm_RotaDayDate DATE,        
        IN prm_ManagerAuthorisation JSON
)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 14/02/2023
Purpose: Procedure to update authorisation for a rota day.
*/

DECLARE vSuccess INT;
DECLARE vRotationAreaId INT;
DECLARE vRotaDayAuthorisationIdExists INT;
DECLARE vOrganisationId INT;
DECLARE vTimeNow DATETIME;

SELECT u.OrganisationId, CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vOrganisationId, vTimeNow
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT COUNT(1) INTO vRotaDayAuthorisationIdExists FROM AAU.RotaDayAuthorisation WHERE RotaDayAuthorisationId = prm_RotaDayAuthorisationId;

IF ( vRotaDayAuthorisationIdExists = 1 ) THEN

UPDATE AAU.RotaDayAuthorisation SET
	RotaDayDate				= prm_RotaDayDate,
    ManagerAuthorisation	= prm_ManagerAuthorisation
    WHERE RotaDayAuthorisationId = prm_RotaDayAuthorisationId;

    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,prm_RotaDayAuthorisationId,'Rota Day Authorisation','Update', vTimeNow); 

ELSE

SELECT 2 INTO vSuccess;

END IF;
    
	SELECT vSuccess AS success;
    
END$$

DELIMITER ;
