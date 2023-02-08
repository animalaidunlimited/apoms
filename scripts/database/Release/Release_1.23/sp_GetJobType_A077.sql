DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetJobType !!

-- CALL AAU.sp_GetJobType();

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetJobType()
BEGIN

/*
Created By: Arpit Trivedi
Created On: 27/10/2020
Purpose: To get the Job Type data for dropdown.

Created By: Jim Mackenzie
Created On: 08/02/2023
Purpose: Alter to remove the need for Organisation
*/

SELECT DISTINCT jt.JobTypeId , jt.Title
FROM AAU.JobType jt;

END$$


