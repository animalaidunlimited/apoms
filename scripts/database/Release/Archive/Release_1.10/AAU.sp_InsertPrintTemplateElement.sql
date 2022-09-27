DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertPrintTemplateElement!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertPrintTemplateElement(
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
Purpose: Used to insert print elements to a print template
*/

INSERT INTO AAU.PrintTemplateElement
	(
		PrintTemplateId,
		PrintableElementId,
		Height,
		Width,
		Top,
		`Left`,
		ShowStyleBar,
		Bold,
		Italics,
		Underlined,
		FontSize,
		Alignment
	)
VALUES
	(
		prm_PrintTemplateId,
		prm_PrintableElementId,
		prm_Height,
		prm_Width,
		prm_Top,
		prm_Left,
		prm_ShowStyleBar,
		prm_Bold,
		prm_Italics,
		prm_Underlined,
		prm_FontSize,
		prm_Alignment
	);

SELECT LAST_INSERT_ID() as printTemplateElementId, 1 as success;


END $$
