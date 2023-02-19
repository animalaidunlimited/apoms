DROP PROCEDURE IF EXISTS `?`;
DELIMITER //
CREATE PROCEDURE `?`()
BEGIN
  DECLARE vJobTypeCount INT;  
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
  
  SET vJobTypeCount = 0;
  
  -- NEED TO CHECK THE RELEASE MANAGER = ID 10 AND SCHEDULE MANAGER = ID 11

    
	ALTER TABLE `AAU`.`JobType` ADD INDEX `UQ_JobTypeForOrganisation` (`OrganisationId` ASC, `Title` ASC) VISIBLE;
    
    SELECT COUNT(1) INTO vJobTypeCount FROM AAU.JobType WHERE Title = 'Schedule manager';    
    
    IF vJobTypeCount = 0 THEN
		INSERT INTO AAU.JobType (OrganisationId, Title) VALUES (1, 'Schedule manager');
	END IF; 
  
END //
DELIMITER ;
CALL `?`();
DROP PROCEDURE `?`;

/*
ALTER TABLE `AAU`.`User` MODIFY COLUMN `FixedDayOff` JSON NOT NULL;

8	1	Surgeon	0		2020-06-30 12:02:44
10	1	Release manager	0		2023-02-14 10:21:09
11	1	Schedule manager	0		2023-02-14 10:17:41
*/