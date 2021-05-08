DELIMITER !!
DROP procedure IF EXISTS AAU.sp_InsertPatientMediaComments!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertPatientMediaComments(
	IN prm_PatientMediaItemId INT,
    IN prm_Username TEXT,
    IN prm_Comment TEXT
)
BEGIN

DECLARE vOrganisationId INT;
DECLARE vUserId INT;
DECLARE vCommentExists INT DEFAULT 0;
DECLARE vSuccess INT;
DECLARE vCommentId INT;

SELECT UserId, OrganisationId INTO vUserId, vOrganisationId FROM AAU.User WHERE UserName = prm_Username;
SELECT COUNT(*) INTO vCommentExists FROM AAU.PatientMediaComments 
WHERE 
UserId = vUserId AND 
Comment = prm_Comment AND
PatientMediaItemId = prm_PatientMediaItemId;
IF vCommentExists = 0 THEN
INSERT INTO AAU.PatientMediaComments(
	UserId,
    Comment,
    PatientMediaItemId
) VALUES 
(
	vUserId,
    prm_Comment,
    prm_PatientMediaItemId
);

SELECT 1 INTO vSuccess;
SELECT LAST_INSERT_ID() INTO vCommentId;
INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_Username,vCommentId,'Media Comment','Insert', NOW());

	SELECT 2 INTO vSuccess;

ELSE

	SELECT 3 INTO vSuccess;
END IF;
SELECT vSuccess as success;
END$$
DELIMITER ;
