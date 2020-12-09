DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertCaller !!

DELIMITER $$

CREATE DEFINER=`root`@`localhost` PROCEDURE AAU.sp_InsertCaller(
IN prm_Username VARCHAR(64),
IN prm_Name VARCHAR(128),
IN prm_PreferredName VARCHAR(128),
IN prm_Number VARCHAR(128),
IN prm_AlternativeNumber VARCHAR(128),
IN prm_Email VARCHAR(128),
IN prm_Address VARCHAR(512)
)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to insert a new Caller.
*/
DECLARE vOrganisationId INT;
DECLARE vCallerId INT;
DECLARE isInserted INT;
DECLARE vCallerExists INT;
DECLARE Success INT;
SET vCallerExists = 0;
SET isInserted = 0;
SET vCallerId = 0;
SET Success = 0;

SELECT COUNT(1) INTO vCallerExists FROM AAU.Caller WHERE Name = prm_Name AND Number = prm_Number AND IsDeleted = 0;
SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vCallerExists = 0 THEN

START TRANSACTION;

	INSERT INTO AAU.Caller
		(
        OrganisationId,
		Name,
		PreferredName,
		Number,
		AlternativeNumber,
		Email,
		Address
		)
		VALUES
		(
        vOrganisationId,
		prm_Name,
		prm_PreferredName,
		prm_Number,
		prm_AlternativeNumber,
		prm_Email,
		prm_Address
		);
        
COMMIT;

	SELECT 1 INTO Success;
    SELECT LAST_INSERT_ID() INTO vCallerId;	
    SELECT 1 INTO isInserted;
    

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,vCallerId,'Caller','Insert', NOW());

ELSEIF vCallerExists >= 1 THEN

	SELECT 1 INTO Success;
    SELECT CallerId INTO vCallerId FROM AAU.Caller 
    WHERE Name = prm_Name AND Number = prm_Number;	
    SELECT 1 INTO isInserted;

ELSE

	SELECT 3 INTO Success;
END IF;

SELECT vCallerId, Success, isInserted;


END$$
DELIMITER ;
