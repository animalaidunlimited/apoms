DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateVisitById !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateVisitById(
										IN prm_VisitId INT,
										IN prm_CaseId INT,
										IN prm_VisitDate DATE,
										IN prm_VisitTypeId INT,
										IN prm_StatusId INT,
										IN prm_AdminNotes TEXT,
										IN prm_OperatorNotes TEXT,
										IN prm_IsDeleted BOOLEAN
										)
BEGIN

DECLARE vVisitDateExists INT;
DECLARE vVisitExists INT;

SET vVisitDateExists = 0;
SET vVisitExists = 0;

SELECT COUNT(1) INTO vVisitDateExists FROM AAU.Visit WHERE	CaseId = prm_caseId AND
															VisitId <> prm_VisitId AND
                                                            Date = prm_VisitDate AND
                                                            isDeleted = 0;
                                                            
SELECT COUNT(1) INTO vVisitExists FROM AAU.Visit WHERE	VisitId = prm_VisitId;														
                                                        
														
IF vVisitDateExists = 0 AND vVisitExists = 1 THEN

UPDATE AAU.Visit SET
	CaseId			= prm_caseId,
	Date			= prm_VisitDate,
	VisitTypeId		= prm_VisitTypeId,
	StatusId		= prm_StatusId,
	AdminNotes		= prm_AdminNotes,
	OperatorNotes	= prm_OperatorNotes,
	IsDeleted		= prm_IsDeleted
WHERE VisitId = prm_VisitId;

SELECT 1 INTO prm_Success;

INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (NULL,prm_VisitId,'Visit','Update', NOW());

ELSEIF vVisitDateExists >= 1 AND vVisitExists = 1 THEN

SELECT 2 INTO prm_Success;

ELSEIF vVisitExists = 0 THEN

SELECT 3 INTO prm_Success;

ELSE

SELECT 4 INTO prm_Success;

END IF;

SELECT prm_VisitDate AS visitDate, prm_Success AS success;

END$$
DELIMITER ;
