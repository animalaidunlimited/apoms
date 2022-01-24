DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertReleaseDetails !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertReleaseDetails(IN prm_UserName NVARCHAR(45),
												IN prm_PatientId INT,
												IN prm_ComplainerNotes NVARCHAR(450),
												IN prm_ComplainerInformed TINYINT,
												IN prm_Releaser1Id INT,
												IN prm_Releaser2Id INT,
												IN prm_IsStreetTreatRelease TINYINT,
												IN prm_RequestedUser NVARCHAR(45),
												IN prm_RequestedDate DATETIME,
                                                IN prm_AssignedVehicleId INT,
                                                IN prm_AmbulanceAssignmentTime DATETIME
											)
BEGIN

/*
Created By: Arpit Trivedi
Created On: 21/11/20
Purpose: Used to insert a release of a patient.
*/

DECLARE vSuccess INT;
DECLARE vReleaseCount INT;
DECLARE vReleaseId INT;
DECLARE vOrganisationId INT;
DECLARE vUserId INT;
DECLARE vSocketEndPoint CHAR(3);
DECLARE vEmergencyCaseId INT;

SET vReleaseCount = 0;
SET vOrganisationId = 1;
SET vReleaseId = 0;
SET vSuccess = 0;

SELECT COUNT(1) INTO vReleaseCount FROM AAU.ReleaseDetails WHERE PatientId = prm_PatientId;

SELECT o.OrganisationId, u.UserId, o.SocketEndPoint INTO vOrganisationId, vUserId, vSocketEndPoint
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_RequestedUser LIMIT 1;

IF vReleaseCount = 0 THEN

INSERT INTO AAU.ReleaseDetails (OrganisationId,
								PatientId,
                                RequestedUser,
                                RequestedDate,
                                ComplainerNotes,
                                ComplainerInformed,
                                Releaser1Id,
                                Releaser2Id,
                                AssignedVehicleId,
								IsStreetTreatRelease,
                                AmbulanceAssignmentTime)
								VALUES
                                (vOrganisationId,
                                prm_PatientId,
                                vUserId,
                                prm_RequestedDate,
                                prm_ComplainerNotes,
                                IF(prm_ComplainerInformed,1,0),
                                prm_Releaser1Id,
                                prm_Releaser2Id,
                                prm_AssignedVehicleId,
								prm_IsStreetTreatRelease,
                                prm_AmbulanceAssignmentTime
                                );

SELECT LAST_INSERT_ID() INTO vReleaseId;
SELECT 1 INTO vSuccess;

INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_UserName,vReleaseId,'Release','Insert', NOW());

ELSEIF vReleaseCount > 0 THEN

SELECT 2 INTO vSuccess;

ELSE

SELECT 3 INTO vSuccess;

END IF;

SELECT EmergencyCaseId INTO vEmergencyCaseId FROM AAU.Patient WHERE PatientId = prm_PatientId;

CALL AAU.sp_GetOutstandingRescueByEmergencyCaseId(vEmergencyCaseId, prm_PatientId, 'Release');

SELECT vReleaseId, vSuccess AS success, vSocketEndPoint AS socketEndPoint;

END$$
DELIMITER ;
