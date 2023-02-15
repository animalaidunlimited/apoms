DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertScheduleAuthorisation!!

-- CALL AAU.sp_InsertScheduleAuthorisation('Jim', 1);

-- TRUNCATE TABLE AAU.RotaDayAuthorisation; 



DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertScheduleAuthorisation(
		IN prm_Username VARCHAR(45),
        IN prm_RotationPeriodId INT
)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 14/02/2023
Purpose: Procedure to insert authorisation for all rota days in a rotation period.
*/

DECLARE vSuccess INT;
DECLARE vRotationAreaId INT;
DECLARE vRotationPeriodExists INT;
DECLARE vOrganisationId INT;
DECLARE vTimeNow DATETIME;

SELECT u.OrganisationId, CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vOrganisationId, vTimeNow
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT COUNT(1) INTO vRotationPeriodExists FROM AAU.RotaDayAuthorisation WHERE RotationPeriodId = prm_RotationPeriodId;

IF ( vRotationPeriodExists = 0 ) THEN

	
	INSERT INTO AAU.RotaDayAuthorisation (OrganisationId, RotationPeriodId, RotaDayDate, ManagerAuthorisation)
	SELECT
	vOrganisationId,
	p.RotationPeriodId,
	DATE_ADD(p.StartDate, INTERVAL t.Id DAY) AS `RotaDayDate`,
	a.`authorisation`
	FROM AAU.RotationPeriod p
	INNER JOIN AAU.Tally t ON t.Id <= (DATEDIFF(p.EndDate, p.StartDate))
	CROSS JOIN (
					SELECT 
						JSON_ARRAYAGG(
						JSON_MERGE_PRESERVE(
						JSON_OBJECT("scheduleManagerId", ujt.UserId),
						JSON_OBJECT("scheduleManager", CONCAT(u.EmployeeNumber,' - ', u.FirstName)),
						JSON_OBJECT("areaList", ma.AreaList),
						JSON_OBJECT("authorised", CAST(false AS JSON)))) AS `authorisation`
					FROM AAU.UserJobType ujt
					INNER JOIN AAU.User u ON u.UserId = ujt.UserId
					LEFT JOIN (
						SELECT ra.ScheduleManagerId, GROUP_CONCAT(ra.RotationArea) AS `AreaList`
						FROM AAU.RotationArea ra
						WHERE ra.ScheduleManagerId IS NOT NULL
						GROUP BY ra.ScheduleManagerId
                    ) ma ON ma.ScheduleManagerId = u.UserId
					WHERE ujt.JobTypeId = 11
				) a
	WHERE p.RotationPeriodId = prm_RotationPeriodId;  

    
    
    
    
-- 	SELECT
-- 	vOrganisationId,
-- 	p.RotationPeriodId,
-- 	DATE_ADD(p.StartDate, INTERVAL t.Id DAY) AS `RotaDayDate`,
-- 	a.`authorisation`
-- 	FROM AAU.RotationPeriod p
-- 	INNER JOIN AAU.Tally t ON t.Id <= (DATEDIFF(p.EndDate, p.StartDate))
-- 	CROSS JOIN (
-- 					SELECT 
-- 						JSON_ARRAYAGG(
-- 						JSON_MERGE_PRESERVE(
-- 						JSON_OBJECT("scheduleManagerId", ujt.UserId),
--                         JSON_OBJECT("scheduleManager", CONCAT(u.EmployeeNumber,' - ', u.FirstName)),
-- 						JSON_OBJECT("authorised", CAST(false AS JSON)))) AS `authorisation`
-- 					FROM AAU.UserJobType ujt
--                     INNER JOIN AAU.User u ON u.UserId = ujt.UserId
-- 					WHERE ujt.JobTypeId = 11
-- 				) a
-- 	WHERE p.RotationPeriodId = prm_RotationPeriodId;    

    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,prm_RotationPeriodId,'Rota Day Authorisation','Insert', vTimeNow); 

ELSE

SELECT 2 INTO vSuccess;

END IF;
    
	SELECT vSuccess AS success;
    
END$$

DELIMITER ;
