DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertComment !!

DELIMITER $$

CREATE  PROCEDURE AAU.sp_InsertComment(
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

SELECT vSuccess as success, vCommentId AS commentId;

END