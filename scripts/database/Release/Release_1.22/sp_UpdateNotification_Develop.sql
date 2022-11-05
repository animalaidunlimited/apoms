DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateNotification !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateNotification(
IN prm_UserName VARCHAR(45),
IN prm_NotificationId INT,
IN prm_Acknowledged INT
)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 22/09/2022
Purpose: Used to update the acknowledged status of a notification
*/

DECLARE vOrganisationId INT;
DECLARE vTimeNow DATETIME;
DECLARE vNotificationExists INT;
DECLARE vSuccess INT;
DECLARE vTotalUnacknowledged INT;

SET vNotificationExists = 1;

SELECT CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vTimeNow
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId WHERE u.UserName = prm_Username;

SELECT COUNT(1) INTO vNotificationExists FROM AAU.Notification WHERE NotificationId = prm_NotificationId;

	IF ( vNotificationExists = 1) THEN

	UPDATE AAU.Notification SET
		Acknowledged = prm_Acknowledged,
		AcknowledgedDateTime = vTimeNow
	WHERE NotificationId = prm_NotificationId;

	SELECT 1 INTO vSuccess;
    
    SELECT COUNT(1) INTO vTotalUnacknowledged
	FROM AAU.Notification n
	INNER JOIN AAU.User nu ON nu.UserId = n.NotifiedUserId AND nu.UserName = 'jim'
    WHERE n.Acknowledged IS NULL;

	ELSE

	SELECT 2 INTO vSuccess;

	END IF;

SELECT vSuccess AS `success`, vTotalUnacknowledged AS `totalUnacknowledged`;

END$$

DELIMITER !