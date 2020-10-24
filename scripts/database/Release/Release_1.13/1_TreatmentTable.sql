CREATE TABLE IF NOT EXISTS AAU.Treatment (
  `TreatmentId` INT NOT NULL AUTO_INCREMENT,
  `PatientId` INT NOT NULL,
  `TreatmentDate` DATETIME NOT NULL,
  `NextTreatmentDate` DATETIME NULL,
  `EyeDischargeId` INT NULL,
  `NasalDischargeId` INT NULL,
  `Comment` NVARCHAR(1024) NULL,
  PRIMARY KEY (`TreatmentId`),
  INDEX `FK_TreatmentPatientId_PatientPatientId_idx` (`PatientId` ASC) VISIBLE,
  CONSTRAINT `FK_TreatmentPatientId_PatientPatientId`
    FOREIGN KEY (`PatientId`)
    REFERENCES AAU.Patient (`PatientId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
