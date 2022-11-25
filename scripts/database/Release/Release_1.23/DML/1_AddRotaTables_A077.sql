DROP TABLE IF EXISTS `AAU.`.`Department`;
DROP TABLE IF EXISTS `AAU`.`RotaMatrixItem`;
DROP TABLE IF EXISTS `AAU`.`RotaDayAssignment`;
DROP TABLE IF EXISTS `AAU`.`AreaShift`;
DROP TABLE IF EXISTS `AAU`.`RotationRole`;
DROP TABLE IF EXISTS `AAU`.`LeaveRequest`;
DROP TABLE IF EXISTS `AAU`.`LeaveRequestReason`;
DROP TABLE IF EXISTS `AAU`.`RotaRotationArea`;
DROP TABLE IF EXISTS `AAU`.`RotationArea`;
DROP TABLE IF EXISTS `AAU`.`RotationPeriod`;
DROP TABLE IF EXISTS `AAU`.`AreaShift`;
DROP TABLE IF EXISTS `AAU`.`RotaVersion`;
DROP TABLE IF EXISTS `AAU`.`Rota`;

CREATE TABLE `AAU`.`Department` (
`DepartmentId` INTEGER AUTO_INCREMENT NOT NULL,
`OrganisationId` INTEGER NOT NULL,
`Department` VARCHAR(64) NOT NULL,
`Colour` VARCHAR(10) NULL,
`SortOrder` INTEGER NULL,
`IsDeleted` TINYINT NOT NULL DEFAULT 0,
`DeletedDate` DATETIME NULL,
`CreatedDate` DATETIME DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (`DepartmentId`),
  INDEX `FK_DepartmentId_Organisation_OrganisationId_idx` (`OrganisationId` ASC) VISIBLE,
  CONSTRAINT `FK_DepartmentId_Organisation_OrganisationId`
    FOREIGN KEY (`OrganisationId`)
    REFERENCES `AAU`.`Organisation` (`OrganisationId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

ALTER TABLE `AAU`.`Department`
ADD UNIQUE INDEX `UQ_OrganisationDepartment` (`OrganisationId` ASC, `Department` ASC) VISIBLE;

INSERT INTO `AAU`.`Department` (OrganisationId, Department, Colour, SortOrder) VALUES
(1, 'Accounting and admin','#ffffff', 1),
(1, 'Animal Care','#ffffff', 2),
(1, 'Animal Care - Hospital','#ffffff', 3),
(1, 'Animal Care - Shelter','#ffffff', 4),
(1, 'Animal Welfare','#ffffff', 5),
(1, 'Communication','#ffffff', 6),
(1, 'Community relations','#ffffff', 7),
(1, 'Cruelty Prevention','#ffffff', 8),
(1, 'Emergency response','#f4cccc', 9),
(1, 'Emergency Response - Desk','#f4cccc', 10),
(1, 'Emergency Response - Rescue','#f4cccc', 11),
(1, 'Emergency Response - ST','#f4cccc', 12),
(1, 'Facilities','#ffffff', 13),
(1, 'FDR','#ffffff', 14),
(1, 'House Keeping','#ffffff', 15),
(1, 'HR','#ffffff', 16),
(1, 'Medical','#fff2cc', 17),
(1, 'Security','#ffffff', 18),
(1, 'Stock','#ffffff', 19);

CREATE TABLE `AAU`.`Rota` (
  `RotaId` INT NOT NULL AUTO_INCREMENT,
  `OrganisationId` INT NOT NULL,
  `RotaName` VARCHAR(64) NOT NULL,
  `DefaultRota` TINYINT NULL,
  `IsDeleted` TINYINT NOT NULL DEFAULT 0,
  `DeletedDate` DATETIME NULL,
  `CreatedDate` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`RotaId`),
  INDEX `FK_Rota_Organisation_OrganisationId_idx` (`OrganisationId` ASC) VISIBLE,
  CONSTRAINT `FK_Rota_Organisation_OrganisationId`
    FOREIGN KEY (`OrganisationId`)
    REFERENCES `AAU`.`Organisation` (`OrganisationId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);   
    
CREATE TABLE `AAU`.`RotationRole` (
  `RotationRoleId` INT NOT NULL AUTO_INCREMENT,
  `RotationRole` VARCHAR(45) NOT NULL,
  `RotationAreaId` INT NOT NULL,
  `Colour` VARCHAR(16) NOT NULL,
  `StartTime` TIME NOT NULL,
  `EndTime` TIME NOT NULL,
  `BreakStartTime` TIME NULL,
  `BreakEndTime` TIME NULL,
  `SortOrder` INT NULL,
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
    
CREATE TABLE `AAU`.`LeaveRequestReason` (
`LeaveRequestReasonId` INTEGER AUTO_INCREMENT NOT NULL,
`OrganisationId` INT NOT NULL,
`LeaveRequestReason` VARCHAR(128),
`SortOrder` INTEGER NULL,
`IsDeleted` TINYINT NOT NULL DEFAULT 0,
`DeletedDate` DATE NULL,
PRIMARY KEY (`LeaveRequestReasonId`),
INDEX `FK_LeaveRequestReason_Organisation_OrganisationId_idx` (`OrganisationId` ASC) VISIBLE,
  CONSTRAINT `FK_LeaveRequestReason_Organisation_OrganisationId`
    FOREIGN KEY (`OrganisationId`)
    REFERENCES `AAU`.`Organisation` (`OrganisationId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

INSERT INTO `AAU`.`LeaveRequestReason` (OrganisationId, LeaveRequestReason, SortOrder) VALUES 
(1,'Personal reason',1),
(1,'Death of relative',2),
(1,'Family function',3),
(1,'Festival',4),
(1,'Wedding',5),
(1,'Studies',6),
(1,'Competition / Government Exam',7);

CREATE TABLE `AAU`.`LeaveRequest` (
`LeaveRequestId` INTEGER AUTO_INCREMENT NOT NULL,
`OrganisationId` INT NOT NULL,
`DepartmentId` INTEGER NOT NULL,
`UserId` INTEGER NOT NULL,
`RequestDate` DATE NOT NULL,
`LeaveRequestReasonId` INTEGER NOT NULL,
`AdditionalInformation` TEXT NULL,
`LeaveStartDate` DATE NOT NULL,
`LeaveEndDate` DATE NOT NULL,
`Granted` TINYINT NULL,
`CommentReasonManagementOnly` TEXT NULL,
`DateApprovedRejected` DATETIME NULL,
`RecordedOnNoticeBoard` TINYINT NULL,
`IsDeleted` TINYINT NULL DEFAULT 0,
`DeletedDate` DATETIME NULL,
`CreatedDate` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (`LeaveRequestId`),
  INDEX `FK_LeaveRequest_User_UserId_idx` (`UserId` ASC) VISIBLE,
  UNIQUE INDEX `RotationPeriodGUID_UNIQUE` (`LeaveRequestId` ASC) VISIBLE,
  CONSTRAINT `FK_LeaveRequest_User_UserId`
    FOREIGN KEY (`UserId`)
    REFERENCES `AAU`.`User` (`UserId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
INDEX `FK_LeaveRequest_Reason_ReasonId_idx` (`LeaveRequestReasonId` ASC) VISIBLE,
  CONSTRAINT `FK_LeaveRequest_Reason_ReasonId`
    FOREIGN KEY (`LeaveRequestReasonId`)
    REFERENCES `AAU`.`LeaveRequestReason` (`LeaveRequestReasonId`)
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
  `OrganisationId` INT NOT NULL,
  `RotationArea`  VARCHAR(32) NOT NULL,
  `SortOrder`  INT NOT NULL,
  `Colour` VARCHAR(10) NOT NULL,
  `IsDeleted` TINYINT NOT NULL DEFAULT 0,
  `DeletedDate` DATETIME NULL,
  `CreatedDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`RotationAreaId`),
  INDEX `FK_RotationArea_Organisation_OrganisationId_idx` (`OrganisationId` ASC) VISIBLE,
    CONSTRAINT `FK_RotationArea_Organisation_OrganisationId`
    FOREIGN KEY (`OrganisationId`)
    REFERENCES `AAU`.`Organisation` (`OrganisationId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
    
CREATE TABLE `AAU`.`RotaRotationArea` (
  `RotaRotationAreaId` INT NOT NULL AUTO_INCREMENT,  
  `RotaRotationAreaGUID` VARCHAR(128) NOT NULL,
  `RotationAreaId`  VARCHAR(32) NOT NULL,
  `RotaVersionId` INT NOT NULL,
  `Sequence`  INT NOT NULL,
  `Colour` VARCHAR(10) NOT NULL,
  `IsDeleted` TINYINT NOT NULL DEFAULT 0,
  `DeletedDate` DATETIME NULL,
  `CreatedDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`RotaRotationAreaId`),
  INDEX `FK_RotaRotationArea_RotaVersion_RotaVersionId_idx` (`RotaVersionId` ASC) VISIBLE,
  UNIQUE INDEX `RotaRotationAreaGUID_UNIQUE` (`RotaRotationAreaGUID` ASC) VISIBLE,
  CONSTRAINT `FK_RotaRotationArea_RotaVersion_RotaVersionId`
    FOREIGN KEY (`RotaVersionId`)
    REFERENCES `AAU`.`RotaVersion` (`RotaVersionId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
    
    
    
CREATE TABLE `AAU`.`AreaShift` (
  `AreaShiftId` INT NOT NULL AUTO_INCREMENT,  
  `RotaVersionId` INT NOT NULL,
  `AreaShiftGUID` VARCHAR(128) NOT NULL,
  `Sequence` INT NULL,
  `RotationRoleId` INT NULL,
  `Colour` VARCHAR(10) NULL,
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
    ON UPDATE NO ACTION,
  INDEX `FK_AreaShift_RotationRole_RotationRoleId_idx` (`RotationRoleId` ASC) VISIBLE,
  CONSTRAINT `FK_AreaShift_RotationRole_RotationRoleId`
    FOREIGN KEY (`RotationRoleId`)
    REFERENCES `AAU`.`RotationRole` (`RotationRoleId`)
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
    
   
CREATE TABLE `AAU`.`RotaDayAssignment` (
`RotaDayId` INTEGER AUTO_INCREMENT NOT NULL,
`RotaDayDate` DATE NOT NULL,
`RotationPeriodId` INTEGER NOT NULL,
`AreaShiftId` INTEGER NOT NULL,
`UserId` INTEGER NULL,
`ActualStartTime` TIME NULL,
`ActualEndTime` TIME NULL,
`ActualBreakStartTime` TIME NULL,
`ActualBreakEndTime` TIME NULL,
`RotationUserId` INTEGER NULL,
`Notes` VARCHAR(1024) NULL,
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
    ON UPDATE NO ACTION
);


    
    
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
