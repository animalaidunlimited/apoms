DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_InsertVisit!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertVisit(
	IN prm_StreatTreatCaseId INT,
	IN prm_VisitDate DATE,
	IN prm_VisitTypeId INT,
	IN prm_StatusId INT,
	IN prm_AdminNotes TEXT,
	IN prm_OperatorNotes TEXT,
	IN prm_IsDeleted BOOLEAN,
	IN prm_Day TINYINT(2)
)
BEGIN

DECLARE vVisitExisits INT;
DECLARE prm_OutVisitDate DATE;
DECLARE prm_VisitId INT;
DECLARE vSuccess TINYINT(1);

SET vVisitExisits = 0;

SELECT prm_VisitDate INTO prm_OutVisitDate;

SELECT COUNT(1) INTO vVisitExisits FROM AAU.Visit  WHERE StreatTreatCaseId = prm_StreatTreatCaseId AND Date = prm_VisitDate AND IsDeleted = 0 AND Day = prm_day ;

IF vVisitExisits = 0 THEN

	INSERT INTO AAU.Visit 	(
							StreatTreatCaseId,
							VisitTypeId,
							Date,
							StatusId,
							AdminNotes,
							OperatorNotes,
                            IsDeleted,
                            Day
                            )
				VALUES		
							(
                            prm_StreatTreatCaseId,
                            prm_VisitTypeId,
							prm_VisitDate,							
							prm_StatusId,
							prm_AdminNotes,
							prm_OperatorNotes,
							prm_IsDeleted,
                            prm_Day
                            );
                            
    SELECT LAST_INSERT_ID() INTO prm_VisitId;    
    SELECT 1 INTO vSuccess;
    
	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (NULL,prm_VisitId,'Visit','Insert', NOW());
        
           
ELSEIF vVisitExisits >= 1 THEN
	
    SELECT 2 INTO vSuccess;
  
ELSE 
	
    SELECT 3 INTO vSuccess;
END IF;
SELECT vSuccess;

END$$