DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateTreatmentList_AcceptRejectMoveIn !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateTreatmentList_AcceptRejectMoveIn(
													IN prm_UserName VARCHAR(45),
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
DECLARE vSocketEndpoint VARCHAR(64);
DECLARE vRejectedFrom VARCHAR(100);
DECLARE vRejectedFromTreatmentAreaId INT;
SET vSuccess = 0;

SELECT SocketEndPoint INTO vSocketEndPoint
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT ta.TreatmentAreaId, ta.TreatmentArea INTO vRejectedFromTreatmentAreaId, vRejectedFrom FROM AAU.TreatmentList tl
INNER JOIN AAU.TreatmentArea ta ON ta.TreatmentAreaId = tl.InTreatmentAreaId WHERE tl.TreatmentListId = prm_TreatmentListId;

IF prm_Accepted = TRUE THEN

UPDATE AAU.TreatmentList
	SET InAccepted = prm_Accepted,
    OutTreatmentAreaId = IF(OutAccepted = 0, NULL, OutAccepted),
    OutDate = IF(OutAccepted = 0, NULL, OutDate),
    OutAccepted = IF(OutAccepted = 0, NULL, OutAccepted)
WHERE TreatmentListId = prm_TreatmentListId;

SELECT IF(ROW_COUNT() > 0, 1, 0) INTO vSuccess;

ELSE

DELETE FROM AAU.TreatmentList WHERE TreatmentListId = prm_TreatmentListId;

SELECT IF(ROW_COUNT() > 0, 1, 0) INTO vSuccess;

END IF;

UPDATE AAU.TreatmentList
	SET OutAccepted = prm_Accepted
WHERE	PatientId = prm_PatientId AND
		OutAccepted IS NULL AND
		OutTreatmentAreaId IS NOT NULL;

SELECT vSuccess AS success, vSocketEndPoint as socketEndPoint, vRejectedFrom as actionedByArea, vRejectedFromTreatmentAreaId as actionedByAreaId;

END$$
DELIMITER ;
