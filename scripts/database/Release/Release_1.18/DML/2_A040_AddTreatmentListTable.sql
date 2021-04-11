CREATE TABLE IF NOT EXISTS `AAU`.`TreatmentList` (
  `TreatmentListId` INT NOT NULL AUTO_INCREMENT,
  `PatientId` INT NOT NULL,
  `Admission` TINYINT NULL,
  `InCensusAreaId` INT NOT NULL,
  `InDate` DATETIME NOT NULL,
  `InAccepted` TINYINT NULL,
  `OutCensusAreaId` INT NULL,
  `OutDate` DATETIME NULL,
  `OutAccepted` TINYINT NULL,
  `OutOfHospital` TINYINT NULL,
  PRIMARY KEY (`TreatmentListId`),
  INDEX `FK_TreatmentListPatientId_PatientPatiendId_idx` (`PatientId` ASC) VISIBLE,
  INDEX `FK_TreatmentListInCensusAreaId_CensusAreaCensusAreaId_idx` (`InCensusAreaId` ASC) VISIBLE,
  INDEX `FK_TreatmentListOutCensusAreaId_CensusAreaCensusAreaId_idx` (`OutCensusAreaId` ASC) VISIBLE,
  CONSTRAINT `FK_TreatmentListPatientId_PatientPatiendId`
    FOREIGN KEY (`PatientId`)
    REFERENCES `AAU`.`Patient` (`PatientId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_TreatmentListInCensusAreaId_CensusAreaCensusAreaId`
    FOREIGN KEY (`InCensusAreaId`)
    REFERENCES `AAU`.`CensusArea` (`AreaId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_TreatmentListOutCensusAreaId_CensusAreaCensusAreaId`
    FOREIGN KEY (`OutCensusAreaId`)
    REFERENCES `AAU`.`CensusArea` (`AreaId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
