DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_GetVisits !!

-- CALL AAU.sp_GetVisits(76, NULL,NULL,NULL)

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetVisits(	IN prm_StreetTreatCaseId INT,
									IN prm_TeamId INT,
									IN prm_VisitDateStart DATE,
									IN prm_VisitDateEnd DATE)
BEGIN


IF (prm_StreetTreatCaseId IS NOT NULL OR
prm_TeamId IS NOT NULL OR
(
prm_VisitDateStart IS NOT NULL AND
prm_VisitDateEnd IS NOT NULL
))
THEN

SELECT 						v.VisitId,
							v.StreetTreatCaseId,
							v.VisitTypeId,
                            vt.VisitType,
							v.Date,
							v.StatusId,
                            s.Status,
							IFNULL(v.AdminNotes,'') AS AdminNotes,
							IFNULL(v.OperatorNotes,'') AS OperatorNotes,
							v.IsDeleted
FROM AAU.Visit v
INNER JOIN AAU.VisitType vt ON vt.VisitTypeId = v.VisitTypeId
INNER JOIN AAU.Status s ON s.StatusId = v.StatusId
INNER JOIN AAU.StreetTreatCase c ON c.StreetTreatCaseId = v.StreetTreatCaseId
WHERE
	v.isDeleted = 0
    AND c.IsDeleted = 0
    AND
    v.Date <= IFNULL(c.ClosedDate,DATE_ADD(NOW(), INTERVAL 100 DAY))
    AND
	(
		c.StreetTreatCaseId = prm_StreetTreatCaseId
    OR
		prm_StreetTreatCaseId IS NULL
    )
	AND
    (
		v.Date BETWEEN prm_VisitDateStart AND prm_VisitDateEnd
	OR 
		(prm_VisitDateStart IS NULL AND prm_VisitDateEnd IS NULL)
	)
    AND
    (
		c.TeamId = prm_TeamId
    OR    
		prm_TeamId IS NULL
	OR
		prm_TeamId = 1
    );
END IF;
END$$
DELIMITER ;
