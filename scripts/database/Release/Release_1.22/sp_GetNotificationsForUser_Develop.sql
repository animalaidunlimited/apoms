DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetNotificationsForUser !!

-- CALL AAU.sp_GetNotificationsForUser('Jim',10,0)

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetNotificationsForUser(
IN prm_UserName VARCHAR(45),
IN prm_Start INT,
IN prm_Offset INT
)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 22/09/2022
Purpose: Used to retrieve notifications for a user
*/

DECLARE vTotalUnacknowledged INT;

SELECT COUNT(1) INTO vTotalUnacknowledged
FROM AAU.Notification n
INNER JOIN AAU.User nu ON nu.UserId = n.NotifiedUserId AND nu.UserName = prm_Username
WHERE n.Acknowledged IS NULL;

SELECT
JSON_MERGE_PRESERVE(
JSON_OBJECT("notifications",
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("patientId",n.PatientId),
JSON_OBJECT("notificationId",n.NotificationId),
JSON_OBJECT("notificationParentRecordId",n.NotificationParentRecordId),
JSON_OBJECT("tagNumber",n.TagNumber),
JSON_OBJECT("notificationText",n.NotificationText),
JSON_OBJECT("notificationTypeId",n.NotificationTypeId),
JSON_OBJECT("acknowledged",n.Acknowledged),
JSON_OBJECT("notificationRecordId",n.NotificationRecordId),
JSON_OBJECT("timestamp",n.TimeStamp))
)),
JSON_OBJECT("totalUnacknowledged",vTotalUnacknowledged) 
) Notifications
FROM 
(
SELECT
	COALESCE(p.PatientId, pmi.PatientId) AS `PatientId`,
	n.NotificationId,
    n.NotificationParentRecordId,
    n.NotificationTypeId,
	p.TagNumber,
	CONCAT(nbu.FirstName, nt.DisplayText, p.TagNumber) AS `NotificationText`,
	n.Acknowledged,
	n.TimeStamp,
	n.NotificationRecordId
FROM AAU.Notification n
INNER JOIN AAU.NotificationType nt ON nt.NotificationTypeId = n.NotificationTypeId
INNER JOIN AAU.User nbu ON nbu.UserId = n.NotifiedByUserId
INNER JOIN AAU.User nu ON nu.UserId = n.NotifiedUserId AND nu.UserName = prm_UserName
LEFT JOIN AAU.PatientMediaItem pmi ON pmi.PatientMediaItemId = n.NotificationParentRecordId AND pmi.IsDeleted = 0 AND n.NotificationTypeId IN (2,3)
LEFT JOIN AAU.Patient p ON (p.PatientId = n.NotificationParentRecordId AND p.IsDeleted = 0 AND n.NotificationTypeId = 1)
OR (p.PatientId = pmi.PatientId AND n.NotificationTypeId IN (2,3))
ORDER BY n.TimeStamp DESC
LIMIT prm_Start OFFSET prm_Offset
) n;

END$$