DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_MoveMissedVisits !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_MoveMissedVisits ()
BEGIN

/*
Created By: Jim Mackenzie
Created On: 30/04/2020
Purpose: Used to update all missed cases to tomorrow

Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Replacing Case with StreetTreatCase table
*/


UPDATE AAU.Visit v
INNER JOIN AAU.StreetTreatCase c ON c.StreetTreatCaseId = v.StreetTreatCaseId
SET v.Date = DATE_ADD( CURRENT_DATE(), INTERVAL 1 DAY)
WHERE c.StatusId = 1
AND v.StatusId = 1
AND Date < CURRENT_DATE();


END$$
DELIMITER ;
