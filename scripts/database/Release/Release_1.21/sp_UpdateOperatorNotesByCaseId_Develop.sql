DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateOperatorNotesByCaseId !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateOperatorNotesByCaseId(
									IN prm_StreetTreatCaseId INT,
									IN prm_OperatorNotes TEXT
)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 30/08/2018
Purpose: Used to update a operator notes for a case
*/

DECLARE vEmNoExists INT;
DECLARE vSuccess INT;
SET vEmNoExists = 0;
SET vSuccess = 0;

SELECT COUNT(1) INTO vEmNoExists FROM AAU.StreetTreatCase WHERE CaseId = prm_CaseId;

IF vEmNoExists = 1 THEN

	UPDATE AAU.StreetTreatCase SET OperatorNotes		= prm_OperatorNotes
			WHERE CaseId = StreetTreatCase;
            
            
    SELECT 1 INTO vSuccess;

ELSEIF vEmNoExists >= 1 THEN

	SELECT 2 INTO vSuccess;

ELSE

	SELECT 3 INTO vSuccess;
END IF;

SELECT vSuccess;

END$$
DELIMITER ;
