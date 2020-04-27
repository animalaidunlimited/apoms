ALTER TABLE AAU.Rescuer ADD COLUMN Abbreviation CHAR(2) AFTER ImageURL;
ALTER TABLE AAU.Rescuer ADD COLUMN Colour CHAR(45) AFTER Abbreviation;


UPDATE `AAU`.`Rescuer` SET `Abbreviation` = 'BS' WHERE (`RescuerId` = '1');
UPDATE `AAU`.`Rescuer` SET `Abbreviation` = 'JD' WHERE (`RescuerId` = '2');
UPDATE `AAU`.`Rescuer` SET `Abbreviation` = 'KS' WHERE (`RescuerId` = '3');
UPDATE `AAU`.`Rescuer` SET `Abbreviation` = 'LS' WHERE (`RescuerId` = '4');
UPDATE `AAU`.`Rescuer` SET `Abbreviation` = 'KM' WHERE (`RescuerId` = '5');
UPDATE `AAU`.`Rescuer` SET `Abbreviation` = 'SF' WHERE (`RescuerId` = '7');

CREATE TABLE AAU.PatientCallOutcome(
PatientCallOutcomeId INT NOT NULL AUTO_INCREMENT,
OrganisationId int(11) NOT NULL,
PatientCallOutcome VARCHAR(64),
CreatedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
IsDeleted BOOLEAN NOT NULL DEFAULT 0,
DeletedDate DATETIME NULL,
PRIMARY KEY (`PatientCallOutcomeId`),
 CONSTRAINT `FK_PatientCallOutcomeOrganisationId_OrganisationOrganisationId` FOREIGN KEY (`OrganisationId`) REFERENCES `Organisation` (`OrganisationId`)
);

INSERT INTO AAU.PatientCallOutcome (OrganisationId, PatientCallOutcome, CreatedDate) VALUES
(1, 'Call complete', CURRENT_TIMESTAMP),
(2, 'Incorrect number/disconnected', CURRENT_TIMESTAMP),
(3, 'Refused to give information', CURRENT_TIMESTAMP),
(3, 'Already Called', CURRENT_TIMESTAMP);

CREATE TABLE AAU.CallType(
CallTypeId INT NOT NULL AUTO_INCREMENT,
OrganisationId INT NOT NULL,
CallType VARCHAR(64),
CreatedDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
IsDeleted BOOLEAN NOT NULL DEFAULT 0,
DeletedDate DATETIME NULL,
PRIMARY KEY (`CallTypeId`),
 CONSTRAINT `FK_CallTypeOrganisationId_OrganisationOrganisationId` FOREIGN KEY (`OrganisationId`) REFERENCES `Organisation` (`OrganisationId`)
);

INSERT INTO AAU.CallType (OrganisationId, CallType) VALUES
(1,'Thank you'),
(1,'Release request'),
(1,'Died call'),
(1,'Released call'),
(1,'Complainer update'),
(1,'Complainer information request');

CREATE TABLE AAU.PatientCall(
  `PatientCallId` int(11) NOT NULL AUTO_INCREMENT,
  `CallTypeId` int(11) NOT NULL,
  `OrganisationId` int(11) NOT NULL,
  `PatientId` int(11) NOT NULL,
  `CallerId` int(11) NOT NULL,
  `UserId` int(11) NOT NULL,
  `CallDateTime` datetime NULL,
  `PatientCallOutcomeId` INT NULL,
  `CallerHappy` TINYINT DEFAULT NULL,
  `Comments` VARCHAR(1000) NULL,
  `CreatedBy` INT NOT NULL,
  `CreatedDateTime` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`PatientCallId`),
  KEY `FK_PatientCallUserId_UserUserId_idx` (`UserId`),
  KEY `FK_PatientCallCallerId_CallerCallerId` (`CallerId`),
  KEY `FK_PatientCallPatientId_PatientPatientId` (`PatientId`),
  CONSTRAINT `FK_PatientCallCallerId_CallerCallerId` FOREIGN KEY (`CallerId`) REFERENCES `caller` (`callerid`),
  CONSTRAINT `FK_PatientCallPatientId_PatientPatientId` FOREIGN KEY (`PatientId`) REFERENCES `patient` (`patientid`),
  CONSTRAINT `FK_PatientCallUserId_UserUserId` FOREIGN KEY (`UserId`) REFERENCES `user` (`userid`),
  CONSTRAINT `FK_PatientCallCreatedBy_UserUserId` FOREIGN KEY (`CreatedBy`) REFERENCES `user` (`userid`),
  CONSTRAINT `FK_PatientCallOrganisationId_OrganisationOrganisationId` FOREIGN KEY (`OrganisationId`) REFERENCES `Organisation` (`OrganisationId`)
);

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCallTypes!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCallTypes(IN prm_username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT CallTypeId, CallType FROM AAU.CallType WHERE OrganisationId = vOrganisationId AND IsDeleted = false;

END$$
DELIMITER ;

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetPatientCallOutcomes!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetPatientCallOutcomes(IN prm_username VARCHAR(45))
BEGIN

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT PatientCallOutcomeId, PatientCallOutcome FROM AAU.PatientCallOutcome WHERE OrganisationId = vOrganisationId AND IsDeleted = false;

END$$
DELIMITER ;
