DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCensusByTagNumber !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCensusByTagNumber(IN prm_UserName VARCHAR(45), IN prm_TagNumber VARCHAR(45))
BEGIN

/*
Created By: Arpit Trivedi
Created On: 10/08/2020
Purpose: Fetches census data for census table in hospital manager tab
*/

SELECT
JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE
		(
			JSON_OBJECT("date" ,tl.InDate),
			JSON_OBJECT("area" ,ta.TreatmentArea),
			JSON_OBJECT("action" , "Moved in"),
			JSON_OBJECT("days" , DATEDIFF(IFNULL(OutDate, CURDATE()), InDate)),
			JSON_OBJECT("order" , tl.TreatmentListId)
		)
) AS Census
FROM AAU.TreatmentList tl
INNER JOIN AAU.Patient p ON p.PatientId = tl.PatientId AND p.TagNumber = prm_TagNumber
INNER JOIN AAU.TreatmentArea ta ON ta.TreatmentAreaId = tl.InTreatmentAreaId;

END$$
DELIMITER ;
