DROP TABLE IF EXISTS `AAU`.`RotaMatrixItem`;
DROP TABLE IF EXISTS `AAU`.`RotaDayAssignment`;
DROP TABLE IF EXISTS `AAU`.`AreaShift`;
DROP TABLE IF EXISTS `AAU`.`RotationRoleShiftSegment`;
DROP TABLE IF EXISTS `AAU`.`RotationRole`;
DROP TABLE IF EXISTS `AAU`.`LeaveRequest`;
DROP TABLE IF EXISTS `AAU`.`LeaveRequestReason`;
DROP TABLE IF EXISTS `AAU`.`RotaRotationArea`;
DROP TABLE IF EXISTS `AAU`.`RotationArea`;
DROP TABLE IF EXISTS `AAU`.`RotationPeriod`;
DROP TABLE IF EXISTS `AAU`.`RotaVersion`;
DROP TABLE IF EXISTS `AAU`.`Rota`;
DROP TABLE IF EXISTS `AAU`.`Festival`;
DROP TABLE IF EXISTS `AAU`.`Department`;
DROP TABLE IF EXISTS `AAU`.`LeaveRequestProtocol`;

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
  `OrganisationId` INT NOT NULL,
  `RotationRole` VARCHAR(45) NOT NULL,
  `RotationAreaId` INT NOT NULL,
  `Colour` VARCHAR(20) NOT NULL,  
  `SortOrder` INT NULL,  
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
 
CREATE TABLE `AAU`.`RotationRoleShiftSegment` (
	`RotationRoleShiftSegmentId` INT NOT NULL AUTO_INCREMENT,
    `OrganisationId` INT NOT NULL,
	`RotationRoleId` INT NOT NULL,    
	`StartTime` TIME NOT NULL,
	`EndTime` TIME NOT NULL,
	`SameDay` TINYINT NULL,
    `ShiftSegmentTypeId` INT NOT NULL,
	`IsDeleted` TINYINT NOT NULL DEFAULT 0,
	`DeletedDate` DATETIME NULL,
	`CreatedDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (`RotationRoleShiftSegmentId`),
    INDEX `FK_RRShiftSegment_RotationRole_RotationRoleId_idx` (`RotationRoleId` ASC) VISIBLE,
	  CONSTRAINT `FK_RotationRoleShiftSegment_RotationRole_RotationRoleId`
		FOREIGN KEY (`RotationRoleId`)
		REFERENCES `AAU`.`RotationRole` (`RotationRoleId`)
		ON DELETE NO ACTION
		ON UPDATE NO ACTION,
	INDEX `FK_RRShiftSegmentType_Organisation_OrganisationId_idx` (`OrganisationId` ASC) VISIBLE,
	CONSTRAINT `FK_RRShiftSegmentType_Organisation_OrganisationId`
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
`WithinProtocol` TINYINT NOT NULL,
`FestivalId` INTEGER NULL,
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
  `Name` VARCHAR(128) NULL,
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
  `Colour` VARCHAR(20) NOT NULL,
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
    
INSERT INTO AAU.RotationArea (OrganisationId, RotationArea, SortOrder, Colour, IsDeleted) VALUES (1,'A Kennel',1, '#e06666', 0),
(1,'ABC',2, '#1c4587', 0),
(1,'ABC Day',3, '#ed7d31', 0),
(1,'ABC Night',4, '#ed7d31', 0),
(1,'Admin And Facilities',5, '#ed7d31', 0),
(1,'Ambulance',6, '#1c4587', 0),
(1,'Animal Training',7, '#ff00ff', 0),
(1,'AW',8, '#ed7d31', 0),
(1,'B Ken',9, '#e06666', 0),
(1,'B Kennel',10, '#38761d', 0),
(1,'Calf Feeding',11, '#ffc000', 0),
(1,'Cat',12, '#e06666', 0),
(1,'Cats',13, '#ffc000', 0),
(1,'Cattle',14, '#e06666', 0),
(1,'Cruelty',15, '#ed7d31', 0),
(1,'Emergency Dispatch',16, '#1c4587', 0),
(1,'Group Hospital',17, '#0b5394', 0),
(1,'Handy Heaven',18, '#cfe2f3', 0),
(1,'House Keeping',19, '#ed7d31', 0),
(1,'Isolation',20, '#e06666', 0),
(1,'Learning Session',21, '#9900ff', 0),
(1,'LSAs',22, '#9900ff', 0),
(1,'MHE',23, '#0000ff', 0),
(1,'MHN - MHE',24, '#0000ff', 0),
(1,'NN',25, '#ed7d31', 0),
(1,'Operation Theathre',26, '#e06666', 0),
(1,'Pig',27, '#e06666', 0),
(1,'Pigeons',28, '#ffc000', 0),
(1,'PP-I',29, '#e06666', 0),
(1,'Pre-Iso',30, '#ff0000', 0),
(1,'Pup',31, '#e06666', 0),
(1,'Puppy',32, '#ed7d31', 0),
(1,'SA',33, '#e06666', 0),
(1,'Shelter',34, '#e06666', 0),
(1,'Shelter Feeding Am',35, '#cfe2f3', 0),
(1,'Street Treat',36, '#1c4587', 0),
(1,'Upper H. ',37, '#cfe2f3', 0),
(1,'Video',38, '#ed7d31', 0);



    
    INSERT INTO AAU.RotationArea (OrganisationId, RotationArea, SortOrder, Colour) VALUES
(1,'A Kennel', 1,'#e06666'),
(1,'B ken', 2,'#e06666'),
(1,'Pup', 3,'#e06666'),
(1,'PP-I', 4,'#e06666'),
(1,'SA', 5,'#e06666'),
(1,'Isolation', 6,'#e06666'),
(1,'Cattle', 7,'#e06666'),
(1,'Cat', 8,'#e06666'),
(1,'Pig', 9,'#e06666'),
(1,'Shelter', 10,'#e06666'),
(1,'MHE', 11,'#0000ff'),
(1,'Group hospital', 12,'#0b5394'),
(1,'A KENNEL', 13,'#0b5394'),
(1,'B KENNEL', 14,'#38761d'),
(1,'PUPPY', 15,'#ed7d31'),
(1,'PRE-ISO', 16,'#ff0000'),
(1,'ISOLATION', 17,'#ff0000'),
(1,'CATTLE', 18,'#ffc000'),
(1,'CATS', 19,'#ffc000'),
(1,'PIGEONS', 20,'#ffc000'),
(1,'SHELTER FEEDING AM', 21,'#cfe2f3'),
(1,'HANDY HEAVEN', 22,'#cfe2f3'),
(1,'UPPER H. ', 23,'#cfe2f3'),
(1,'SHELTER', 24,'#cfe2f3'),
(1,'HOUSE KEEPING', 25,'#ed7d31'),
(1,'MHN - MHE', 26,'#0000ff'),
(1,'ABC Day', 27,'#ed7d31'),
(1,'ABC Night', 28,'#ed7d31'),
(1,'Operation Theathre', 29,'#e06666'),
(1,'Emergency Dispatch', 30,'#3c78d8'),
(1,'Ambulance', 31,'#3c78d8'),
(1,'ABC', 32,'#3c78d8'),
(1,'Street Treat', 33,'#3c78d8'),
(1,'NN', 34,'#ed7d31'),
(1,'Animal training', 35,'#ff00ff'),
(1,'CALF FEEDING', 36,'#ffc000'),
(1,'Learning session', 37,'#9900ff'),
(1,'LSAs', 38,'#9900ff'),
(1,'Admin and Facilities', 39,'#ed7d31'),
(1,'AW', 40,'#ed7d31'),
(1,'Cruelty', 41,'#ed7d31'),
(1,'Video', 42,'#ed7d31');
        
CREATE TABLE `AAU`.`RotaRotationArea` (
  `RotaRotationAreaId` INT NOT NULL AUTO_INCREMENT,  
  `RotaRotationAreaGUID` VARCHAR(128) NOT NULL,
  `RotationAreaId`  VARCHAR(32) NOT NULL,
  `RotaVersionId` INT NOT NULL,
  `Sequence`  INT NOT NULL,
  `Colour` VARCHAR(20) NOT NULL,
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
  `Sequence` INT NOT NULL,
  `RotationRoleId` INT NULL,
  `Colour` VARCHAR(20) NULL,
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
`RotationRoleId` INTEGER NOT NULL,
`UserId` INTEGER NULL,
`RotationUserId` INTEGER NULL,
`Notes` VARCHAR(1024) CHARACTER SET UTF8MB4 NULL,
`Sequence` INTEGER NOT NULL,
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
INDEX `FK_RotaDayAssignment_RotationRole_RotationRoleId_idx` (`RotationRoleId` ASC) VISIBLE,
  CONSTRAINT `FK_RotaDayAssignment_RotationRole_RotationRoleId`
    FOREIGN KEY (`RotationRoleId`)
    REFERENCES `AAU`.`RotationRole` (`RotationRoleId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE TABLE `AAU`.`Department` (
`DepartmentId` INTEGER AUTO_INCREMENT NOT NULL,
`OrganisationId` INTEGER NOT NULL,
`Department` VARCHAR(64) NOT NULL,
`Colour` VARCHAR(20) NULL,
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

ALTER TABLE `AAU`.`Department`
ADD UNIQUE INDEX `UQ_OrganisationDepartment` (`OrganisationId` ASC, `Department` ASC) VISIBLE;

CREATE TABLE `AAU`.`Festival` (
`FestivalId` INTEGER AUTO_INCREMENT NOT NULL,
`OrganisationId` INTEGER NOT NULL,
`Festival` VARCHAR(64) NOT NULL,
`LocalName` VARCHAR(64) CHARACTER SET UTF8MB4 NOT NULL ,
`NoticeDaysRequired` INTEGER NOT NULL,
`SortOrder` INTEGER NULL,
`IsDeleted` TINYINT NOT NULL DEFAULT 0,
`DeletedDate` DATETIME NULL,
`CreatedDate` DATETIME DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (`FestivalId`),
  INDEX `FK_FestivalId_Organisation_OrganisationId_idx` (`OrganisationId` ASC) VISIBLE,
  CONSTRAINT `FK_FestivalId_Organisation_OrganisationId`
    FOREIGN KEY (`OrganisationId`)
    REFERENCES `AAU`.`Organisation` (`OrganisationId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

INSERT INTO AAU.Festival (OrganisationId, Festival, LocalName, NoticeDaysRequired, SortOrder) VALUES 
(1,'Holi', 'होली',30,1),
(1,'Devali', 'दीपावली',30,2),
(1,'Mansa Mahadev', 'मनसा महादेव',30,3);

CREATE TABLE `AAU`.`LeaveRequestProtocol` (
`LeaveRequestProtocolId` INTEGER AUTO_INCREMENT NOT NULL,
`OrganisationId` INTEGER NOT NULL,
`DayRangeStart` INTEGER NOT NULL,
`DayRangeEnd` INTEGER NOT NULL,
`NoticeDaysRequired` INTEGER NOT NULL,
`SortOrder` INTEGER NULL,
`IsDeleted` TINYINT NOT NULL DEFAULT 0,
`DeletedDate` DATETIME NULL,
`CreatedDate` DATETIME DEFAULT CURRENT_TIMESTAMP,
PRIMARY KEY (`LeaveRequestProtocolId`),
  INDEX `FK_LeaveRequestProtocolId_Organisation_OrganisationId_idx` (`OrganisationId` ASC) VISIBLE,
  CONSTRAINT `FK_LeaveRequestProtocolId_Organisation_OrganisationId`
    FOREIGN KEY (`OrganisationId`)
    REFERENCES `AAU`.`Organisation` (`OrganisationId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);
    
INSERT INTO AAU.LeaveRequestProtocol (OrganisationId, DayRangeStart, DayRangeEnd, NoticeDaysRequired, SortOrder) VALUES
(1,0,1,3,1),
(1,2,3,7,2),
(1,4,5,14,3),
(1,6,999,30,4);
    
/*

INSERT INTO `AAU`.`RotationArea` (OrganisationId, RotationArea, SortOrder, Colour) VALUES
(1,'A Kennel', 1, '#ffb6c1'),
(1,'B Kennel', 2, '#add8e6');

INSERT INTO `AAU`.`RotationRole` (RotationRole, Colour, OrganisationId, RotationAreaId, startTime, EndTime, BreakStartTime, BreakEndTime, SortOrder) VALUES
('N01','#90ee90',1,1,'08:00','17:00','13:00','14:00',1),
('N02','#add8e6',1,1,'09:00','18:00','14:00','15:00',2),
('N03','#e0ffff',1,1,'10:00','19:00','15:00','16:00',3),
('HX1','#20b2aa',1,2,'11:00','20:00','16:00','14:00',4),
('HX2','#ffffe0',1,2,'12:00','21:00','17:00','18:00',5),
('HX3','#ffa07a',1,2,'06:00','15:00','11:00','12:00',6);

INSERT INTO `AAU`.`Rota` (`OrganisationId`,`RotaName`,`DefaultRota`) VALUES (1, 'Hospital Staff', 1), (1, 'Desk Staff', 0);
INSERT INTO `AAU`.`RotaVersion` (`OrganisationId`,`RotaVersionName`,`DefaultRotaVersion`, `RotaId`) VALUES
(1, 'Version 1', 0, 1), (1, 'Version 2', 1, 1),
(1, 'Desk Version MkI', 0, 2), (1, 'Desk Version MkII', 1, 2);


INSERT INTO `AAU`.`LeaveRequest` (`DepartmentId`, `UserId`, `RequestDate`, `RequestReason`, `LeaveStartDate`, `LeaveEndDate`, `Granted`) VALUES ('1', '1', '2022-01-10', 'Family Trip', '2022-10-01', '2022-10-03', '1');
INSERT INTO `AAU`.`LeaveRequest` (`DepartmentId`, `UserId`, `RequestDate`, `RequestReason`, `LeaveStartDate`, `LeaveEndDate`, `Granted`) VALUES ('1', '4', '2022-10-03', 'Wedding', '2022-10-05', '2022-10-06', '1');
INSERT INTO `AAU`.`LeaveRequest` (`DepartmentId`, `UserId`, `RequestDate`, `RequestReason`, `LeaveStartDate`, `LeaveEndDate`, `Granted`) VALUES ('1', '6', '2022-10-03', 'Visit', '2022-10-09', '2022-10-14', '1');


*/
