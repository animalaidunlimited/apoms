DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_DeleteBrokenCase !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_DeleteBrokenCase( IN prm_BrokenCaseDetailsId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 22/03/2023
Purpose: Used to delete a broken case from the list

*/

DECLARE vSuccess INTEGER;

SET vSuccess = 0;

DELETE FROM AAU.BrokenCaseDetails WHERE BrokenCaseDetailsId = prm_BrokenCaseDetailsId AND Updated = 1;

SELECT ROW_COUNT() success;


END$$

