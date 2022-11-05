ALTER TABLE `AAU`.`PatientMediaComments` 
DROP FOREIGN KEY `FK_PMCommentsPatientMediaItemId_PMItemPatientMediaItemId`;

ALTER TABLE `AAU`.`PatientMediaComments` 
ADD COLUMN `ParentRecordType` VARCHAR(32) NULL AFTER `ParentRecordId`,
CHANGE COLUMN `PatientMediaItemId` `ParentRecordId` INT(11) NULL DEFAULT NULL , RENAME TO  `AAU`.`Comment` ;


DELIMITER $$

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientMediaComments$$
DROP PROCEDURE IF EXISTS AAU.sp_GetComments$$

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
END$$
DELIMITER ;

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertPatientMediaComments !!
DROP PROCEDURE IF EXISTS AAU.sp_InsertComment !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertComment(
	IN prm_Username VARCHAR(45),
	IN prm_ParentRecordId INT,
    IN prm_ParentRecordType VARCHAR(32),
    IN prm_Comment TEXT
)
BEGIN

DECLARE vOrganisationId INT;
DECLARE vUserId INT;
DECLARE vCommentExists INT DEFAULT 0;
DECLARE vSuccess INT;
DECLARE vCommentId INT;
DECLARE vTimeNow DATETIME;

SELECT u.UserId, o.OrganisationId, CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vUserId, vOrganisationId, vTimeNow
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId WHERE u.UserName = prm_Username;

SELECT COUNT(*) INTO vCommentExists
FROM AAU.Comment
WHERE UserId = vUserId AND
Comment = prm_Comment AND
ParentRecordId = prm_ParentRecordId AND
ParentRecordType = prm_ParentRecordType;

IF vCommentExists = 0 THEN
INSERT INTO AAU.Comment(
	UserId,
    Comment,
    ParentRecordId,
    ParentRecordType,
    Timestamp
) VALUES
(
	vUserId,
    prm_Comment,
    prm_ParentRecordId,
    prm_ParentRecordType,
    vTimeNow
);

SELECT 1 INTO vSuccess;

SELECT LAST_INSERT_ID() INTO vCommentId;

INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,vCommentId,'Comment',CONCAT('Inserting ', prm_ParentRecordType), NOW());
    
ELSE

	SELECT 2 INTO vSuccess;
    
END IF;

SELECT vSuccess as success;

END$$
DELIMITER ;

