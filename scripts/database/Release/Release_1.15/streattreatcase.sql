CREATE TABLE AAU.streattreatcase (
  `StreatTreatCaseId` INT NOT NULL AUTO_INCREMENT,
  `PriorityId` INT NULL,
  `StatusId` INT NULL,
  `TeamId` INT NULL,
  `MainProblemId` INT NULL,
  `AdminNotes` TEXT NULL,
  `OperatorNotes` TEXT NULL,
  `ClosedDate` DATE NULL,
  `EarlyReleaseFlag` TINYINT(1) NULL,
  `IsDeleted` TINYINT(1) NULL,
  `PatientId` INT NULL,
  PRIMARY KEY (`StreatTreatCaseId`));