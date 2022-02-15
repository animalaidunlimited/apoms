DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateUserPreferences !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateUserPreferences(IN prm_UserId INT,
                                        IN prm_Preferences JSON
										)
BEGIN                                    

/*
Created By: Jim Mackenzie
Created On: 22/08/2018
Purpose: Used to update a user's preferences
*/

DECLARE vUserCount INT;
DECLARE vUpdateSuccess INT;

SET vUserCount = 0;
SET vUpdateSuccess = 0;

-- Check that the user exists
SELECT COUNT(1) INTO vUserCount FROM AAU.User WHERE UserId = prm_UserId;

IF vUserCount = 1  THEN

	UPDATE AAU.User
		SET	Preferences = prm_Preferences
	WHERE UserId = prm_UserId;

SELECT 1 INTO vUpdateSuccess; -- User update OK.

ELSEIF vUserCount = 0 THEN

SELECT 2 INTO vUpdateSuccess; -- User Doesn't exist

ELSEIF vUserCount > 1 THEN

SELECT 3 INTO vUpdateSuccess; -- Multiple records, we have duplicates

ELSE

SELECT 4 INTO vUpdateSuccess; -- Return misc 

END IF;

SELECT vUpdateSuccess as success;



END$$
DELIMITER ;
