DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_UpdateUserJobType !!
DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateUserJobType(IN prm_UserId INT,
										IN prm_JobTypeId INT)
BEGIN
/*
Created By: Arpit Trivedi
Created On: 28/10/2020
Purpose: To update the UserjobType Table data of the user.
*/

DECLARE success INT;

UPDATE AAU.UserJobType 
SET IsDeleted = TRUE ,DeletedDate = CURDATE()
WHERE UserId = prm_UserId AND JobTypeId = prm_JobTypeId;

SELECT 1 INTO success;

SELECT success;


END$$
DELIMITER ;