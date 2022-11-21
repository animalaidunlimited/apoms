DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateRotaDayAssignments !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateRotaDayAssignments( 	IN prm_UserName VARCHAR(45),
													IN prm_rotaDayId INTEGER,
                                                    IN prm_userId INTEGER,
													IN prm_actualShiftStartTime TIME,
													IN prm_actualShiftEndTime TIME,
													IN prm_notes VARCHAR(1024))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 16/11/2022
Purpose: Update an assignment

*/

DECLARE vRotaDayExists INT;
DECLARE vSuccess INT;

SET vRotaDayExists = 0;
SET vSuccess = 0;

	SELECT COUNT(1) INTO vRotaDayExists FROM AAU.RotaDayAssignment WHERE RotaDayId = prm_rotaDayId;
    
    IF(vRotaDayExists = 1) THEN

	UPDATE AAU.RotaDayAssignment SET
		UserId = prm_userId,
		ActualShiftStartTime = prm_actualShiftStartTime,
		ActualShiftEndTime = prm_actualShiftEndTime,
		Notes = prm_notes
	WHERE RotaDayId = prm_rotaDayId;
    
    SELECT 1 INTO vSuccess;
    
    ELSE
    
    SELECT 2 INTO vSuccess; 
    
    END IF;
    
    SELECT vSuccess AS `success`;
    

END$$