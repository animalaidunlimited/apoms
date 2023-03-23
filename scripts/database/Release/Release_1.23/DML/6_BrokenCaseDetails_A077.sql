DROP TABLE IF EXISTS `AAU`.`BrokenCaseDetails`;

CREATE TABLE `AAU`.`BrokenCaseDetails` (
  `BrokenCaseDetailsId` INT NOT NULL AUTO_INCREMENT,
  `OrganisationId` INT NOT NULL,
  `EmergencyCaseId` INT NOT NULL,
  `Issue` VARCHAR(100) NOT NULL,  
  `Updated` TINYINT NULL DEFAULT 0,
  `CreatedDate` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`BrokenCaseDetailsId`),
  INDEX `FK_BrokenCaseDetails_EmergencycaseId_idx` (`EmergencyCaseId` ASC) VISIBLE,
  CONSTRAINT `FK_BrokenCaseDetails_EmergencycaseIdd`
    FOREIGN KEY (`EmergencyCaseId`)
    REFERENCES `AAU`.`EmergencyCase` (`EmergencyCaseId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,    
  INDEX `FK_BrokenCaseDetails_Organisation_OrganisationId_idx` (`OrganisationId` ASC) VISIBLE,
  CONSTRAINT `FK_BrokenCaseDetails_Organisation_OrganisationId`
    FOREIGN KEY (`OrganisationId`)
    REFERENCES `AAU`.`Organisation` (`OrganisationId`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION 
    );