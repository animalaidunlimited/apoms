DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_DeletePrintTemplateElement!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_DeletePrintTemplateElement(IN prm_PrintTemplateElementId INT)

BEGIN

/*
Created By: Jim Mackenzie
Created On: 22/09/20202
Purpose: Used to delete print elements from a print template
*/

DECLARE vTemplateElementExists INT;
DECLARE vSuccess INT;

SET vSuccess = 0;

SELECT COUNT(1) INTO vTemplateElementExists FROM AAU.PrintTemplateElement WHERE PrintTemplateElementId = prm_PrintTemplateElementId;

IF vTemplateExists = 1 THEN

DELETE FROM AAU.PrintTemplateElement WHERE PrintTemplateElementId =  prm_PrintTemplateElementId;

SELECT 1 INTO vSuccess;

ELSEIF vTemplateExists > 0 THEN

SELECT 2 INTO vSuccess;

ELSE

SELECT 3 INTO vSuccess;

END IF;

SELECT vSuccess as success;


END $$
