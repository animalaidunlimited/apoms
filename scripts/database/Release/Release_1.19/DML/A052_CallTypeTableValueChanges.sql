DROP PROCEDURE IF EXISTS `?`;
DELIMITER //
CREATE PROCEDURE `?`()
BEGIN
	DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
	UPDATE AAU.CallType SET `CallType` = 'C - Update call' WHERE (`CallTypeId` = '1');
	UPDATE AAU.CallType SET `CallType` = 'C - Visit' WHERE (`CallTypeId` = '2');
	UPDATE AAU.CallType SET `CallType` = 'ED - Died call' WHERE (`CallTypeId` = '3');
	UPDATE AAU.CallType SET `CallType` = 'ED - Update call' WHERE (`CallTypeId` = '4');
	DELETE FROM AAU.CallType WHERE (`CallTypeId` = '6');
	DELETE FROM AAU.CallType WHERE (`CallTypeId` = '5');
END //
DELIMITER ;
CALL `?`();
DROP PROCEDURE `?`;	