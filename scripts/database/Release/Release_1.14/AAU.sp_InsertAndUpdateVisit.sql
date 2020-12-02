DROP procedure IF EXISTS AAU.sp_InsertAndUpdateVisit;

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertAndUpdateVisit(
	IN prm_StreetTreatCaseId INT,
    IN prm_VisitId INT,
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
DECLARE vSuccess TINYINT(1);

SET vVisitExisits = 0;

SELECT COUNT(1) INTO vVisitExisits 
	FROM 
    AAU.Visit 
    WHERE 
    VisitId = prm_VisitId 
    AND 
    StreetTreatCaseId = prm_StreetTreatCaseId
    AND (IsDeleted = 0 OR IsDeleted IS NULL) ;

IF vVisitExisits = 0 AND prm_VisitId IS NULL THEN

	INSERT INTO AAU.Visit	(
								StreetTreatCaseId,
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
								prm_StreetTreatCaseId,
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

	UPDATE AAU.Visit 
		SET
			VisitTypeId= prm_VisitTypeId,
            Date = prm_VisitDate,
            StatusId = prm_StatusId,
            AdminNotes = prm_AdminNotes,
            OperatorNotes = prm_OperatorNotes,
            IsDeleted = prm_IsDeleted,
            Day = prm_Day
		WHERE
			VisitTypeId= prm_VisitTypeId AND StreetTreatCaseId = prm_StreetTreatCaseId;

    SELECT 2 INTO vSuccess;

ELSE 
	
    SELECT 3 INTO vSuccess;
END IF;
SELECT vSuccess;

END$$

