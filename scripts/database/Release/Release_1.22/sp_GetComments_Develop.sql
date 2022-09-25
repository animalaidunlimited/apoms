DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetComments !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetComments(IN prm_ParentRecordId INT, IN prm_ParentRecordType VARCHAR(32))
BEGIN
/*
Created By: Jim Mackenzie
Created On: 28/04/2020
Purpose: Used to update an existing PatientMediaItem record.

Modified By: Ankit Singh
Modified On: 04/05/2021
Purpose: removed comment column

Modified By: Jim Mackenzie
Modified On: 21/09/2022
Purpose: Made generic to handle many comment types

*/
SELECT
	JSON_ARRAYAGG(
		JSON_OBJECT(
			"userId",c.UserId,
            "commentId",c.CommentId,
			"userColour",COALESCE(u.Colour,'#607d8b'),
			"userInitials",IF(u.Initials IS NULL, CONCAT(LEFT(u.Firstname,1), COALESCE(LEFT(u.Surname,1),'')), u.Initials),
			"userName",u.UserName,
			"comment",c.Comment,
			"timestamp",c.timestamp
		)
	) AS Result
FROM AAU.Comment c
LEFT JOIN AAU.User u ON u.UserId = c.UserId
WHERE c.ParentRecordId = prm_ParentRecordId
AND c.ParentRecordType = prm_ParentRecordType;
END