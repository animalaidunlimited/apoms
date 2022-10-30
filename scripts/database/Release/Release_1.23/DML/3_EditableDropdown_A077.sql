DROP PROCEDURE IF EXISTS `?`;
DELIMITER //
CREATE PROCEDURE `?`()
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  
	ALTER TABLE `AAU`.`EditableDropdown`
	ADD COLUMN `OrganisationId` INT NOT NULL AFTER `EditableDropdownId`,
	ADD INDEX `FK_EditableDropdown_Organisation_OrganisationId_idx` (`OrganisationId` ASC) VISIBLE;

	UPDATE `AAU`.`EditableDropdown` SET OrganisationId = 1;

	ALTER TABLE `AAU`.`EditableDropdown`
	ADD CONSTRAINT `FK_EditableDropdown_Organisation_OrganisationId`
	  FOREIGN KEY (`OrganisationId`)
	  REFERENCES `AAU`.`Organisation` (`OrganisationId`)
	  ON DELETE NO ACTION
	  ON UPDATE NO ACTION;
  
END //
DELIMITER ;
CALL `?`();
DROP PROCEDURE `?`;



