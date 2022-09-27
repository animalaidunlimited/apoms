DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdatePrintTemplateElement!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdatePrintTemplateElement(
													IN prm_PrintTemplateElementId INT,
													IN prm_PrintTemplateId INT,
													IN prm_PrintableElementId INT,
													IN prm_Height DECIMAL(15,9),
													IN prm_Width DECIMAL(15,9),
													IN prm_Top DECIMAL(15,9),
													IN prm_Left DECIMAL(15,9),
													IN prm_ShowStyleBar BOOLEAN,
													IN prm_Bold BOOLEAN,
													IN prm_Italics BOOLEAN,
													IN prm_Underlined BOOLEAN,
													IN prm_FontSize DECIMAL(15,9),
													IN prm_Alignment VARCHAR(32))

BEGIN

/*
Created By: Jim Mackenzie
Created On: 22/09/20202
Purpose: Used to update print elements on a print template
*/

DECLARE vTemplateElementExists INT;
DECLARE vSuccess INT;

SET vSuccess = 0;

SELECT COUNT(1) INTO vTemplateElementExists FROM AAU.PrintTemplateElement WHERE PrintTemplateElementId = prm_PrintTemplateElementId;

IF vTemplateElementExists = 1 THEN

UPDATE AAU.PrintTemplateElement SET	
	Height			= prm_Height,
	Width			= prm_Width,
	Top				= prm_Top,
	`Left`			= prm_Left,
	ShowStyleBar	= prm_ShowStyleBar,
	Bold			= prm_Bold,
	Italics			= prm_Italics,
	Underlined		= prm_Underlined,
	FontSize		= prm_FontSize,
	Alignment		= prm_Alignment
WHERE PrintTemplateElementId = prm_PrintTemplateElementId;

SELECT 1 INTO vSuccess;

ELSEIF vTemplateElementExists = 0 THEN

SELECT 2 INTO vSuccess;

ELSEIF vTemplateElementExists > 1 THEN

SELECT 3 INTO vSuccess;

ELSE 

SELECT 4 INTO vSuccess;

END IF;

SELECT prm_PrintTemplateElementId as printTemplateElementId, vSuccess as success;


END $$
