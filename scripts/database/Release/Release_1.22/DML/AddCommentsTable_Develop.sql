DROP TABLE IF EXISTS AAU.NotificationType;

CREATE TABLE AAU.NotificationType
(
`NotificationTypeId` int NOT NULL AUTO_INCREMENT,
`NotificationType` VARCHAR(100),
`DisplayText` VARCHAR(100),
PRIMARY KEY (`NotificationTypeId`)
);

INSERT INTO AAU.NotificationType (NotificationType, DisplayText) VALUES ('Patient Comment', ' tagged you in a comment on patient '),
('Patient Image', ' tagged you in a comment on a patient image '),
('Patient Video', ' tagged you in a comment on a patient video ');

DROP TABLE IF EXISTS AAU.Notification;

CREATE TABLE AAU.Notification (
  `NotificationId` int NOT NULL AUTO_INCREMENT,
  `OrganisationId` int NOT NULL,
  `NotifiedByUserId` int NOT NULL,
  `NotifiedUserId` int NOT NULL,
  `NotificationTypeId` int NOT NULL,
  `NotificationParentRecordId` int NOT NULL,
  `NotificationRecordId` int NOT NULL,
  `Acknowledged` tinyint DEFAULT NULL,
  `AcknowledgedDateTime` datetime DEFAULT NULL,
  `Timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `IsDeleted` int NOT NULL DEFAULT '0',
  `DeletedDate` datetime DEFAULT NULL,
  PRIMARY KEY (`NotificationId`),
  KEY `IX_Notification_OrganisationId_idx` (`OrganisationId`),
  KEY `IX_Notification_NotifiedByUserId` (`NotifiedByUserId`),
  KEY `IX_Notification_NotifiedUserId` (`NotifiedUserId`),
  KEY `IX_Notification_NotificationTypeId` (`NotificationTypeId`),
  CONSTRAINT `FK_Notification_NotifiedByUserId` FOREIGN KEY (`NotifiedByUserId`) REFERENCES `AAU`.`User` (`UserId`),
  CONSTRAINT `FK_Notification_NotificationTypeId` FOREIGN KEY (`NotificationTypeId`) REFERENCES `AAU`.`NotificationType` (`NotificationTypeId`),
  CONSTRAINT `FK_Notification_NotifiedUserId` FOREIGN KEY (`NotifiedUserId`) REFERENCES `AAU`.`User` (`UserId`),
  CONSTRAINT `FK_Notification_OrganisationId` FOREIGN KEY (`OrganisationId`) REFERENCES `AAU`.`Organisation` (`OrganisationId`)
  );
  
