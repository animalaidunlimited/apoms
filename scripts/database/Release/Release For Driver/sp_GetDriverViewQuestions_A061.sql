DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetDriverViewQuestions !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetDriverViewQuestions(In prm_Username VARCHAR(45))
BEGIN

/*
CreatedDate:09/07/2021
CreatedBy: Arpit Trivedi
Purpose: To create the driver view form dynamically
*/

SELECT 
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT('actionStatus', ActionStatus),
JSON_OBJECT('subAction', SubAction),
JSON_OBJECT('formControlName', FormControlName),
JSON_OBJECT('type', FormControlType),
JSON_OBJECT('sortOrder', SortOrder))) questionList
FROM AAU.DriverViewQuestions;


END$$
DELIMITER ;
