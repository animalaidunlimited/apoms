ALTER TABLE AAU.Rescuer ADD COLUMN Abbreviation CHAR(2) AFTER ImageURL;
ALTER TABLE AAU.Rescuer ADD COLUMN Colour CHAR(45) AFTER Abbreviation;


UPDATE `AAU`.`Rescuer` SET `Abbreviation` = 'BS' WHERE (`RescuerId` = '1');
UPDATE `AAU`.`Rescuer` SET `Abbreviation` = 'JD' WHERE (`RescuerId` = '2');
UPDATE `AAU`.`Rescuer` SET `Abbreviation` = 'KS' WHERE (`RescuerId` = '3');
UPDATE `AAU`.`Rescuer` SET `Abbreviation` = 'LS' WHERE (`RescuerId` = '4');
UPDATE `AAU`.`Rescuer` SET `Abbreviation` = 'KM' WHERE (`RescuerId` = '5');
UPDATE `AAU`.`Rescuer` SET `Abbreviation` = 'SF' WHERE (`RescuerId` = '7');