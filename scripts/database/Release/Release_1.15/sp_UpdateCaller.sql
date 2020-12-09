DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_UpdateCaller !!
DELIMITER $$
CREATE PROCEDURE `sp_UpdateCaller`(
									IN prm_Username VARCHAR(64),
									IN prm_CallerId INT,
									IN prm_Name VARCHAR(128),
									IN prm_PreferredName VARCHAR(128),
									IN prm_Number VARCHAR(128),
									IN prm_AlternativeNumber VARCHAR(128),
									IN prm_Email VARCHAR(128),
									IN prm_Address VARCHAR(512))
BEGIN
/* 
Created by: Arpit Trivedi
Created date: 02/12/20
Purpose: Used to update caller.
*/

DECLARE vCallerExists INT;
DECLARE vCallerId INT;
DECLARE preCallerId INT;
DECLARE vDetailsExists INT;
DECLARE vSuccess INT;
DECLARE isUpdated INT;
SET vDetailsExists = 0;
SET vCallerExists = 0;
SET vCallerId = 0;
SET vSuccess = 0;
SET isUpdated = 0;
SET preCallerId = 0;

SELECT COUNT(1) INTO vCallerExists FROM AAU.Caller WHERE CallerId = prm_CallerId AND Name = prm_Name AND Number = prm_Number;
SELECT COUNT(1) INTO vDetailsExists FROM AAU.Caller WHERE Name = prm_Name AND Number = prm_Number AND CallerId != prm_CallerId;

IF vCallerExists = 1 THEN
	UPDATE AAU.Caller SET 
			Name = prm_Name,
			PreferredName = prm_PreferredName,
			Number = prm_Number,
			AlternativeNumber = prm_AlternativeNumber,
			Email = prm_Email,
			Address = prm_Address
	WHERE CallerId = prm_CallerId;
    
    SELECT prm_CallerId, 1, 1 INTO vCallerId,vSuccess, isUpdated;
    
ELSEIF vDetailsExists = 1 THEN
	SELECT CallerId , 1, 1 INTO vCallerId, vSuccess, isUpdated  FROM AAU.Caller
    WHERE Name = prm_Name AND Number = prm_Number;
    
ELSE 
	SELECT 3 INTO vSuccess;    
END IF;

SELECT vCallerId, vSuccess , isUpdated;

END$$
DELIMITER ;
