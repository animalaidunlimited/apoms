DROP TABLE IF EXISTS `AAU`.`RotaMatrixItem`;
DROP TABLE IF EXISTS `AAU`.`RotaDayAssignment`;
DROP TABLE IF EXISTS `AAU`.`AreaShift`;
DROP TABLE IF EXISTS `AAU`.`RotationRoleShiftSegment`;
DROP TABLE IF EXISTS `AAU`.`RotationRole`;
DROP TABLE IF EXISTS `AAU`.`LeaveRequest`;
DROP TABLE IF EXISTS `AAU`.`LeaveRequestReason`;
DROP TABLE IF EXISTS `AAU`.`RotaDayAuthorisation`;
DROP TABLE IF EXISTS `AAU`.`RotaRotationArea`;
DROP TABLE IF EXISTS `AAU`.`RotationAreaPosition`;
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
  `DefaultRota` TINYINT NULL DEFAULT 0,
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
	`nextDay` TINYINT NULL,
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
  `DefaultRotaVersion` TINYINT NULL DEFAULT 0,
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

CREATE TABLE `AAU`.`RotaDayAuthorisation` (
  `RotaDayAuthorisationId` INT NOT NULL AUTO_INCREMENT,
  `OrganisationId` INT NOT NULL,
  `RotationPeriodId` INT NOT NULL,
  `RotaDayDate` DATE NOT NULL,
  `ManagerAuthorisation` JSON NOT NULL,
  `IsDeleted` TINYINT NOT NULL DEFAULT 0,
  `DeletedDate` DATETIME NULL,
  `CreatedDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`RotaDayAuthorisationId`),
  INDEX `IX_RotaDayAuthorisation_Organisation` (`OrganisationId` ASC) VISIBLE,
  INDEX `IX_RotaDayAuthorisation_RotationPeriodId_idx` (`RotationPeriodId` ASC) VISIBLE,
  UNIQUE INDEX `UQ_RotationPeriod_RotaDayDate` (`RotaDayDate` ASC, `RotationPeriodId` ASC) VISIBLE,
  CONSTRAINT `FK_RotaDayAuthorisation_Organisation_OrganisationId`
    FOREIGN KEY (`OrganisationId`)
    REFERENCES `AAU`.`Organisation` (`OrganisationId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_RotaDayAuthorisation_RotationPeriod_RotationPeriodId`
    FOREIGN KEY (`RotationPeriodId`)
    REFERENCES `AAU`.`RotationPeriod` (`RotationPeriodId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);   
    
CREATE TABLE `AAU`.`RotationArea` (
  `RotationAreaId` INT NOT NULL AUTO_INCREMENT,
  `OrganisationId` INT NOT NULL,
  `RotationArea`  VARCHAR(32) NOT NULL,
  `ScheduleManagerId` INT NULL,
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
    ON UPDATE NO ACTION,
    INDEX `FK_RotationArea_User_ScheduleManagerId_idx` (`ScheduleManagerId` ASC) VISIBLE,
    CONSTRAINT `FK_RotationArea_User_ScheduleManagerId`
    FOREIGN KEY (`ScheduleManagerId`)
    REFERENCES `AAU`.`User` (`UserId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
    );
    
INSERT INTO AAU.RotationArea (RotationAreaId, OrganisationId, RotationArea, SortOrder, Colour, IsDeleted) VALUES (-1, 1, 'Breaks',-1,'#ffffff', 0);

INSERT INTO AAU.RotationArea (OrganisationId, RotationArea, SortOrder, Colour, IsDeleted) VALUES (1,'A Kennel',1, '#e06666', 0),
(1,'A KENNEL',2, '#0b5394', 0),
(1,'ABC',3, '#1c4587', 0),
(1,'ABC Day',4, '#ed7d31', 0),
(1,'ABC Night',5, '#ed7d31', 0),
(1,'Admin and Facilities',6, '#ed7d31', 0),
(1,'Ambulance',7, '#1c4587', 0),
(1,'Animal training',8, '#ff00ff', 0),
(1,'AW',9, '#ed7d31', 0),
(1,'B Ken',10, '#e06666', 0),
(1,'B KENNEL',11, '#38761d', 0),
(1,'CALF FEEDING',12, '#ffc000', 0),
(1,'Cat',13, '#e06666', 0),
(1,'CATS',14, '#ffc000', 0),
(1,'Cattle',15, '#e06666', 0),
(1,'CATTLE',16, '#ffc000', 0),
(1,'Cruelty',17, '#ed7d31', 0),
(1,'Emergency Dispatch',18, '#1c4587', 0),
(1,'Group Hospital',19, '#0b5394', 0),
(1,'HANDY HEAVEN',20, '#cfe2f3', 0),
(1,'HOUSE KEEPING',21, '#ed7d31', 0),
(1,'Isolation',22, '#e06666', 0),
(1,'ISOLATION',23, '#ff0000', 0),
(1,'Learning Session',24, '#9900ff', 0),
(1,'LSAs',25, '#9900ff', 0),
(1,'MHE',26, '#0000ff', 0),
(1,'MHN - MHE',27, '#0000ff', 0),
(1,'NN',28, '#ed7d31', 0),
(1,'Operation Theatre',29, '#e06666', 0),
(1,'Pig',30, '#e06666', 0),
(1,'PIGEONS',31, '#ffc000', 0),
(1,'PP-I',32, '#e06666', 0),
(1,'PRE-ISO',33, '#ff0000', 0),
(1,'Pup',34, '#e06666', 0),
(1,'PUPPY',35, '#ed7d31', 0),
(1,'SA',36, '#e06666', 0),
(1,'Shelter',37, '#e06666', 0),
(1,'SHELTER',38, '#cfe2f3', 0),
(1,'SHELTER FEEDING AM',39, '#cfe2f3', 0),
(1,'Street Treat',40, '#1c4587', 0),
(1,'UPPER H. ',41, '#cfe2f3', 0),
(1,'Video',42, '#ed7d31', 0);


CREATE TABLE `AAU`.`RotationAreaPosition` (
  `RotationAreaPositionId` INT NOT NULL AUTO_INCREMENT,
  `OrganisationId` INT NOT NULL,
  `RotationAreaId` INT NOT NULL,  
  `RotationAreaPosition`  VARCHAR(32) NOT NULL,
  `SortOrder`  INT NOT NULL,
  `Colour` VARCHAR(20) NULL,
  `IsDeleted` TINYINT NOT NULL DEFAULT 0,
  `DeletedDate` DATETIME NULL,
  `CreatedDate` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`RotationAreaPositionId`),
    INDEX `FK_RotationAreaPosition_RotationArea_RotationAreaId_idx` (`RotationAreaId` ASC) VISIBLE,
  CONSTRAINT `FK_RotationAreaPosition_RotationArea_RotationAreaId`
    FOREIGN KEY (`RotationAreaId`)
    REFERENCES `AAU`.`RotationArea` (`RotationAreaId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  INDEX `FK_RotationAreaPosition_Organisation_OrganisationId_idx` (`OrganisationId` ASC) VISIBLE,
    CONSTRAINT `FK_RotationAreaPosition_Organisation_OrganisationId`
    FOREIGN KEY (`OrganisationId`)
    REFERENCES `AAU`.`Organisation` (`OrganisationId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);

INSERT INTO `AAU`.`RotationAreaPosition` (RotationAreaPositionId, OrganisationId, RotationAreaId, RotationAreaPosition, SortOrder) VALUES
('-2', '1', '-1', 'Lunch break', '-1'),
('-3', '1', '-1', 'Tea break', '-1');

INSERT INTO `AAU`.`RotationAreaPosition` (OrganisationId, RotationAreaId, RotationAreaPosition, SortOrder) VALUES
(1,1,'Medical 1',1),
(1,1,'Medical 2',2),
(1,1,'Medical 3',3),
(1,1,'Medical 4',4),
(1,1,'Medical 5',5),
(1,10,'Medical 1',6),
(1,10,'Medical 2',7),
(1,10,'Medical 3',8),
(1,34,'Medical 1',9),
(1,34,'Medical 2',10),
(1,34,'Medical 3',11),
(1,32,'Medical 1',12),
(1,32,'Medical 2',13),
(1,32,'Medical 3',14),
(1,36,'Medical 1',15),
(1,36,'Medical 2',16),
(1,22,'Medical 1',17),
(1,22,'Medical 2',18),
(1,22,'Medical 3',19),
(1,22,'Medical 4',20),
(1,15,'Medical 1',21),
(1,15,'Medical 2',22),
(1,15,'Medical 3',23),
(1,13,'Medical 1',24),
(1,13,'Medical 2',25),
(1,30,'Medical 1',26),
(1,30,'Medical 2',27),
(1,37,'Medical 1',28),
(1,37,'Medical 2',29),
(1,26,'Medical 1',30),
(1,26,'Medical 2',31),
(1,19,'Group hospital',32),
(1,2,'7AM Care Giver',33),
(1,2,'10AM Care Giver',34),
(1,2,'In training',35),
(1,2,'Others',36),
(1,11,'7AM Care Giver',37),
(1,11,'10AM Care Giver',38),
(1,35,'7AM Care Giver',39),
(1,35,'Care Giver',40),
(1,35,'10AM Care Giver',41),
(1,33,'7AM Care Giver',42),
(1,33,'10AM Care Giver',43),
(1,23,'PM Care Giver - I01',44),
(1,23,'PM Care Giver - I02',45),
(1,23,'PM Care Giver - I03',46),
(1,23,'PM Care Giver - I04',47),
(1,23,'AM Care Giver - I05',48),
(1,23,'AM Care Giver - I06',49),
(1,23,'AM Care Giver - I07',50),
(1,23,'AM Care Giver - I08',51),
(1,23,'AM Care Giver - Ix1',52),
(1,23,'PM Care Giver - Ix2',53),
(1,23,'AM Care Giver - Ix3',54),
(1,23,'In training',55),
(1,23,'PM Care Giver',56),
(1,16,'Area Manager',57),
(1,16,'Area coordinator',58),
(1,16,'Care giver 1 - C01',59),
(1,16,'Care giver 2 - C02',60),
(1,16,'Care giver 3 - C03',61),
(1,16,'Care giver 4 - C04',62),
(1,16,'In training',63),
(1,16,'Other',64),
(1,16,'LSA',65),
(1,16,'Care Giver',66),
(1,14,'Care Giver',67),
(1,31,'Care Giver',68),
(1,39,'Group Shelter',69),
(1,20,'Care giver 1',70),
(1,20,'Care giver 2',71),
(1,20,'Care giver 3',72),
(1,20,'Care giver 4',73),
(1,20,'LSA',74),
(1,41,'Care giver 1',75),
(1,41,'Care giver 2',76),
(1,41,'Care giver 3',77),
(1,41,'Care giver 4',78),
(1,41,'LSA',79),
(1,38,'Care giver 1',80),
(1,38,'Care giver 2',81),
(1,38,'Care giver 3',82),
(1,38,'Care giver 4',83),
(1,38,'LSA',84),
(1,21,'Kitchen 1',85),
(1,21,'Kitchen 2',86),
(1,21,'Clothes 1',87),
(1,21,'Clothes 2',88),
(1,21,'Clothes 3',89),
(1,21,'Clothes 4',90),
(1,21,'Cleaner',91),
(1,27,'Care Giver - N01',92),
(1,27,'Care Giver - N02',93),
(1,27,'Care Giver - N03',94),
(1,27,'Care Giver - N04',95),
(1,27,'Care Giver - N05',96),
(1,27,'Care Giver - N06',97),
(1,27,'Care Giver - N07',98),
(1,4,'Medical assistant',99),
(1,4,'Care Giver 1',100),
(1,4,'Care Giver 2',101),
(1,5,'Care Giver 1',102),
(1,5,'Care Giver 2',103),
(1,29,'Surgeon 1',104),
(1,29,'Surgeon 2',105),
(1,29,'Compounder 1',106),
(1,29,'Compounder 2',107),
(1,29,'Surgery Care 1',108),
(1,29,'Surgery Care 2',109),
(1,29,'Autoclave',110),
(1,18,'ED 1',111),
(1,18,'ED 2',112),
(1,18,'ED 3',113),
(1,18,'ED 4',114),
(1,18,'ED 5',115),
(1,18,'ED 6',116),
(1,18,'ED 7',117),
(1,18,'ED 8',118),
(1,18,'ED 9',119),
(1,18,'ED 10',120),
(1,18,'ED 11',121),
(1,18,'ED 12',122),
(1,18,'ED 13',123),
(1,18,'ED 14',124),
(1,7,'Team 1',125),
(1,7,'Team 2',126),
(1,7,'Team 3',127),
(1,7,'Team 4',128),
(1,7,'Team 5',129),
(1,7,'Team 6',130),
(1,7,'Team 7',131),
(1,3,'Team 1',132),
(1,40,'Team 1',133),
(1,40,'Team 2',134),
(1,28,'Rescuer',135),
(1,28,'Care giver',136),
(1,8,'Animal Training (ED 8AM)',137),
(1,8,'Animal Training (ED 9AM)',138),
(1,8,'Animal Training (ED 10AM)',139),
(1,8,'Animal Training (ED 12PM)',140),
(1,8,'Animal Training ',141),
(1,12,'Calf feeding',142),
(1,12,'Calf feeding - LSA',143),
(1,24,'Learning session - LSA',144),
(1,25,'Compounder in training',145),
(1,6,'Office 1',146),
(1,6,'Office 2',147),
(1,6,'Office 3',148),
(1,6,'Junior Developer',149),
(1,6,'Software Developer',150),
(1,6,'HR Generalist',151),
(1,6,'Staff Coordinator',152),
(1,6,'HR Coordinator',153),
(1,6,'HR assistant 2',154),
(1,6,'HR assistant 3',155),
(1,6,'Staff Training',156),
(1,6,'Accountant',157),
(1,6,'Account Assistant',158),
(1,6,'Medicine room',159),
(1,6,'Stock assistant',160),
(1,6,'Stock coordinator',161),
(1,6,'Vehicle MNT/Driver',162),
(1,6,'Facilities Coordinator',163),
(1,6,'FDR 1',164),
(1,6,'FDR 2',165),
(1,6,'FDR 3',166),
(1,9,'Vol Cord 1',167),
(1,9,'Vol Cord 2',168),
(1,9,'Vol Cord 6',169),
(1,17,'Cruelty officer 1',170),
(1,17,'Cruelty officer 2',171),
(1,42,'Camera 1',172);
        
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
`RotationRoleShiftSegmentId` INTEGER NOT NULL,
`UserId` INTEGER NULL,
`RotationAreaPositionId` INTEGER NULL,
`ActualStartTime` TIME NULL,
`ActualEndTime` TIME NULL,
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
INDEX `FK_RotaDayAssignment_RAreaPosition_RAreaPositionId_idx` (`RotationAreaPositionId` ASC) VISIBLE,
  CONSTRAINT `FK_RotaDayAssignment_RotationAreaPosition_RotationAreaPositionId`
    FOREIGN KEY (`RotationAreaPositionId`)
    REFERENCES `AAU`.`RotationAreaPosition` (`RotationAreaPositionId`)
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

INSERT INTO AAU.RotationRole (OrganisationId, RotationRole, Colour, SortOrder, IsDeleted) VALUES
('1', 'N01', '#cfdff3', '1', '0'),
('1', 'N02', '#cfe2f3', '2', '0'),
('1', 'N03', '#cfe2f3', '3', '0'),
('1', 'N04', '#cfe2f3', '4', '0'),
('1', 'N05', '#cfe2f3', '5', '0'),
('1', 'N06', '#cfe2f3', '6', '0'),
('1', 'N07', '#cfe2f3', '7', '0'),
('1', 'I01', '#f4cccc', '8', '0'),
('1', 'I02', '#f4cccc', '9', '0'),
('1', 'I03', '#f4cccc', '10', '0'),
('1', 'I04', '#f4cccc', '11', '0'),
('1', 'I05', '#f4cccc', '12', '0'),
('1', 'I06', '#f4cccc', '13', '0'),
('1', 'I07', '#f4cccc', '14', '0'),
('1', 'I08', '#f4cccc', '15', '0'),
('1', 'H01', '#d9ead3', '16', '0'),
('1', 'H02', '#d9ead3', '17', '0'),
('1', 'H03', '#d9ead3', '18', '0'),
('1', 'H04', '#d9ead3', '19', '0'),
('1', 'H05', '#d9ead3', '20', '0'),
('1', 'H06', '#d9ead3', '21', '0'),
('1', 'H07', '#d9ead3', '22', '0'),
('1', 'H08', '#d9ead3', '23', '0'),
('1', 'H09', '#d9ead3', '24', '0'),
('1', 'H10', '#d9ead3', '25', '0'),
('1', 'C01', '#fff2cc', '26', '0'),
('1', 'C02', '#fff2cc', '27', '0'),
('1', 'C03', '#fff2cc', '28', '0'),
('1', 'C04', '#fff2cc', '29', '0');


INSERT INTO AAU.RotationRoleShiftSegment (OrganisationId, RotationRoleId, StartTime, EndTime, nextDay, ShiftSegmentTypeId, IsDeleted) VALUES
('1', '1', '19:00:00', '07:00:00', '1', '92', '0'),
('1', '2', '19:00:00', '07:00:00', '1', '93', '0'),
('1', '3', '19:00:00', '07:00:00', '1', '94', '0'),
('1', '4', '19:00:00', '07:00:00', '1', '95', '0'),
('1', '5', '19:00:00', '07:00:00', '1', '96', '0'),
('1', '6', '19:00:00', '07:00:00', '1', '97', '0'),
('1', '7', '19:00:00', '07:00:00', '1', '98', '0'),
('1', '8', '10:00:00', '19:00:00', '0', '44', '0'),
('1', '9', '07:00:00', '16:00:00', '0', '45', '0'),
('1', '10', '10:00:00', '19:00:00', '0', '46', '0'),
('1', '11', '10:00:00', '19:00:00', '0', '47', '0'),
('1', '12', '07:00:00', '16:00:00', '0', '48', '0'),
('1', '13', '07:00:00', '16:00:00', '0', '49', '0'),
('1', '14', '07:00:00', '16:00:00', '0', '50', '0'),
('1', '15', '07:00:00', '16:00:00', '0', '51', '0'),
('1', '16', '07:00:00', '16:00:00', '0', '33', '0'),
('1', '17', '08:00:00', '17:00:00', '0', '59', '0'),
('1', '18', '08:00:00', '17:00:00', '1', '60', '0'),
('1', '19', '08:00:00', '17:00:00', '1', '61', '0'),
('1', '20', '08:00:00', '17:00:00', '1', '62', '0'),
('1', '21', '07:00:00', '16:00:00', '0', '33', '0'),
('1', '22', '07:00:00', '16:00:00', '0', '33', '0'),
('1', '23', '07:00:00', '16:00:00', '0', '33', '0'),
('1', '24', '07:00:00', '16:00:00', '0', '33', '0'),
('1', '25', '07:00:00', '16:00:00', '0', '33', '0'),
('1', '26', '07:00:00', '16:00:00', '0', '33', '0'),
('1', '27', '07:00:00', '16:00:00', '0', '33', '0'),
('1', '28', '07:00:00', '16:00:00', '0', '33', '0'),
('1', '29', '07:00:00', '16:00:00', '0', '33', '0');
    
/*


SELECT *
FROM `AAU`.`RotationRole`

INSERT INTO `AAU`.`RotationRole` (RotationRole, Colour, OrganisationId, RotationAreaId, SortOrder) VALUES
('N01','#90ee90',1,1,1),
('N02','#add8e6',1,1,2),
('N03','#e0ffff',1,1,3),
('HX1','#20b2aa',1,2,4),
('HX2','#ffffe0',1,2,5),
('HX3','#ffa07a',1,2,6);

SELECT *
FROM AAU.RotationRoleShiftSegment;

INSERT INTO AAU.RotationRoleShiftSegment (OrganisationId, RotationRoleId, StartTime, EndTime, nextDay, ShiftSegmentTypeId, IsDeleted) VALUES
(1,1,'09:00','11:00',0,1,0),
(1,1,'11:00','11:15',0,-1,0),
(1,1,'11:15','13:00',0,2,0),
(1,1,'13:00','14:00',0,-2,0),
(1,1,'14:00','18:00',0,3,0),
(1,2,'09:00','11:00',0,1,0),
(1,2,'11:00','11:15',0,-1,0),
(1,2,'11:15','13:00',0,2,0),
(1,2,'13:00','14:00',0,-2,0),
(1,2,'14:00','18:00',0,3,0),
(1,3,'08:00','10:00',0,4,0),
(1,3,'10:00','10:15',0,-1,0),
(1,3,'10:15','12:00',0,5,0),
(1,3,'12:00','13:00',0,-2,0),
(1,3,'13:00','17:00',0,6,0),
(1,4,'08:00','10:00',0,4,0),
(1,4,'10:00','10:15',0,-1,0),
(1,4,'10:15','12:00',0,5,0),
(1,4,'12:00','13:00',0,-2,0),
(1,4,'13:00','17:00',0,6,0),
(1,5,'08:00','10:00',0,7,0),
(1,5,'10:00','10:15',0,-1,0),
(1,5,'10:15','12:00',0,8,0),
(1,5,'12:00','13:00',0,-2,0),
(1,5,'13:00','17:00',0,8,0),
(1,6,'08:00','10:00',0,9,0),
(1,6,'10:00','10:15',0,-1,0),
(1,6,'10:15','12:00',0,9,0),
(1,6,'12:00','13:00',0,-2,0),
(1,6,'13:00','17:00',0,10,0);

INSERT INTO `AAU`.`Rota` (`OrganisationId`,`RotaName`,`DefaultRota`) VALUES (1, 'Hospital Staff', 1), (1, 'Desk Staff', 0);
INSERT INTO `AAU`.`RotaVersion` (`OrganisationId`,`RotaVersionName`,`DefaultRotaVersion`, `RotaId`) VALUES
(1, 'Version 1', 0, 1), (1, 'Version 2', 1, 1),
(1, 'Desk Version MkI', 0, 2), (1, 'Desk Version MkII', 1, 2);


SELECT *
FROM AAU.LeaveRequest

ALTER TABLE AAU.LeaveRequest DROP COLUMN WithinProtocol;


INSERT INTO `AAU`.`LeaveRequest` (OrganisationId, `UserId`, `RequestDate`, `LeaveRequestReasonId`, `LeaveStartDate`, `LeaveEndDate`, `Granted`) VALUES (1 ,1 , '2022-12-10', 1, '2023-02-09', '2023-02-19', '1');
INSERT INTO `AAU`.`LeaveRequest` (OrganisationId, `UserId`, `RequestDate`, `LeaveRequestReasonId`, `LeaveStartDate`, `LeaveEndDate`, `Granted`) VALUES (1, 1, '2022-12-10', 2, '2023-02-09', '2023-02-11', '0');
INSERT INTO `AAU`.`LeaveRequest` (OrganisationId, `UserId`, `RequestDate`, `LeaveRequestReasonId`, `LeaveStartDate`, `LeaveEndDate`) VALUES (1, 1, '2022-12-10', 3, '2023-02-11', '2023-02-13');


*/
