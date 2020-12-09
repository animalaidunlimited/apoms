DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_InsertEmergencyCaller !!
DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertEmergencyCaller (IN prm_UserName VARCHAR(45),
											IN prm_EmergencyCaseId INT,
                                            IN prm_CallerId INT)
BEGIN

/*
Created By: Arpit Trivedi
Created On: 03/12/2020
Purpose: Used to insert EmergencyCaller.
*/

DECLARE vExists INT;
DECLARE InsertedId INT;
DECLARE Success INT;

SELECT COUNT(1) INTO vExists FROM AAU.EmergencyCaller 
WHERE EmergencyCaseId = prm_EmergencyCaseId AND CallerId = prm_CallerId;

IF vExists >= 0 THEN

INSERT INTO AAU.EmergencyCaller(EmergencyCaseId, CallerId)
VALUES (prm_EmergencyCaseId , prm_CallerId);

SELECT LAST_INSERT_ID() INTO InsertedId;
SELECT 1 INTO Success;

ELSE 

SELECT 3 INTO Success;

END IF;

SELECT InsertedId, Success;

END$$
DELIMITER ;
