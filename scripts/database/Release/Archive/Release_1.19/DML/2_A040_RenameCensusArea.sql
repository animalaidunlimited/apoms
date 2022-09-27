ALTER TABLE `AAU`.`CensusArea` 
DROP FOREIGN KEY `FK_CensusAreaOrganisation_OrganisationOrganisationId`;
ALTER TABLE `AAU`.`CensusArea` RENAME INDEX `FK_CensusAreaOrganisation_OrganisationOrganisationId_idx` TO `FK_TreatmentAreaOrganisation_OrganisationOrganisationId_idx`;
ALTER TABLE `AAU`.`CensusArea` ALTER INDEX `FK_TreatmentAreaOrganisation_OrganisationOrganisationId_idx` VISIBLE, RENAME TO  `AAU`.`TreatmentArea` ;
ALTER TABLE `AAU`.`TreatmentArea` 
ADD CONSTRAINT `FK_TreatmentAreaOrganisation_OrganisationOrganisationId`
  FOREIGN KEY (`OrganisationId`)
  REFERENCES `AAU`.`Organisation` (`OrganisationId`);
