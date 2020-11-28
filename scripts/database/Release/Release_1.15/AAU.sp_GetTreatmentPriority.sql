DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_GetTreatmentPriority;!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetTreatmentPriority ()
BEGIN

SELECT PriorityId, Priority from AAU.Priority;
END$$

