CREATE TABLE IF NOT EXISTS AAU.CrueltyReport (
  `CrueltyReportId` INT NOT NULL AUTO_INCREMENT,
  `PatientId` INT NOT NULL,
  `CrueltyDate` DATE NOT NULL,
  `CrueltyReport` NVARCHAR(2000) NOT NULL,
  `PostCrueltyReport` NVARCHAR(2000) NULL,
  `CrueltyCode` VARCHAR(64) NULL,
  `AnimalCondition` VARCHAR(64) NULL,
  `CrueltyInspectorUserId` INT NOT NULL,
  `NameOfAccused` VARCHAR(128) NULL,
  `MobileNumberOfAccused` VARCHAR(64) NULL,
  `FIRNumber` VARCHAR(64) NULL,
  `Act` VARCHAR(64) NULL,
  `PoliceComplaintNumber` VARCHAR(64) NULL,
  `PoliceStation` VARCHAR(256) NULL,
  `PoliceOfficerName` VARCHAR(128) NULL,
  `PoliceOfficerDesignation` VARCHAR(64) NULL,
  `PoliceOfficerNumber` VARCHAR(64) NULL,
  `ActionTaken` VARCHAR(1000) NULL,
  `AnimalLocationAfterAction` VARCHAR(1000) NULL,
  PRIMARY KEY (`CrueltyReportId`),
  INDEX `FK_idx` (`PatientId` ASC) VISIBLE,
  INDEX `FK_CrueltyInspectorId_UserUserId_idx` (`CrueltyInspectorUserId` ASC) VISIBLE,
  CONSTRAINT `FK_CrueltyReportPatientId_PatientPatientId`
    FOREIGN KEY (`PatientId`)
    REFERENCES AAU.Patient (`PatientId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_CrueltyInspectorId_UserUserId`
    FOREIGN KEY (`CrueltyInspectorUserId`)
    REFERENCES AAU.User (`UserId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);