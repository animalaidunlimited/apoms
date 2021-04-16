DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateTreatmentList_AcceptRejectMoveIn !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateTreatmentList_AcceptRejectMoveIn (
													IN prm_TreatmentListId INT,
                                                    IN prm_PatientId INT,
                                                    IN prm_Accepted TINYINT
													)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-04-11
Purpose: Procedure for updating accepting a moved in record from another area. This procedure also updates the moved out flag on the previous record.
*/

DECLARE vSuccess INT;
SET vSuccess = 0;

IF prm_Accepted = TRUE THEN

UPDATE AAU.TreatmentList
	SET InAccepted = prm_Accepted
WHERE TreatmentListId = prm_TreatmentListId;

ELSE

DELETE FROM AAU.TreatmentList WHERE TreatmentListId = prm_TreatmentListId;

END IF;



SELECT IF(ROW_COUNT() > 0, 1, 0) INTO vSuccess;

UPDATE AAU.TreatmentList
	SET OutAccepted = prm_Accepted,
    OutCensusAreaId = IF(prm_Accepted = FALSE, NULL, OutCensusAreaId)
WHERE	PatientId = prm_PatientId AND
		OutCensusAreaId IS NOT NULL;

SELECT IF(ROW_COUNT() > 0 AND vSuccess = 1, 1, 0) INTO vSuccess;

SELECT vSuccess AS success;

END $$