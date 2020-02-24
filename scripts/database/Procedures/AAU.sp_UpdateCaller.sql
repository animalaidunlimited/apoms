DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateCaller!!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateCaller(
									IN prm_CallerId INT,
									IN prm_Name VARCHAR(128),
									IN prm_PreferredName VARCHAR(128),
									IN prm_Number VARCHAR(128),
									IN prm_AlternativeNumber VARCHAR(128),
									IN prm_Email VARCHAR(128),
									IN prm_Address VARCHAR(512),
                                    IN prm_UserName VARCHAR(64),
									OUT prm_OutCallerId INT,
									OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to update a Caller.
*/
DECLARE vOrganisationId INT;

DECLARE vCallerExists INT;
SET vCallerExists = 0;

SELECT prm_CallerId INTO prm_OutCallerId;

SELECT COUNT(1) INTO vCallerExists FROM AAU.Caller WHERE CallerId <> prm_CallerId
AND Name = prm_Name
AND Number = prm_Number;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vCallerExists = 0 THEN

START TRANSACTION;

	UPDATE AAU.Caller SET
			Name              =	prm_Name,
			PreferredName     =	prm_PreferredName,
			Number            =	prm_Number,
			AlternativeNumber =	prm_AlternativeNumber,
			Email             =	prm_Email,
			Address           =	prm_Address
			WHERE CallerId = prm_CallerId;
   
COMMIT;         
            
    SELECT 1 INTO prm_Success;
    
    
    
    INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_UserName,prm_CallerId,'Caller','Update', NOW());

ELSEIF vCallerExists >= 1 THEN

	SELECT 2 INTO prm_Success;

ELSE

	SELECT 3 INTO prm_Success;
END IF;

END$$
DELIMITER ;
