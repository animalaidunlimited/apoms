CREATE TABLE IF NOT EXISTS AAU.PatientOutcomeDetails (
  `PatientOutcomeDetailsId` INT NOT NULL AUTO_INCREMENT,
  `PatientId` INT NOT NULL,
  `Megavac1Date` DATE NULL,
  `Megavac2Date` DATE NULL,
  `RabiesVaccinationDate` DATE NULL,
  `Antibiotics1Id` INT NULL,
  `Antibiotics2Id` INT NULL,
  `Antibiotics3Id` INT NULL,
  `IsoReasonId` INT NULL,
  PRIMARY KEY (`PatientOutcomeDetailsId`),
  INDEX `FK_PatientId_PatientPatientId_idx` (`PatientId` ASC) VISIBLE,
  CONSTRAINT `FK_PatientId_PatientPatientId`
    FOREIGN KEY (`PatientId`)
    REFERENCES AAU.Patient (`PatientId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
