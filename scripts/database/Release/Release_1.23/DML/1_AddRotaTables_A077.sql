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

INSERT INTO AAU.RotationArea (OrganisationId, RotationArea, SortOrder, Colour, IsDeleted) VALUES 
(1,'A Kennel',1, '#e06666', 0),
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
(1,1,'Medical 1',1),(1,1,'Medical 2',2),(1,1,'Medical 3',3),(1,1,'Medical 4',4),(1,1,'Medical 5',5),(1,9,'Medical 1',6),(1,9,'Medical 2',7),
(1,9,'Medical 3',8),(1,31,'Medical 1',9),(1,31,'Medical 2',10),(1,31,'Medical 3',11),(1,29,'Medical 1',12),(1,29,'Medical 2',13),(1,29,'Medical 3',14),
(1,33,'Medical 1',15),(1,33,'Medical 2',16),(1,20,'Medical 1',17),(1,20,'Medical 2',18),(1,20,'Medical 3',19),(1,20,'Medical 4',20),(1,14,'Medical 1',21),
(1,14,'Medical 2',22),(1,14,'Medical 3',23),(1,12,'Medical 1',24),(1,12,'Medical 2',25),(1,27,'Medical 1',26),(1,27,'Medical 2',27),(1,34,'Medical 1',28),
(1,34,'Medical 2',29),(1,23,'Medical 1',30),(1,23,'Medical 2',31),(1,17,'Group hospital',32),(1,1,'7AM Care Giver',33),(1,1,'10AM Care Giver',34),
(1,1,'In training',35),(1,1,'Others',36),(1,10,'7AM Care Giver',37),(1,10,'10AM Care Giver',38),(1,32,'7AM Care Giver',39),(1,32,'Care Giver',40),
(1,32,'10AM Care Giver',41),(1,30,'7AM Care Giver',42),(1,30,'10AM Care Giver',43),(1,20,'AM Care Giver - I05',44),(1,20,'AM Care Giver - I06',45),
(1,20,'AM Care Giver - I07',46),(1,20,'AM Care Giver - I08',47),(1,20,'AM Care Giver - Ix1',48),(1,20,'AM Care Giver - Ix3',49),(1,20,'PM Care Giver - Ix2',50),
(1,20,'PM Care Giver - I01',51),(1,20,'PM Care Giver - I02',52),(1,20,'In training',53),(1,20,'PM Care Giver',54),(1,14,'Area Manager',55),(1,14,'Area coordinator',56),
(1,14,'Care giver 1 - C01',57),(1,14,'Care giver 2 - C02',58),(1,14,'Care giver 3 - C03',59),(1,14,'Care giver 4 - C04',60),(1,14,'In training',61),
(1,14,'Other',62),(1,14,'LSA',63),(1,14,'Care Giver',64),(1,13,'Care Giver',65),(1,28,'Care Giver',66),(1,35,'Group Shelter',67),(1,18,'Care giver 1',68),
(1,18,'Care giver 2',69),(1,18,'Care giver 3',70),(1,18,'Care giver 4',71),(1,18,'LSA',72),(1,37,'Care giver 1',73),(1,37,'Care giver 2',74),(1,37,'Care giver 3',75),
(1,37,'Care giver 4',76),(1,37,'LSA',77),(1,34,'Care giver 1',78),(1,34,'Care giver 2',79),(1,34,'Care giver 3',80),(1,34,'Care giver 4',81),(1,34,'LSA',82),
(1,19,'Kitchen 1',83),(1,19,'Kitchen 2',84),(1,19,'Clothes 1',85),(1,19,'Clothes 2',86),(1,19,'Clothes 3',87),(1,19,'Clothes 4',88),(1,19,'Cleaner',89),
(1,24,'Care Giver - N01',90),(1,24,'Care Giver - N02',91),(1,24,'Care Giver - N03',92),(1,24,'Care Giver - N04',93),(1,24,'Care Giver - N05',94),(1,24,'Care Giver - N06',95),
(1,24,'Care Giver - N07',96),(1,3,'Medical assistant',97),(1,3,'Care Giver 1',98),(1,3,'Care Giver 2',99),(1,4,'Care Giver 1',100),(1,4,'Care Giver 2',101),
(1,26,'Surgeon 1',102),(1,26,'Surgeon 2',103),(1,26,'Compounder 1',104),(1,26,'Compounder 2',105),(1,26,'Surgery Care 1',106),(1,26,'Surgery Care 2',107),
(1,26,'Autoclave',108),(1,16,'ED 1',109),(1,16,'ED 2',110),(1,16,'ED 3',111),(1,16,'ED 4',112),(1,16,'ED 5',113),(1,16,'ED 6',114),(1,16,'ED 7',115),
(1,16,'ED 8',116),(1,16,'ED 9',117),(1,16,'ED 10',118),(1,16,'ED 11',119),(1,16,'ED 12',120),(1,16,'ED 13',121),(1,16,'ED 14',122),(1,6,'Team 1',123),
(1,6,'Team 2',124),(1,6,'Team 3',125),(1,6,'Team 4',126),(1,6,'Team 5',127),(1,6,'Team 6',128),(1,6,'Team 7',129),(1,2,'Team 1',130),(1,36,'Team 1',131),
(1,36,'Team 2',132),(1,25,'Rescuer',133),(1,25,'Care giver',134),(1,7,'Animal Training (ED 8AM)',135),(1,7,'Animal Training (ED 9AM)',136),(1,7,'Animal Training (ED 10AM)',137),
(1,7,'Animal Training (ED 12PM)',138),(1,7,'Animal Training ',139),(1,7,'Animal Training',140),(1,11,'Calf feeding',141),(1,11,'Calf feeding - LSA',142),
(1,21,'Learning session - LSA',143),(1,22,'Compounder in training',144),(1,5,'Office 1',145),(1,5,'Office 2',146),(1,5,'Office 3',147),(1,5,'Junior Developer',148),
(1,5,'Software Developer',149),(1,5,'HR generalist',150),(1,5,'Staff Coordinator',151),(1,5,'HR Coordinator',152),(1,5,'HR assistant 2',153),(1,5,'HR assistant 3',154),
(1,5,'Staff Training',155),(1,5,'Accountant',156),(1,5,'Account Assistant',157),(1,5,'Medicine room',158),(1,5,'Stock assistant',159),(1,5,'Stock coordinator',160),
(1,5,'Vehicle mnt/Driver',161),(1,5,'Facilities Coordinator',162),(1,5,'FDR 1',163),(1,5,'FDR 2',164),(1,5,'FDR 3',165),(1,8,'Vol Cord 1',166),(1,8,'Vol Cord 2',167),
(1,8,'Vol Cord 6',168),(1,15,'Cruelty officer 1',169),(1,15,'Cruelty officer 2',170),(1,38,'Camera 1',171);
        
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

INSERT INTO AAU.RotationRoleShiftSegment (OrganisationId, RotationRoleId, StartTime, EndTime, SameDay, ShiftSegmentTypeId, IsDeleted) VALUES
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
