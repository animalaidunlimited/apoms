DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertTreatmentListRecord !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_InsertTreatmentListRecord (	IN prm_PatientId INT,
													IN prm_Admission TINYINT,
													IN prm_InCensusAreaId INT,
													IN prm_InDate DATETIME,
													IN prm_InAccepted TINYINT,
                                                    IN prm_PreviousArea INT
													)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-04-11
Purpose: Procedure for inserting admission and moved in records to the treatment list.
*/

DECLARE vExistingRecord INT;
SET vExistingRecord = 0;

SELECT COUNT(1) INTO vExistingRecord FROM AAU.TreatmentList WHERE InCensusAreaId = prm_PreviousArea AND CAST(InDate AS DATE) = CAST(prm_InDate AS DATE);

IF vExistingRecord = 0 THEN

INSERT INTO AAU.TreatmentList (PatientId, Admission, InCensusAreaId, InDate, InAccepted)
VALUES (prm_PatientId, prm_Admission, prm_InCensusAreaId, prm_InDate, NULLIF(prm_InAccepted, FALSE));

ELSE

UPDATE AAU.TreatmentList SET InCensusAreaId = prm_InCensusAreaId WHERE PatientId = prm_PatientId AND InAccepted IS NULL;

END IF;

SELECT LAST_INSERT_ID() AS `TreatmentListId`, 1 AS `Success`;

END $$







