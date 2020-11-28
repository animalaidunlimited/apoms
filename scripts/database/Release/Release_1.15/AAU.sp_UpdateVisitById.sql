
DROP PROCEDURE IF EXISTS AAU.sp_UpdateVisitById;


DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateVisitById(
										IN prm_VisitId INT
										)
BEGIN
DECLARE prm_Success INT;
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

END$$

