DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateTreatmentList_MoveOut !!

DELIMITER $$

CREATE PROCEDURE AAU.sp_UpdateTreatmentList_MoveOut (
													IN prm_TreatmentListId INT,
													IN prm_OutCensusAreaId INT,
													IN prm_OutDate DATETIME
													)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-04-11
Purpose: Procedure for updating the treatment list to move a patient out of an area. A moved in record can only be added with sp_InsertTreatmentListRecord .
*/


UPDATE AAU.TreatmentList SET
			InCensusAreaId = IF(Admission = 1 AND InAccepted != 1, prm_OutCensusAreaId, InCensusAreaId),
			OutCensusAreaId = IF(InAccepted = 1, prm_OutCensusAreaId, NULL),
			OutDate = IF(InAccepted = 1, prm_OutDate, NULL),
            OutAccepted = NULL
            -- OutCensusAreaId = prm_OutCensusAreaId,
            -- OutDate = prm_OutDate
WHERE TreatmentListId = prm_TreatmentListId;

SELECT IF(ROW_COUNT() > 0, 1, 0) AS `success`;

END $$