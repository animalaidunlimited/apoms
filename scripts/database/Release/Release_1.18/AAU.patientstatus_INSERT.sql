DROP PROCEDURE IF EXISTS `?`;
DELIMITER //
CREATE PROCEDURE `?`()
BEGIN
DECLARE statusExsits INT;
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  SELECT count(1) INTO statusExsits FROM AAU.PatientStatus WHERE PatientStatus='StreetTreat';
IF statusExsits = 0 THEN
	INSERT INTO AAU.PatientStatus (`OrganisationId`, `PatientStatus`, `IsDeleted`) VALUES ('1', 'StreetTreat', '0');
END IF;
END //
DELIMITER ;
CALL `?`();
DROP PROCEDURE `?`;	