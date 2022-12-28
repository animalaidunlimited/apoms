DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_DeleteUserById !!

-- CALL AAU.sp_GetUsersByIdRange('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_DeleteUserById(IN prm_UserId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 22/08/2018
Purpose: Used to delete a user by UserId

Modified By: Jim Mackenzie
Modified On: 22/12/2022
Modification: Changed to return a result set instead of an out parameter
*/

-- Check that the user actually exists first.

DECLARE vUserExists INT;
DECLARE vSuccess INT;

SET vSuccess = 0;

SELECT COUNT(1) INTO vUserExists FROM AAU.User WHERE UserId = prm_UserId;

IF vUserExists = 1 THEN

	UPDATE AAU.User SET IsDeleted = 1 WHERE UserId = prm_UserId;
    SELECT 1 INTO vSuccess;
ELSE 
	SELECT -1 INTO vSuccess;
END IF;

SELECT vSuccess AS `success`;

END$$
DELIMITER ;
