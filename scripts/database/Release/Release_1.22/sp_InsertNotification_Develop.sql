DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertNotification !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertNotification(
IN prm_UserName VARCHAR(45),
IN prm_NotifiedUserId  INT,
IN prm_NotificationTypeId INT,
IN prm_NotificationParentRecordId INT,
IN prm_NotificationRecordId INT
)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 22/09/2022
Purpose: Used to return insert notifications for users. We're going to disabled the front end from inserting duplicate records because
         users should be able to put multiple notifications on multiple comments in the same record type. Like @User1 could mention @User2 many times 
         in a comment thread about a patient.
         
         NotificationRecordId: This is the place where the user was tagged. So this could be a patient comment Id or it could be a patient image comment id;
         
*/

DECLARE vOrganisationId INT;
DECLARE vNotifiedByUserId INT;
DECLARE vTimeNow DATETIME;
DECLARE vNotificationExists INT;
DECLARE vNotificationId INT;
DECLARE vSuccess INT;

SELECT o.OrganisationId, CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset), u.UserId INTO vOrganisationId, vTimeNow, vNotifiedByUserId
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId WHERE u.UserName = prm_Username;

SELECT COUNT(1) INTO vNotificationExists FROM AAU.Notification WHERE NotifiedByUserId = vNotifiedByUserId AND
																	 NotifiedUserId = prm_NotifiedUserId AND
                                                                     NotificationRecordId = prm_NotificationRecordId;
IF vNotificationExists = 0 THEN

INSERT INTO AAU.Notification (
	OrganisationId,
	NotifiedByUserId,
	NotifiedUserId,
	NotificationTypeId,
    NotificationParentRecordId,
	NotificationRecordId,
	Timestamp
)
VALUES
(
	vOrganisationId,
	vNotifiedByUserId,
	prm_NotifiedUserId,
	prm_NotificationTypeId,
    prm_NotificationParentRecordId,
	prm_NotificationRecordId,
	vTimeNow
);

SELECT LAST_INSERT_ID() INTO vNotificationId;

SELECT 1 INTO vSuccess;

ELSE

SELECT 2 INTO vSuccess;

END IF;

SELECT vSuccess AS `success`, vNotificationId AS NotificationId;

END$$

DELIMITER !