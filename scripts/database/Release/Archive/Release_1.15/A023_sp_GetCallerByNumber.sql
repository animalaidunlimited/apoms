DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCallerByNumber !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCallerByNumber (IN prm_Number VARCHAR(45))
BEGIN
/*
Created By: Jim Mackenzie
Created On: 24/02/2020
Purpose: Used to return a Caller by Number.
*/

SELECT 
-- c.CallerId, 
c.Name, c.Number, c.AlternativeNumber
FROM AAU.Caller c
WHERE Number LIKE CONCAT(prm_Number, '%')
LIMIT 10;

END$$
DELIMITER ;
