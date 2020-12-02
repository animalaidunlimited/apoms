DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_UpdateVisitById!!


DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateVisitById(
										IN prm_VisitId INT
										)
BEGIN
DECLARE vSuccess INT;
DECLARE vVisitDateExists INT;
DECLARE vVisitExists INT;

SET vVisitExists = 0;

                                                            
SELECT 
    COUNT(1)
INTO vVisitExists FROM
    AAU.Visit
WHERE
    VisitId = prm_VisitId;														
                                                        
														
IF vVisitExists = 1 THEN

UPDATE AAU.Visit SET
	IsDeleted		= 1
WHERE VisitId = prm_VisitId;

SELECT 1 INTO vSuccess;

INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (NULL,prm_VisitId,'Visit','Update', NOW());

ELSEIF vVisitDateExists >= 1 AND vVisitExists = 1 THEN

SELECT 2 INTO vSuccess;

ELSEIF vVisitExists = 0 THEN

SELECT 3 INTO vSuccess;

ELSE

SELECT 4 INTO vSuccess;

END IF;
SELECT vSuccess;
END$$

