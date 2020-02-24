DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertCaller!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertCaller(
IN prm_Username VARCHAR(64),
IN prm_Name VARCHAR(128),
IN prm_PreferredName VARCHAR(128),
IN prm_Number VARCHAR(128),
IN prm_AlternativeNumber VARCHAR(128),
IN prm_Email VARCHAR(128),
IN prm_Address VARCHAR(512),
OUT prm_CallerId INT,
OUT prm_Success INT
)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to insert a new Caller.
*/
DECLARE vOrganisationId INT;

DECLARE vCallerExists INT;
SET vCallerExists = 0;

SELECT COUNT(1) INTO vCallerExists FROM AAU.Caller WHERE Name = prm_Name AND Number = prm_Number;
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

	SELECT 1 INTO prm_Success;
    SELECT LAST_INSERT_ID() INTO prm_CallerId;	

	INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,prm_CallerId,'Caller','Insert', NOW());

ELSEIF vCallerExists >= 1 THEN

	SELECT 2 INTO prm_Success;

ELSE

	SELECT 3 INTO prm_Success;
END IF;




END$$
DELIMITER ;
