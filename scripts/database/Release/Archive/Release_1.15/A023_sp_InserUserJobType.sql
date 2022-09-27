DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_InsertUserJobType !!
DELIMITER $$

CREATE PROCEDURE AAU.sp_InsertUserJobType(
											IN prm_UserId INT,
											IN prm_JobTypeId INT)
BEGIN

/*
Created By: Arpit Trivedi
Created On: 27/10/2020
Purpose: To insert the UserjobType Table data of the new user.
*/
DECLARE success INT;

INSERT INTO AAU.UserJobType (
UserId , 
JobTypeId
)
VALUES (
prm_UserId , 
prm_JobTypeId
);

SELECT 1 INTO success;

SELECT success;

END$$
DELIMITER ;