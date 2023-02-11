DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertRotaDayAssignment !!

-- CALL AAU.sp_InsertRotaDayAssignment("Jim",0,"2022-11-14",10,0,12,null,null,"","",null,"");

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertRotaDayAssignment( 
													IN prm_Username VARCHAR(45),
													IN prm_RotaDayDate DATE,
													IN prm_RotationPeriodId INT,
													IN prm_RotationRoleId INT,
													IN prm_UserId INT,
													IN prm_RotationUserId INT,
													IN prm_Notes VARCHAR(1024) CHARACTER SET UTF8MB4
)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 03/12/2022
Purpose: Add a single new rota day assignment to a particular rota day.

*/

DECLARE vRotaDayAssignmentExists INT;
DECLARE vRotaDayId INT;
DECLARE vRotationRoleId INT;
DECLARE vSuccess INT;
DECLARE vOrganisationId INT;
DECLARE vTimeNow DATETIME;

SET vRotaDayAssignmentExists = 0;
SET vSuccess = 0;
SET vRotaDayId = 0;

SELECT o.OrganisationId, CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vOrganisationId, vTimeNow
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId WHERE u.UserName = prm_Username;

SELECT COUNT(1) INTO vRotaDayAssignmentExists FROM AAU.RotaDayAssignment WHERE	RotaDayDate = prm_RotaDayDate AND
																				RotationPeriodId = prm_RotationPeriodId AND
                                                                                RotationRoleId = prm_RotationRoleId AND
                                                                                UserId = prm_UserId AND
																				IsDeleted = 0;

IF vRotaDayAssignmentExists = 0 THEN

INSERT INTO AAU.RotaDayAssignment
(
	RotaDayDate,
	RotationPeriodId,
	RotationRoleId,
	UserId,
	RotationUserId,
	Notes
)
VALUES
(
	prm_RotaDayDate,
	prm_RotationPeriodId,
	prm_RotationRoleId,
	prm_UserId,
	prm_RotationUserId,
	prm_Notes
);

SELECT LAST_INSERT_ID() INTO vRotaDayId;

SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotaDayId,'RotaDayAssignment','Insert - Single', vTimeNow);

ELSE

SELECT 2 INTO vSuccess;

END IF;

SELECT vRotaDayId AS `rotaDayId`, vSuccess AS `success`;

END$$

