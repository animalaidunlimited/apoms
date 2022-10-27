DROP TABLE IF EXISTS `AAU`.`RotationRole`;
DROP TABLE IF EXISTS `AAU`.`RotaDayAssignment`;
DROP TABLE IF EXISTS `AAU`.`LeaveRequest`;
DROP TABLE IF EXISTS `AAU`.`RotaMatrix`;
DROP TABLE IF EXISTS `AAU`.`RotationPeriod`;
DROP TABLE IF EXISTS `AAU`.`RotationArea`;
DROP TABLE IF EXISTS `AAU`.`AreaShift`;
DROP TABLE IF EXISTS `AAU`.`RotaVersion`;
DROP TABLE IF EXISTS `AAU`.`Rota`;

ALTER TABLE `AAU`.`EditableDropdown`
ADD COLUMN `OrganisationId` INT NOT NULL AFTER `EditableDropdownId`,
ADD INDEX `FK_EditableDropdown_Organisation_OrganisationId_idx` (`OrganisationId` ASC) VISIBLE;

UPDATE `AAU`.`EditableDropdown` SET OrganisationId = 1;

ALTER TABLE `AAU`.`EditableDropdown`
ADD CONSTRAINT `FK_EditableDropdown_Organisation_OrganisationId`
  FOREIGN KEY (`OrganisationId`)
  REFERENCES `AAU`.`Organisation` (`OrganisationId`)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION;


CREATE TABLE `AAU`.`Rota` (
  `RotaId` INT NOT NULL AUTO_INCREMENT,
  `OrganisationId` INT NOT NULL,
  `RotaName` VARCHAR(64) NOT NULL,
  `DefaultRota` TINYINT NULL,
  `IsDeleted` TINYINT NULL DEFAULT 0,
  `DeletedDate` DATETIME NULL,
  `CreatedDate` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`RotaId`),
  INDEX `FK_Rota_Organisation_OrganisationId_idx` (`OrganisationId` ASC) VISIBLE,
  CONSTRAINT `FK_Rota_Organisation_OrganisationId`
    FOREIGN KEY (`OrganisationId`)
    REFERENCES `AAU`.`Organisation` (`OrganisationId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);   

CREATE TABLE `AAU`.`RotaVersion` (
  `RotaVersionId` INT NOT NULL AUTO_INCREMENT,
  `OrganisationId` INT NOT NULL,
  `RotaVersionName` VARCHAR(64) NOT NULL,
  `DefaultRotaVersion` TINYINT NULL,
  `RotaId` INT NOT NULL,
  `IsDeleted` TINYINT NULL DEFAULT 0,
  `DeletedDate` DATETIME NULL,
  `CreatedDate` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`RotaVersionId`),
  INDEX `FK_RotaVersion_Rota_RotaId_idx` (`RotaId` ASC) VISIBLE,
  CONSTRAINT `FK_RotaVersion_Rota_RotaId`
    FOREIGN KEY (`RotaId`)
    REFERENCES `AAU`.`Rota` (`RotaId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  INDEX `FK_RotaVersion_Organisation_OrganisationId_idx` (`OrganisationId` ASC) VISIBLE,
  CONSTRAINT `FK_RotaVersion_Organisation_OrganisationId`
    FOREIGN KEY (`OrganisationId`)
    REFERENCES `AAU`.`Organisation` (`OrganisationId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
    

    
CREATE TABLE `AAU`.`LeaveRequest` (
`LeaveRequestId` INTEGER AUTO_INCREMENT NOT NULL,
`OrganisationId` INT NOT NULL,
`DepartmentId` INTEGER NOT NULL,
`UserId` INTEGER NOT NULL,
`RequestDate` DATE NOT NULL,
`RequestReason` VARCHAR(128) NOT NULL,
`AdditionalInformation` TEXT NULL,
`EmergencyMedicalLeave` TINYINT NULL,
`LeaveStartDate` DATE NOT NULL,
`LeaveEndDate` DATE NOT NULL,
`Granted` TINYINT NULL,
`CommentReasonManagementOnly` TEXT NULL,
`DateApprovedRejected` DATETIME NULL,
`RecordedOnNoticeBoard` TINYINT NULL,
`LeaveTaken` TINYINT NULL,
`Comment` TEXT NULL,
`DocumentOrMedicalSlipProvided` TINYINT NULL,
PRIMARY KEY (`LeaveRequestId`),
  INDEX `FK_LeaveRequest_User_UserId_idx` (`UserId` ASC) VISIBLE,
  UNIQUE INDEX `RotationPeriodGUID_UNIQUE` (`LeaveRequestId` ASC) VISIBLE,
  CONSTRAINT `FK_LeaveRequest_User_UserId`
    FOREIGN KEY (`UserId`)
    REFERENCES `AAU`.`User` (`UserId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
INDEX `FK_LeaveRequest_Organisation_OrganisationId_idx` (`OrganisationId` ASC) VISIBLE,
  CONSTRAINT `FK_LeaveRequest_Organisation_OrganisationId`
    FOREIGN KEY (`OrganisationId`)
    REFERENCES `AAU`.`Organisation` (`OrganisationId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);
    
      
CREATE TABLE `AAU`.`RotationPeriod` (
  `RotationPeriodId` INT NOT NULL AUTO_INCREMENT,
  `RotationPeriodGUID` VARCHAR(128) NOT NULL,
  `RotaVersionId` INT NOT NULL,
  `StartDate` DATE NOT NULL,
  `EndDate` DATE NOT NULL,
  `Locked` TINYINT NOT NULL DEFAULT 0,
  `IsDeleted` TINYINT NOT NULL DEFAULT 0,
  `DeletedDate` DATETIME NULL,
  `CreatedDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`RotationPeriodId`),
  INDEX `FK_RotationPeriod_RotaVersion_RotaVersionId_idx` (`RotaVersionId` ASC) VISIBLE,
  UNIQUE INDEX `RotationPeriodGUID_UNIQUE` (`RotationPeriodGUID` ASC) VISIBLE,
  CONSTRAINT `FK_RotationPeriod_RotaVersion_RotaVersionId`
    FOREIGN KEY (`RotaVersionId`)
    REFERENCES `AAU`.`RotaVersion` (`RotaVersionId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
    
CREATE TABLE `AAU`.`RotationArea` (
  `RotationAreaId` INT NOT NULL AUTO_INCREMENT,
  `RotationAreaName`  VARCHAR(32) NOT NULL,
  `RotationAreaGUID` VARCHAR(128) NOT NULL,
  `RotaVersionId` INT NOT NULL,
  `Color` VARCHAR(10) NOT NULL,
  `IsDeleted` TINYINT NOT NULL DEFAULT 0,
  `DeletedDate` DATETIME NULL,
  `CreatedDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`RotationAreaId`),
  INDEX `FK_RotationArea_RotaVersion_RotaVersionId_idx` (`RotaVersionId` ASC) VISIBLE,
  UNIQUE INDEX `RotationAreaGUID_UNIQUE` (`RotationAreaGUID` ASC) VISIBLE,
  CONSTRAINT `FK_RotationArea_RotaVersion_RotaVersionId`
    FOREIGN KEY (`RotaVersionId`)
    REFERENCES `AAU`.`RotaVersion` (`RotaVersionId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
    
    
    
CREATE TABLE `AAU`.`AreaShift` (
  `AreaShiftId` INT NOT NULL AUTO_INCREMENT,  
  `RotaVersionId` INT NOT NULL,
  `AreaShiftGUID` VARCHAR(128) NOT NULL,
  `RotationAreaId` INT NOT NULL,
  `Sequence` INT NULL,
  `RoleId` INT NULL,
  `IsDeleted` TINYINT NOT NULL DEFAULT 0,
  `DeletedDate` DATETIME NULL,
  `CreatedDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`AreaShiftId`),
  UNIQUE INDEX `AreaShiftGUID_UNIQUE` (`AreaShiftGUID` ASC) VISIBLE,
  INDEX `FK_AreaShift_RotaVersion_RotaVersionId_idx` (`RotaVersionId` ASC) VISIBLE,
  CONSTRAINT `FK_AreaShift_RotaVersion_RotaVersionId`
    FOREIGN KEY (`RotaVersionId`)
    REFERENCES `AAU`.`RotaVersion` (`RotaVersionId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

CREATE TABLE `AAU`.`RotaMatrixItem` (
  `RotaMatrixItemId` INT NOT NULL AUTO_INCREMENT,
  `RotaVersionId` INT NOT NULL,
  `RotationPeriodGUID` VARCHAR(128) NOT NULL,
  `AreaShiftGUID` VARCHAR(128) NOT NULL,
  `UserId` INT NULL,
  `CreatedDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`RotaMatrixItemId`),
  INDEX `FK_RotationMatrix_RotationPeriod_RotationPeriodGUID_idx` (`RotationPeriodGUID` ASC) VISIBLE,
  INDEX `FK_RotationMatrix_RotaVersion_RotaVersionId_idx` (`RotaVersionId` ASC) VISIBLE,
  INDEX `FK_RotationMatrix_AreaShift_AreaShiftGUID_idx` (`AreaShiftGUID` ASC) VISIBLE,
  CONSTRAINT `FK_RotationMatrix_RotationPeriod_RotationPeriodGUID`
    FOREIGN KEY (`RotationPeriodGUID`)
    REFERENCES `AAU`.`RotationPeriod` (`RotationPeriodGUID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_RotationMatrix_RotaVersion_RotaVersionId`
    FOREIGN KEY (`RotaVersionId`)
    REFERENCES `AAU`.`RotaVersion` (`RotaVersionId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_RotationMatrix_AreaShift_AreaShiftGUID`
    FOREIGN KEY (`AreaShiftGUID`)
    REFERENCES `AAU`.`AreaShift` (`AreaShiftGUID`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
    
CREATE TABLE `AAU`.`RotaDayAssignment`(
`RotaDayId` INTEGER AUTO_INCREMENT NOT NULL,
`RotaDayDate` DATE NOT NULL,
`RotationPeriodId` INTEGER NOT NULL,
`AreaShiftId` INTEGER NOT NULL,
`UserId` INTEGER NULL,
`RotationUserId` INTEGER NOT NULL,
`LeaveRequestId` INTEGER NULL,
`IsDeleted` TINYINT NOT NULL DEFAULT 0,
`DeletedDate` DATETIME NULL,
`CreatedDate` DATETIME NULL,
PRIMARY KEY (`RotaDayId`),
INDEX `FK_RotaDayAssignment_User_UserId_idx` (`UserId` ASC) VISIBLE,
  CONSTRAINT `FK_RotaDayAssignment_User_UserId`
    FOREIGN KEY (`UserId`)
    REFERENCES `AAU`.`User` (`UserId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
INDEX `FK_RotaDayAssignment_User_RotationUserId_idx` (`RotationUserId` ASC) VISIBLE,
  CONSTRAINT `FK_RotaDayAssignment_User_RotationUserId`
    FOREIGN KEY (`RotationUserId`)
    REFERENCES `AAU`.`User` (`UserId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
INDEX `FK_RotaDayAssignment_RotationPeriod_RotationPeriodId_idx` (`RotationPeriodId` ASC) VISIBLE,
  CONSTRAINT `FK_RotaDayAssignment_RotationPeriod_RotationPeriodId`
    FOREIGN KEY (`RotationPeriodId`)
    REFERENCES `AAU`.`RotationPeriod` (`RotationPeriodId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
INDEX `FK_RotaDayAssignment_AreaShift_AreaShiftId_idx` (`AreaShiftId` ASC) VISIBLE,
  CONSTRAINT `FK_RotaDayAssignment_AreaShift_AreaShiftId`
    FOREIGN KEY (`AreaShiftId`)
    REFERENCES `AAU`.`AreaShift` (`AreaShiftId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
INDEX `FK_RotaDayAssignment_LeaveRequest_LeaveRequestId_idx` (`LeaveRequestId` ASC) VISIBLE,
  CONSTRAINT `FK_RotaDayAssignment_LeaveRequest_LeaveRequestId`
    FOREIGN KEY (`LeaveRequestId`)
    REFERENCES `AAU`.`LeaveRequest` (`LeaveRequestId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);


CREATE TABLE `AAU`.`RotationRole` (
  `RotationRoleId` INT NOT NULL AUTO_INCREMENT,
  `Role` VARCHAR(45) NOT NULL,
  `Colour` VARCHAR(16) NOT NULL,
  `OrganisationId` INT NOT NULL,
  `IsDeleted` TINYINT NOT NULL DEFAULT 0,
  `DeletedDate` DATETIME NULL,
  `CreatedDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`RotationRoleId`),
  INDEX `FK_RotationRole_Organisation_OrganisationId_idx` (`OrganisationId` ASC) VISIBLE,
  CONSTRAINT `FK_RotationRole_Organisation_OrganisationId`
    FOREIGN KEY (`OrganisationId`)
    REFERENCES `AAU`.`Organisation` (`OrganisationId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
    
    
/*
INSERT INTO `AAU`.`Rota` (`OrganisationId`,`RotaName`,`DefaultRota`) VALUES (1, 'Hospital Staff', 1), (1, 'Desk Staff', 0);
INSERT INTO `AAU`.`RotaVersion` (`OrganisationId`,`RotaVersionName`,`DefaultRotaVersion`, `RotaId`) VALUES
(1, 'Version 1', 0, 1), (1, 'Version 2', 1, 1),
(1, 'Desk Version MkI', 0, 2), (1, 'Desk Version MkII', 1, 2);
INSERT INTO `AAU`.`RotationRole` (Role, Colour, OrganisationId) VALUES ('N01','lightgreen',1),('N02','lightblue',1),('N03','lightcyan',1),
('HX1','lightpurple',1),('HX2','lightyellow',1),('HX3','lightsalmon',1);

INSERT INTO `AAU`.`LeaveRequest` (`DepartmentId`, `UserId`, `RequestDate`, `RequestReason`, `LeaveStartDate`, `LeaveEndDate`, `Granted`) VALUES ('1', '1', '2022-01-10', 'Family Trip', '2022-10-01', '2022-10-03', '1');
INSERT INTO `AAU`.`LeaveRequest` (`DepartmentId`, `UserId`, `RequestDate`, `RequestReason`, `LeaveStartDate`, `LeaveEndDate`, `Granted`) VALUES ('1', '4', '2022-10-03', 'Wedding', '2022-10-05', '2022-10-06', '1');
INSERT INTO `AAU`.`LeaveRequest` (`DepartmentId`, `UserId`, `RequestDate`, `RequestReason`, `LeaveStartDate`, `LeaveEndDate`, `Granted`) VALUES ('1', '6', '2022-10-03', 'Visit', '2022-10-09', '2022-10-14', '1');


*/
