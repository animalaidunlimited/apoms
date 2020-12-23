DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_UpdateSurgeryByID !!
DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateSurgeryByID(In prm_UserName VARCHAR(45),
										IN prm_SurgeryId INT,
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
Created By: Arpit Trivedi
Created On: 22/04/2020
Purpose: Used to update a surgery by id.
*/
DECLARE vSurgeryCount INT;
DECLARE vSuccess INT;
SET vSurgeryCount = 0;

SELECT COUNT(1) INTO vSurgeryCount FROM AAU.Surgery WHERE SurgeryId = prm_SurgeryId;

IF vSurgeryCount = 1 THEN

UPDATE AAU.surgery
		SET	
            SurgeryDate	= prm_SurgeryDate,
            SurgeonId	= prm_SurgeonId,
			SurgerySiteId = prm_SurgerySiteId,
			AnesthesiaMinutes = prm_AnesthesiaMinutes,
            SurgeryTypeId = prm_SurgeryTypeId,
			DiedDate	= prm_DiedDate,
            DiedComment = prm_DiedComment,
            AntibioticsGiven = prm_AntibioticsGiven,
            Comment = prm_Comment
	WHERE SurgeryId = prm_SurgeryId;

SELECT 1 INTO vSuccess; -- Surgery update OK.

ELSEIF vSurgeryCount = 0 THEN

SELECT 2 INTO vSuccess; -- Surgery Doesn't exist

ELSE

SELECT 3 INTO vSuccess; -- Return misc 

END IF;

SELECT prm_SurgeryId AS surgeryId, vSuccess AS success;

END$$
DELIMITER ;