DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_InsertSurgery !!
DELIMITER $$

CREATE PROCEDURE AAU.sp_InsertSurgery(
										IN prm_UserName VARCHAR(45) ,
										IN prm_PatientId INT,                                     
                                        IN prm_SurgeryDate DATETIME,
                                        IN prm_SurgeonId INT,
										IN prm_SurgerySiteId INT,
										IN prm_AnesthesiaMinutes INT,
										IN prm_SurgeryTypeId INT,
                                        IN prm_DiedDate DATETIME,
                                        IN prm_DiedComment VARCHAR(100),
                                        IN prm_AntibioticsGiven INT,
                                        IN prm_Comment VARCHAR(100))
BEGIN
/*
Created By: Jim Mackenzie
Created On: 22/08/2018
Purpose: Used to update a user by id.
*/
DECLARE vSurgeryCount INT;
DECLARE vOrganisationId INT;
DECLARE vSurgeryId INT;
DECLARE Success INT;


SET vOrganisationId = 1;
SET vSurgeryCount = 0;
SET vSurgeryId = 0;

SELECT COUNT(1) INTO vSurgeryCount FROM AAU.surgery WHERE SurgeryId = vSurgeryId;
SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

IF vSurgeryCount = 0 THEN
INSERT INTO AAU.Surgery (PatientId,
						OrganisationId,
                       SurgeryDate,
                       SurgeonId,
                       SurgerySiteId,
                       AnesthesiaMinutes,
                       SurgeryTypeId,
                       DiedDate,
                       DiedComment,
                       AntibioticsGiven,
                       Comment)
				VALUES
						(
                        prm_PatientId,
                        vOrganisationId,
                        prm_SurgeryDate,
                        prm_SurgeonId,
						prm_SurgerySiteId,
						prm_AnesthesiaMinutes,
						prm_SurgeryTypeId,
                        prm_DiedDate,
                        prm_DiedComment,
                        prm_AntibioticsGiven,
                        prm_Comment);
SELECT LAST_INSERT_ID() INTO vSurgeryId;
SELECT 1 INTO Success;


ELSEIF vSurgeryCount > 0 THEN

SELECT 2 INTO Success;

ELSE

SELECT 3 INTO Success;

END IF;

SELECT vSurgeryId AS surgeryId, Success AS success;


END$$
DELIMITER ;