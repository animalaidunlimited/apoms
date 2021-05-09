DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_GetPatientMediaComments!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPatientMediaComments(IN prm_PatientMediaItemId INT)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 28/04/2020
Purpose: Used to update an existing PatientMediaItem record.


Created: Ankit Singh
Modified On: 04/05/2021
Purpose: removed comment column
*/
SELECT
	JSON_ARRAYAGG(
		JSON_OBJECT(
			"userId",pmc.UserId,
			"userColour",COALESCE(u.Colour,'#607d8b'),
			"userInitials",IF(u.Initials IS NULL, CONCAT(LEFT(u.Firstname,1), COALESCE(LEFT(u.Surname,1),'')), u.Initials),
			"userName",u.UserName,
			"comment",pmc.Comment,
			"timestamp",pmc.timestamp
		)
	) AS Result
FROM AAU.PatientMediaComments pmc 
LEFT JOIN AAU.User u ON u.UserId = pmc.UserId
WHERE pmc.PatientMediaItemId = prm_PatientMediaItemId;
END$$
DELIMITER ;
