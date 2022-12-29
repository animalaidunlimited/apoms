DELIMITER !!

DROP FUNCTION IF EXISTS AAU.fn_CastTinyIntToJSONBoolean !!

-- SELECT AAU.fn_CastTinyIntToJSONBoolean(1)

DELIMITER $$
CREATE FUNCTION AAU.fn_CastTinyIntToJSONBoolean(prm_Value TINYINT) RETURNS JSON
    DETERMINISTIC
BEGIN

DECLARE vResult JSON;

	SELECT 
		CASE
			WHEN prm_Value = 1 THEN CAST(TRUE AS JSON)
			WHEN prm_Value = 0 THEN CAST(FALSE AS JSON)
			ELSE NULL
		END INTO vResult;
           
	RETURN(vResult);

END$$
DELIMITER ;
DELIMITER !!
DROP PROCEDURE IF EXISTS AAU.sp_CheckEmergencyNumberExists !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_CheckEmergencyNumberExists(
										IN prm_EmergencyNumber INT,
										IN prm_EmergencyCaseId INT,
										IN prm_Username VARCHAR(45))
BEGIN
/*
Created By: Jim Mackenzie
Created On: 02/03/2020
Purpose: Used to check the existance of a emergency number
*/

DECLARE vOrganisationId INT;
DECLARE vSuccess INT;
DECLARE vEmergencyNumberCount INT;

SET vEmergencyNumberCount = 0;
SET vSuccess = 0;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1; 

SELECT COUNT(1) INTO vEmergencyNumberCount FROM AAU.EmergencyCase WHERE EmergencyNumber = prm_EmergencyNumber
													AND OrganisationId = vOrganisationId
                                                    AND EmergencyCaseId != IFNULL(prm_EmergencyCaseId,-1);
                                                  
                                                    
IF vEmergencyNumberCount = 0 THEN
        
SELECT 0 INTO vSuccess;

ELSEIF vEmergencyNumberCount = 1 THEN

SELECT 1 INTO vSuccess;

ELSEIF vEmergencyNumberCount > 1 THEN

SELECT 2 INTO vSuccess;

ELSE

SELECT 3 INTO vSuccess;

END IF;

SELECT vSuccess AS `success`;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_DeletePatientById !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_DeletePatientById(IN prm_Username VARCHAR(64), IN prm_PatientId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to delete patient by id
*/

DECLARE vOrganisationId INT;
DECLARE vPatientCount INT;
DECLARE vSuccess INT;

SET vPatientCount = 0;
SET vSuccess = 0;

SELECT COUNT(1) INTO vPatientCount FROM AAU.Patient WHERE PatientId = prm_PatientId;                                                    
                                                    
IF vPatientCount > 0 THEN

UPDATE AAU.Patient SET
IsDeleted = 1,
DeletedDate = NOW()
WHERE PatientId = prm_PatientId;
		        
SELECT 1 INTO vSuccess;

  SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

  INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId,prm_Username,prm_PatientId,'Patient','Delete', NOW());
    
ELSE

SELECT 3 INTO vSuccess;

END IF;

SELECT prm_PatientId AS `patientId`, vSuccess AS `success`;


ENDDELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_DeletePatientProblems !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_DeletePatientProblems(IN prm_PatientId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to delete all animal problems by AnimalId
*/

DECLARE vPatientProblemCount INT;
DECLARE vSuccess INT;
SET vPatientProblemCount = 0;
SET vSuccess = 0;

SELECT COUNT(1) INTO vPatientProblemCount FROM AAU.PatientProblem WHERE PatientId = prm_PatientId;                                                    
                                                    
IF vPatientProblemCount > 0 THEN

START TRANSACTION;

DELETE FROM AAU.PatientProblem WHERE PatientId = prm_PatientId;
		
COMMIT;
        
SELECT 1 INTO vSuccess;

ELSE

SELECT 3 INTO vSuccess;

END IF;

SELECT vSuccess AS `success`;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_DeleteUserById !!

-- CALL AAU.sp_GetUsersByIdRange('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_DeleteUserById(IN prm_UserId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 22/08/2018
Purpose: Used to delete a user by UserId

Modified By: Jim Mackenzie
Modified On: 22/12/2022
Modification: Changed to return a result set instead of an out parameter
*/

-- Check that the user actually exists first.

DECLARE vUserExists INT;
DECLARE vSuccess INT;

SET vSuccess = 0;

SELECT COUNT(1) INTO vUserExists FROM AAU.User WHERE UserId = prm_UserId;

IF vUserExists = 1 THEN

	UPDATE AAU.User SET IsDeleted = 1 WHERE UserId = prm_UserId;
    SELECT 1 INTO vSuccess;
ELSE 
	SELECT -1 INTO vSuccess;
END IF;

SELECT vSuccess AS `success`;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetAreaShifts !!

-- CALL AAU.sp_GetAreaShifts(1);

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetAreaShifts( IN prm_RotaVersionId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/08/2022
Purpose: Retrieve a list of area shifts for a rota version.

*/

	SELECT IFNULL(
				JSON_ARRAYAGG(
				JSON_MERGE_PRESERVE(
				JSON_OBJECT("areaShiftId", a.AreaShiftId),
				JSON_OBJECT("rotationAreaId", ra.RotationAreaId),
				JSON_OBJECT("rotationAreaSortOrder", ra.SortOrder),
				JSON_OBJECT("areaShiftGUID", a.AreaShiftGUID),
				JSON_OBJECT("rotaVersionId", a.RotaVersionId),
				JSON_OBJECT("colour", a.Colour),
				JSON_OBJECT("sortOrder", a.Sequence),
				JSON_OBJECT("rotationRoleId", a.RotationRoleId),
				JSON_OBJECT("areaRowSpan", 0), -- We're going to handle this in the front end
				JSON_OBJECT("rotationArea", ra.RotationArea),
				JSON_OBJECT("rotationAreaColour", ra.Colour)
				)),"[]") AS `AreaShifts`
	FROM AAU.AreaShift a
		INNER JOIN AAU.RotationRole rr ON rr.RotationroleId = a.RotationroleId
		INNER JOIN AAU.RotationArea ra ON ra.RotationAreaId = rr.RotationAreaId    
		WHERE a.RotaVersionId = prm_RotaVersionId
		AND a.IsDeleted = 0;
    
END$$

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCallerById !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCallerById( IN prm_CallerId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a Caller by ID.

Modified By: Jim Mackenzie
Modified On: 22/12/2022
Modification: Removed unessecary success parameter
*/
SELECT	
	ecr.CallerId,
	c.Name,
	c.PreferredName,
	c.Number,
	c.AlternativeNumber,
	IF(ecr.PrimaryCaller = FALSE , 0 , 1) AS PrimaryCaller,
	c.Email,
	c.Address,
	c.CreatedDate,
	ecr.IsDeleted,
	ecr.DeletedDate
FROM AAU.Caller c
INNER JOIN AAU.EmergencyCaller ecr ON ecr.CallerId = c.CallerId
WHERE ecr.CallerId = prm_CallerId AND ecr.IsDeleted = 0;


END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetCurrentPatientsByEmergencyCaseId !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCurrentPatientsByEmergencyCaseId( IN prm_EmergencyCaseId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a patients by Emergency Case Id.

Modified By: Jim Mackenzie
Modified On: 28/02/2022
Modification: Replacing Position with GUID.

Modified By: Jim Mackenzie
Modified On: 22/12/2022
Modification: Removing out parameter
*/

SELECT
p.PatientId,
p.EmergencyCaseId,
p.GUID,
p.AnimalTypeId,
p.TagNumber
FROM AAU.Patient p
WHERE p.EmergencyCaseId = prm_EmergencyCaseId;

SELECT 1 AS `success`;


END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetDepartments !!

-- CALL AAU.sp_GetDepartments('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetDepartments( IN prm_Username VARCHAR(45))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 21/11/2022
Purpose: Retrieve a list of leave requests

*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT
			JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
			JSON_OBJECT("departmentId", d.DepartmentId),
			JSON_OBJECT("department", d.Department),
            JSON_OBJECT("colour", d.Colour),
			JSON_OBJECT("sortOrder", d.SortOrder)
			)) AS `Departments`
FROM AAU.Department d
WHERE d.OrganisationId = vOrganisationId
AND d.IsDeleted = 0;

END$$


DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetEditableDropdowns !!

-- CALL AAU.sp_GetEditableDropdowns('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetEditableDropdowns( IN prm_UserName VARCHAR(45))

BEGIN

/*
Created By: Jim Mackenzie
Created On: 2022-01-19
Description: Procedure for getting dropdowns that are editable for the organisation settings page.
*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT
	JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
	JSON_OBJECT("dropdown", Dropdown),
	JSON_OBJECT("displayName", DisplayName),
    JSON_OBJECT("request", Request),
    JSON_OBJECT("tableName", TableName)
	)) EditableDropdowns
FROM AAU.EditableDropdown;

END$$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetFestivals !!

-- CALL AAU.sp_GetFestivals('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetFestivals( IN prm_Username VARCHAR(45))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 21/11/2022
Purpose: Retrieve a list of leave requests

*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT
			JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
			JSON_OBJECT("festivalId", f.FestivalId),
			JSON_OBJECT("festival", f.Festival),
            JSON_OBJECT("localName", f.LocalName),
            JSON_OBJECT("noticeDaysRequired", f.NoticeDaysRequired),
			JSON_OBJECT("sortOrder", f.SortOrder)
			)) AS `Festivals`
FROM AAU.Festival f
WHERE f.OrganisationId = vOrganisationId
AND f.IsDeleted = 0;

END$$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetLeaveRequestProtocol !!

-- CALL AAU.sp_GetLeaveRequestProtocol('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetLeaveRequestProtocol( IN prm_Username VARCHAR(45))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 21/11/2022
Purpose: Retrieve a list of leave requests

*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT
			JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
			JSON_OBJECT("dayRangeStart", lrp.DayRangeStart),
			JSON_OBJECT("dayRangeEnd", lrp.DayRangeEnd),
            JSON_OBJECT("noticeDaysRequired", lrp.NoticeDaysRequired),
			JSON_OBJECT("sortOrder", lrp.SortOrder)
			)) AS `LeaveRequestProtocol`
FROM AAU.LeaveRequestProtocol lrp
WHERE lrp.OrganisationId = vOrganisationId
AND lrp.IsDeleted = 0;

END$$


DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetLeaveRequestReasons !!

-- CALL AAU.sp_GetLeaveRequestReasons('Jim');

DELIMITER $$
CREATE  PROCEDURE AAU.sp_GetLeaveRequestReasons(IN prm_UserName VARCHAR(45))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 20/11/2022
Purpose: Used to return list of leave request reasons
*/

DECLARE vOrganisationId INT;
SET vOrganisationId = 1;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

SELECT
	JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
	JSON_OBJECT("leaveRequestReasonId", LeaveRequestReasonId),
	JSON_OBJECT("leaveRequestReason", LeaveRequestReason),
    JSON_OBJECT("sortArea", SortOrder)
	)) LeaveRequestReasons
FROM AAU.LeaveRequestReason
WHERE OrganisationId = vOrganisationId
AND IsDeleted = 0;

END$$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetLeaveRequestsForUser !!

-- CALL AAU.sp_GetLeaveRequestsForUser(8);

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetLeaveRequestsForUser( IN prm_UserId  INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 22/11/2022
Purpose: Retrieve a list of leave requests for a user

*/

SELECT
			JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
			JSON_OBJECT("leaveRequestId", lr.LeaveRequestId),
            JSON_OBJECT("departmentId", d.DepartmentId),
			JSON_OBJECT("department", d.Department),
            JSON_OBJECT("departmentColour", d.Colour),
			JSON_OBJECT("userId", lr.UserId),
            JSON_OBJECT("userCode", CONCAT(u.employeeNumber,' - ', u.FirstName)),
			JSON_OBJECT("requestDate", lr.RequestDate),
            JSON_OBJECT("leaveRequestReasonId", lr.LeaveRequestReasonId),
			JSON_OBJECT("leaveRequestReason", CONCAT(lrr.LeaveRequestReason, IF(f.FestivalId IS NULL,'', CONCAT(' (',f.Festival,')')))),
			JSON_OBJECT("additionalInformation", lr.AdditionalInformation),
			JSON_OBJECT("leaveStartDate", lr.LeaveStartDate),
			JSON_OBJECT("leaveEndDate", lr.LeaveEndDate),
            JSON_OBJECT("numberOfDays", DATEDIFF(lr.LeaveEndDate, lr.LeaveStartDate) + 1),
			JSON_OBJECT("granted", lr.Granted),
			JSON_OBJECT("commentReasonManagementOnly", lr.CommentReasonManagementOnly),
			JSON_OBJECT("dateApprovedRejected", lr.DateApprovedRejected),
			JSON_OBJECT("recordedOnNoticeBoard", AAU.fn_CastTinyIntToJSONBoolean(lr.RecordedOnNoticeBoard)),
			JSON_OBJECT("isDeleted", lr.IsDeleted)
			)) AS `LeaveRequests`
FROM AAU.LeaveRequest lr
INNER JOIN AAU.LeaveRequestReason lrr ON lrr.LeaveRequestReasonId = lr.LeaveRequestReasonId
INNER JOIN AAU.User u ON u.UserId = lr.UserId
INNER JOIN AAU.Department d ON d.DepartmentId = u.DepartmentId
LEFT JOIN AAU.Festival f ON f.FestivalId = lr.FestivalId
WHERE lr.UserId = prm_UserId
AND lr.IsDeleted = 0;

END $$

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetLeaveRequests !!

-- CALL AAU.sp_GetLeaveRequests('Jim',null, null);

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetLeaveRequests( IN prm_Username VARCHAR(45), IN prm_StartDate DATE, IN prm_EndDate DATE)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 20/11/2022
Purpose: Retrieve a list of leave requests

*/


DECLARE vOrganisationId INT;

SELECT IF(prm_StartDate IS NULL, CURRENT_DATE(), prm_StartDate) INTO prm_StartDate;
SELECT IF(prm_EndDate IS NULL, DATE_ADD(CURRENT_DATE(), INTERVAL 2 YEAR), prm_EndDate) INTO prm_EndDate; 

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

-- INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
-- 		VALUES (prm_Username,-111,'Leave Request','Insert', NOW());

With RawCTE AS
(
SELECT
	lr.LeaveRequestId,
    d.DepartmentId,
	d.Department,
	d.Colour,
	lr.UserId,
	CONCAT(u.employeeNumber,' - ', u.FirstName) AS `UserCode`,
	lr.RequestDate,
	lr.LeaveRequestReasonId,
	CONCAT(lrr.LeaveRequestReason, IF(LOWER(lrr.LeaveRequestReason) = 'festival', CONCAT(' (', f.Festival,')'),'')) AS `LeaveRequestReason`,
            JSON_OBJECT("lastFestivalDetails", 
				JSON_MERGE_PRESERVE(
							JSON_OBJECT("requestDate", lrl.RequestDate),
							JSON_OBJECT("leaveStartDate", lrl.LeaveStartDate),
							JSON_OBJECT("leaveEndDate", lrl.LeaveEndDate),
							JSON_OBJECT("numberOfDays", DATEDIFF(lrl.LeaveEndDate, lrl.LeaveStartDate) + 1),
							JSON_OBJECT("granted", lrl.Granted),
							JSON_OBJECT("toolTip",CONCAT(
									"Previous ",
									f.Festival,
									IF(lrl.Granted = 1, " granted", " not granted"),
									". Started: ",
									lrl.LeaveStartDate,
									" for ",
									DATEDIFF(lrl.LeaveEndDate, lrl.LeaveStartDate) + 1,
									" day",
									IF(DATEDIFF(lrl.LeaveEndDate, lrl.LeaveStartDate) + 1 > 1, "s", "")
								)
							)
				)
			) AS `LastGrantedFestivalDetails`,
	lr.AdditionalInformation,
	lr.LeaveStartDate,
	lr.LeaveEndDate,
	DATEDIFF(lr.LeaveEndDate, lr.LeaveStartDate) + 1 AS `NumberOfDays`,
	lr.Granted,
	lr.CommentReasonManagementOnly,
	lr.DateApprovedRejected,
	AAU.fn_CastTinyIntToJSONBoolean(lr.WithinProtocol) AS `WithinProtocol`,
	f.FestivalId,
	AAU.fn_CastTinyIntToJSONBoolean(lr.RecordedOnNoticeBoard) AS `RecordedOnNoticeBoard`,
	lr.IsDeleted,
	ROW_NUMBER() OVER (PARTITION BY lr.UserId, lr.LeaveRequestId ORDER BY lrl.LeaveStartDate DESC) AS `RNum`
FROM AAU.LeaveRequest lr
INNER JOIN AAU.LeaveRequestReason lrr ON lrr.LeaveRequestReasonId = lr.LeaveRequestReasonId
INNER JOIN AAU.User u ON u.UserId = lr.UserId
INNER JOIN AAU.Department d ON d.DepartmentId = u.DepartmentId
LEFT JOIN AAU.Festival f ON f.FestivalId = lr.FestivalId
LEFT JOIN AAU.LeaveRequest lrl ON	lrl.UserId = lr.UserId AND
									lrl.FestivalId = lr.FestivalId AND
                                    lrl.LeaveStartDate < lr.LeaveStartDate
WHERE lr.OrganisationId = vOrganisationId
AND lr.IsDeleted = 0
)

SELECT
			JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
			JSON_OBJECT("leaveRequestId", lr.LeaveRequestId),
            JSON_OBJECT("departmentId", lr.DepartmentId),
			JSON_OBJECT("department", lr.Department),
            JSON_OBJECT("departmentColour", lr.Colour),
			JSON_OBJECT("userId", lr.UserId),
            JSON_OBJECT("userCode", lr.UserCode),
			JSON_OBJECT("requestDate", lr.RequestDate),
            JSON_OBJECT("leaveRequestReasonId", lr.LeaveRequestReasonId),
			JSON_OBJECT("leaveRequestReason", lr.LeaveRequestReason),
			lr.LastGrantedFestivalDetails,
			JSON_OBJECT("additionalInformation", lr.AdditionalInformation),
			JSON_OBJECT("leaveStartDate", lr.LeaveStartDate),
			JSON_OBJECT("leaveEndDate", lr.LeaveEndDate),
            JSON_OBJECT("numberOfDays", lr.NumberOfDays),
			JSON_OBJECT("granted", lr.Granted),
			JSON_OBJECT("commentReasonManagementOnly", lr.CommentReasonManagementOnly),
			JSON_OBJECT("dateApprovedRejected", lr.DateApprovedRejected),
            JSON_OBJECT("withinProtocol", lr.WithinProtocol),
            JSON_OBJECT("festivalId", lr.FestivalId),
			JSON_OBJECT("recordedOnNoticeBoard", lr.RecordedOnNoticeBoard),
			JSON_OBJECT("isDeleted", lr.IsDeleted)
			)) AS `LeaveRequests`
FROM RawCTE lr
WHERE RNum = 1
AND lr.LeaveStartDate BETWEEN prm_StartDate AND prm_EndDate;

END$$

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetLeavesForPeriod !!

-- CALL AAU.sp_GetLeavesForPeriod('2022-10-24','2022-10-30');
-- CALL AAU.sp_GetLeavesForPeriod('2022-10-17','2022-10-23');
-- CALL AAU.sp_GetLeavesForPeriod('2022-10-10','2022-10-16');
-- CALL AAU.sp_GetLeavesForPeriod('2022-10-03','2022-10-09');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetLeavesForPeriod( IN prm_StartDate DATE, IN prm_EndDate DATE)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/08/2022
Purpose: Retrieve a list of leaves for a period. This brings both granted and pending leaves.

*/


SELECT
JSON_ARRAYAGG(
JSON_MERGE_PRESERVE(
JSON_OBJECT("leaveRequestId", lr.LeaveRequestId),
JSON_OBJECT("userId", lr.UserId),
JSON_OBJECT("granted", IF(lr.Granted IS NULL, 'Pending','Granted')),
JSON_OBJECT("startDate", lr.LeaveStartDate),
JSON_OBJECT("endDate", lr.LeaveEndDate)
)) AS `Leaves`
FROM AAU.LeaveRequest lr
WHERE
	prm_StartDate <= lr.LeaveEndDate AND
	prm_EndDate >= lr.LeaveStartDate AND
    IFNULL(lr.Granted, 1) <> 0;

END $$

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetOrganisationDetail !!

-- CALL AAU.sp_GetOrganisationDetail(1);

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetOrganisationDetail( IN prm_OrganisationId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/08/2022
Purpose: Retrieve the details and defaults for an Organisation

*/

	SELECT 
		JSON_OBJECT(
        'organisationId', o.OrganisationId,
		'logoUrl', om.LogoURL,
		'address', om.Address,
		'name', o.Organisation,
        'driverViewDeskNumber', om.DriverViewDeskNumber,
        'vehicleDefaults', om.VehicleDefaults,
        'rotaDefaults', om.RotaDefaults
		) AS Organisation
	FROM 
		AAU.OrganisationMetaData om
		INNER JOIN AAU.Organisation o ON o.OrganisationId = om.OrganisationId
	WHERE o.OrganisationId = prm_OrganisationId;
    
END$$

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetRotaDayAssignmentsByRotationPeriodId !!

-- CALL AAU.sp_GetRotaDayAssignmentsByRotationPeriodId('Jim',1);

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetRotaDayAssignmentsByRotationPeriodId( IN prm_Username VARCHAR(45), IN prm_RotationPeriodId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 13/10/2022
Purpose: Retrieve the rotation period with an array of days, each day containing an array of the assignments

*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE Username = prm_Username;

With RotationRoleShiftSegmentsCTE AS (

SELECT rrss.RotationRoleId,
JSON_ARRAYAGG(
	JSON_MERGE_PRESERVE(
		JSON_OBJECT("startTime", rrss.StartTime),
		JSON_OBJECT("endTime", rrss.EndTime),
		JSON_OBJECT("sameDay", rrss.SameDay),
		JSON_OBJECT("shiftSegmentTypeId", rrss.ShiftSegmentTypeId)
	)
) AS `rotationRoleShiftSegments`

FROM AAU.RotationRoleShiftSegment rrss
WHERE rrss.IsDeleted = 0
AND OrganisationId = vOrganisationId
GROUP BY rrss.RotationRoleId
),
RoleAndAreaCTE AS
(
	SELECT rrss.RotationRoleId,
	rr.RotationRole,
	rr.RotationAreaId,
	ra.RotationArea,
	ra.SortOrder AS `RotationAreaSortOrder`,
	ra.Colour AS `RotationAreaColour`,
	rrss.rotationRoleShiftSegments
	FROM RotationRoleShiftSegmentsCTE rrss
	INNER JOIN AAU.RotationRole rr ON rr.RotationRoleId = rrss.RotationRoleId
	INNER JOIN AAU.RotationArea ra ON ra.RotationAreaId = rr.RotationAreaId AND ra.IsDeleted = 0
),

BaseCTE AS 
(
SELECT
	rda.RotationPeriodId,
	rda.RotaDayDate,
	rda.RotaDayId,
	IF(lr.Granted = 1 AND rda.UserId = rda.RotationUserId, NULL, rda.UserId) AS 'UserId',
	rda.RotationUserId,
	lr.LeaveRequestId,
    CASE WHEN lr.Granted IS NULL AND lr.LeaveRequestId IS NOT NULL THEN 'Pending'
    WHEN lr.Granted = 0 THEN 'Denied'
    WHEN lr.Granted = 1 THEN 'Granted'
    WHEN lr.Granted = 2 THEN 'Partially'
    ELSE NULL
    END AS `LeaveGranted`,
    CONCAT(lu.EmployeeNumber, ' - ', lu.FirstName) AS `LeaveUser`,
    rr.RotationRoleId,
	rr.RotationRole,
    rr.RotationAreaId,
	rr.RotationArea,
    rr.RotationAreaSortOrder,
    rr.RotationAreaColour,
	rr.rotationRoleShiftSegments,
    rda.Notes,
	IF(ROW_NUMBER() OVER (PARTITION BY rda.RotaDayDate, rr.RotationAreaId ORDER BY rda.RotaDayDate, rda.Sequence) = 1,  
					COUNT(1) OVER (PARTITION BY rda.RotaDayDate, rr.RotationAreaId ORDER BY rr.RotationAreaId ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING),
					0) AS `AreaRowSpan`
	FROM AAU.RotaDayAssignment rda
	INNER JOIN RoleAndAreaCTE rr ON rr.RotationRoleId = rda.RotationRoleId    
	LEFT JOIN AAU.LeaveRequest lr 				ON lr.UserId = rda.RotationUserId AND rda.RotaDayDate BETWEEN lr.LeaveStartDate AND lr.LeaveEndDate
    LEFT JOIN AAU.User lu						ON lu.UserId = lr.UserId
    LEFT JOIN AAU.User u						ON u.UserId = rda.UserId
WHERE rda.RotationPeriodId = prm_RotationPeriodId
      
UNION ALL

-- Now let's add in any leave requests

SELECT 
    rp.RotationPeriodId,
	DATE_ADD(lr.LeaveStartDate, INTERVAL t.Id DAY),
	-1,
	lr.UserId,
	lr.UserId,
	lr.LeaveRequestId,
	CASE WHEN lr.Granted IS NULL AND lr.LeaveRequestId IS NOT NULL THEN 'Pending'
		WHEN lr.Granted = 0 THEN 'Denied'
		WHEN lr.Granted = 1 THEN 'Granted'
		ELSE NULL
	END AS `LeaveGranted`,    
	NULL,
    -1,
	'LEAVE',
	-1,
	'Leave',
	-1,
	'#999999',
	
    NULL,
    
	NULL,
	IF(ROW_NUMBER() OVER (PARTITION BY t.Id ORDER BY lr.UserId DESC) = 1, ROW_NUMBER() OVER (PARTITION BY t.Id ORDER BY lr.UserId), 0)
FROM AAU.LeaveRequest lr
INNER JOIN AAU.Tally t ON t.Id <= (lr.LeaveEndDate - lr.LeaveStartDate)
INNER JOIN AAU.RotationPeriod rp ON DATE_ADD(lr.LeaveStartDate, INTERVAL t.Id DAY) BETWEEN rp.StartDate AND rp.EndDate
WHERE RotationPeriodId = prm_RotationPeriodId
AND lr.Granted = 1

UNION ALL

-- Let's get all of the fixed off records
SELECT
	rp.RotationPeriodId,
	DATE_ADD(rp.StartDate, INTERVAL t.Id DAY),
	-1,
	u.UserId,
	u.UserId,
	lr.LeaveRequestId,
	CASE WHEN lr.Granted IS NULL AND lr.LeaveRequestId IS NOT NULL THEN 'Pending'
		WHEN lr.Granted = 0 THEN 'Denied'
		WHEN lr.Granted = 1 THEN 'Granted'
		ELSE NULL
		END AS `LeaveGranted`,	
	NULL,
    -1,
	'FIXED OFF',
	-2,
	'Fixed Off',
	-2,
	'#999999',
	
    NULL,
    
	NULL,
	IF(ROW_NUMBER() OVER (PARTITION BY t.Id ORDER BY u.UserId DESC) = 1, ROW_NUMBER() OVER (PARTITION BY t.Id ORDER BY u.UserId), 0)
FROM AAU.RotationPeriod rp
INNER JOIN AAU.Tally t ON t.Id < 7
INNER JOIN AAU.User u ON u.FixedDayOff = WEEKDAY(DATE_ADD(rp.StartDate, INTERVAL t.Id DAY))
LEFT JOIN AAU.LeaveRequest lr 	ON lr.UserId = u.UserId AND DATE_ADD(rp.StartDate, INTERVAL t.Id DAY) BETWEEN lr.LeaveStartDate AND lr.LeaveEndDate
WHERE RotationPeriodId = prm_RotationPeriodId

),
rotaDayAssignmentCTE AS
(
SELECT RotationPeriodId,
		JSON_MERGE_PRESERVE(
			JSON_OBJECT("rotaDayDate", RotaDayDate),
			JSON_OBJECT("rotaDayAssignments", 
				JSON_ARRAYAGG(
					JSON_MERGE_PRESERVE(
						JSON_OBJECT("rotaDayId", RotaDayId),
                        JSON_OBJECT("areaRowSpan", AreaRowSpan),
						JSON_OBJECT("userId", UserId),
						JSON_OBJECT("rotationUserId", RotationUserId),
						JSON_OBJECT("leaveRequestId", LeaveRequestId),
                        JSON_OBJECT("leaveGranted", LeaveGranted),
                        JSON_OBJECT("leaveUser", LeaveUser),
                        JSON_OBJECT("rotationRoleId", RotationRoleId),
                        JSON_OBJECT("rotationRole", RotationRole),
                        JSON_OBJECT("rotationAreaId", RotationAreaId),
                        JSON_OBJECT("rotationArea", RotationArea),
                        JSON_OBJECT("rotationAreaColour", RotationAreaColour),
                        JSON_OBJECT("rotationAreaSortOrder", RotationAreaSortOrder),
                        JSON_OBJECT("rotationRoleShiftSegments", rotationRoleShiftSegments),
                        JSON_OBJECT("notes", Notes),
                        JSON_OBJECT("isAdded", CAST(0 AS JSON))
					)
				)
			)
		) AS `RotaDayAssignments`
FROM BaseCTE
GROUP BY RotationPeriodId, RotaDayDate -- Commenting this for the moment as it causes a memory spill to disk
)

SELECT
	JSON_MERGE_PRESERVE(
		JSON_OBJECT("rotationPeriodId", rd.RotationPeriodId),
        JSON_OBJECT("startDate", p.StartDate),
        JSON_OBJECT("endDate", p.EndDate),
        JSON_OBJECT("rotaId", rv.RotaId),
        JSON_OBJECT("rotaVersionId", rv.RotaVersionId),
		JSON_OBJECT("rotaDays", 
			JSON_ARRAYAGG(	
			rd.RotaDayAssignments
			)
		)
	) AS `RotationPeriodAssignments`
FROM rotaDayAssignmentCTE rd
INNER JOIN AAU.RotationPeriod p ON p.RotationPeriodId = rd.RotationPeriodId
INNER JOIN AAU.RotaVersion rv ON rv.RotaVersionId = p.RotaVersionId
GROUP BY rd.RotationPeriodId, p.StartDate, p.EndDate, rv.RotaId, rv.RotaVersionId;

END$$

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetRotaMatrix !!

-- CALL AAU.sp_GetRotaMatrix(2,'b83add4a-d267-5827-bf1e-0be6965f91f7,c5ad4348-fead-21a5-73e0-fa9f5c4c6ddf');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetRotaMatrix( IN prm_RotaVersionId INT, IN prm_RotationPeriodGUIDs VARCHAR(256))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/08/2022
Purpose: Retrieve the matrix for a rota version

*/
	SELECT 
			JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
            JSON_OBJECT("areaShiftGUID", rm.AreaShiftGUID),
            JSON_OBJECT("rotationPeriodGUID", rm.RotationPeriodGUID),
            JSON_OBJECT("rotaVersionId", rm.RotaVersionId),
            JSON_OBJECT("assignedUserId", rm.UserId)
			)) AS `RotaMatrix`
	FROM AAU.RotaMatrixItem rm
    INNER JOIN AAU.RotationPeriod rp ON rp.RotationPeriodGUID = rm.RotationPeriodGUID AND rp.IsDeleted = 0
    WHERE rm.RotaVersionId = prm_RotaVersionId
    AND FIND_IN_SET (rm.RotationPeriodGUID, prm_RotationPeriodGUIDs);
    
END$$

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetRotas !!

-- CALL AAU.sp_GetRotas('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetRotas( IN prm_Username VARCHAR(45))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/08/2022
Purpose: Retrieve a list of rotas and their versions

*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

WITH RotaVersionCTE AS
(
	SELECT rv.RotaId,
			JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
			JSON_OBJECT("rotaVersionId", rv.RotaVersionId),
			JSON_OBJECT("rotaVersionName", rv.RotaVersionName),
            JSON_OBJECT("rotaId", rv.RotaId),
			JSON_OBJECT("defaultRotaVersion", IF(rv.DefaultRotaVersion = 1, CAST(TRUE AS JSON), CAST(FALSE AS JSON)))
			)) AS `RotaVersions`
	FROM AAU.RotaVersion rv
    WHERE rv.OrganisationId = vOrganisationId
    AND rv.IsDeleted <> 1
    GROUP BY rv.RotaId
)

	SELECT
		JSON_ARRAYAGG(
		JSON_MERGE_PRESERVE(
		JSON_OBJECT("rotaId", r.RotaId),
        JSON_OBJECT("rotaName", r.RotaName),
        JSON_OBJECT("defaultRota", IF(r.DefaultRota = 1, CAST(TRUE AS JSON), CAST(FALSE AS JSON))),
        JSON_OBJECT("rotaVersions", rv.RotaVersions)
        )) AS `Rotas`
        -- ,r.y
    FROM AAU.Rota r
    INNER JOIN RotaVersionCTE rv ON rv.RotaId = r.RotaId
    WHERE r.OrganisationId = vOrganisationId
    AND r.IsDeleted <> 1;
    
END$$

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetRotationAreas !!

-- CALL AAU.sp_GetRotationAreas('Jim', 1);

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetRotationAreas( IN prm_UserName VARCHAR(45), IN prm_IncludeDeleted TINYINT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/08/2022
Purpose: Retrieve a list of areas that can be assigned to a rota

*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

 	SELECT 
 			JSON_ARRAYAGG(
 			JSON_MERGE_PRESERVE(
 			JSON_OBJECT("rotationAreaId", ra.`RotationAreaId`),
 			JSON_OBJECT("rotationArea", ra.`RotationArea`),
			JSON_OBJECT("sortOrder", ra.`SortOrder`),
			JSON_OBJECT("isDeleted", ra.`IsDeleted`),
			JSON_OBJECT("colour", ra.`Colour`) 
 			)) AS `RotationAreas`
     FROM AAU.RotationArea ra
     WHERE ra.OrganisationId = vOrganisationId
     AND (IFNULL(ra.IsDeleted,0) = prm_IncludeDeleted OR prm_IncludeDeleted = 1);
    
END$$

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetRotationPeriods !!

-- CALL AAU.sp_GetRotationPeriods(-1, 4, 0);

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetRotationPeriods( IN prm_RotaVersionId INT, IN prm_Limit INT, IN prm_Offset INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/08/2022
Purpose: Retrieve a list of rotation periods for a rota version.

*/

	WITH minMaxCTE AS (
    SELECT 
		rp.RotaVersionId,
		FIRST_VALUE(rp.RotationPeriodGUID) OVER (ORDER BY StartDate ASC) AS `FirstRotationPeriodGUID`,
		FIRST_VALUE(rp.RotationPeriodGUID) OVER (ORDER BY StartDate DESC) AS `LastRotationPeriodGUID`
    FROM AAU.RotationPeriod rp
    WHERE rp.RotaVersionId = prm_RotaVersionId
    AND rp.IsDeleted = 0
    LIMIT 1
    ),
    rotationPeriodsCTE AS (
    SELECT
		rp.RotationPeriodId,
        rp.RotationPeriodGUID,
        rp.RotaVersionId,
        rp.`Name`,
        rp.StartDate,
        rp.EndDate,
        IF(rp.locked = 1, CAST(TRUE AS JSON), CAST(FALSE AS JSON)) AS `Locked`
    FROM AAU.RotationPeriod rp
    WHERE rp.RotaVersionId = prm_RotaVersionId
    AND rp.IsDeleted = 0
    ORDER BY StartDate DESC
    LIMIT prm_Limit OFFSET prm_Offset
    )
    
	SELECT 
			JSON_MERGE_PRESERVE(
			JSON_MERGE_PRESERVE(
			JSON_OBJECT("firstRotationPeriodGUID", mm.FirstRotationPeriodGUID),
            JSON_OBJECT("lastRotationPeriodGUID", mm.LastRotationPeriodGUID)
            ),
			JSON_OBJECT("rotationPeriods",
			JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
			JSON_OBJECT("rotationPeriodId", rp.RotationPeriodId),
			JSON_OBJECT("rotationPeriodGUID", rp.RotationPeriodGUID),
            JSON_OBJECT("rotaVersionId", rp.RotaVersionId),
            JSON_OBJECT("name", rp.`Name`),
            JSON_OBJECT("startDate", rp.StartDate),
            JSON_OBJECT("endDate", rp.EndDate),
            JSON_OBJECT("locked", rp.`Locked`)
			)))) AS `RotationPeriods`
	FROM rotationPeriodsCTE rp
    INNER JOIN minMaxCTE mm ON mm.RotaVersionId = rp.RotaVersionId
    GROUP BY mm.FirstRotationPeriodGUID, mm.LastRotationPeriodGUID;
    
    
END$$

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetRotationRoles !!

-- CALL AAU.sp_GetRotationRoles('Jim', 1);

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetRotationRoles( IN prm_UserName VARCHAR(45), IN prm_IncludeDeleted TINYINT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 29/08/2022
Purpose: Retrieve a list of roles that can be assigned to a shift

*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

		With ShiftSegmentsCTE AS
		(
		SELECT 		rrss.RotationRoleId,
					JSON_ARRAYAGG(
					JSON_MERGE_PRESERVE(
					JSON_OBJECT("rotationRoleShiftSegmentId", rrss.RotationRoleShiftSegmentId),
					JSON_OBJECT("shiftSegmentTypeId", rrss.ShiftSegmentTypeId),
					JSON_OBJECT("shiftSegmentType", sst.ShiftSegmentType),
					JSON_OBJECT("startTime", TIME_FORMAT(rrss.`StartTime`, "%H:%i")),
					JSON_OBJECT("endTime", TIME_FORMAT(rrss.`EndTime`, "%H:%i")),
					JSON_OBJECT("sameDay", IF(rrss.SameDay = 1, CAST(true AS JSON), CAST(false AS JSON)))
					)) AS `ShiftSegments`
		FROM AAU.RotationRoleShiftSegment rrss
		LEFT JOIN AAU.ShiftSegmentType sst ON sst.ShiftSegmentTypeId = rrss.ShiftSegmentTypeId
        WHERE rrss.IsDeleted = 0
		GROUP BY rrss.RotationRoleId
		)

 	SELECT 
			JSON_ARRAYAGG(
			JSON_MERGE_PRESERVE(
			JSON_OBJECT("rotationRoleId", rr.`RotationRoleId`),
			JSON_OBJECT("rotationRole", rr.`RotationRole`),
			JSON_OBJECT("rotationAreaId", rr.`RotationAreaId`),
			JSON_OBJECT("rotationArea", ra.`RotationArea`),
			JSON_OBJECT("rotationAreaSortOrder", ra.`SortOrder`),
			JSON_OBJECT("rotationAreaColour", ra.`Colour`),
			JSON_OBJECT("colour", rr.`Colour`),
			JSON_OBJECT("shiftSegments", ss.`ShiftSegments`),
			JSON_OBJECT("sortOrder", rr.`SortOrder`),
			JSON_OBJECT("isDeleted", rr.`IsDeleted`)             
 			)) AS `RotationRoles`
	FROM AAU.RotationRole rr
    INNER JOIN AAU.RotationArea ra ON ra.RotationAreaId = rr.RotationAreaId
    LEFT JOIN ShiftSegmentsCTE ss ON ss.RotationRoleId = rr.RotationRoleId
	WHERE rr.OrganisationId = vOrganisationId
    AND (IFNULL(rr.IsDeleted,0) = prm_IncludeDeleted OR prm_IncludeDeleted = 1);
    
END$$

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetUsersByIdRange !!

-- CALL AAU.sp_GetUsersByIdRange('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetUsersByIdRange(IN prm_UserName VARCHAR(64))
BEGIN
/*
Created By: Jim Mackenzie
Created On: 22/08/2018
Purpose: Used to return a single user from the database. Initially
		 for edit purposes.
         
Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Removing StreetTreat team
*/

DECLARE vOrganisationId INT;

SET vOrganisationId = 0;

SELECT OrganisationId INTO vOrganisationId
FROM AAU.User u 
WHERE UserName = prm_Username LIMIT 1;

SELECT 

JSON_ARRAYAGG(
JSON_MERGE_PRESERVE( 
JSON_OBJECT("userId",UserDetails.UserId),
JSON_OBJECT("employeeNumber",UserDetails.EmployeeNumber),
JSON_OBJECT("firstName",UserDetails.FirstName),
JSON_OBJECT("surname",UserDetails.Surname),
JSON_OBJECT("initials",UserDetails.Initials),
JSON_OBJECT("colour",UserDetails.Colour),
JSON_OBJECT("telephone",UserDetails.Telephone),
JSON_OBJECT("userName",UserDetails.UserName),
JSON_OBJECT("roleId",UserDetails.RoleId),
JSON_OBJECT("role",UserDetails.RoleName),
JSON_OBJECT("jobTitleId",UserDetails.JobTypeId),
JSON_OBJECT("jobTitle",UserDetails.JobTitle),
JSON_OBJECT("permissionArray",UserDetails.PermissionArray),
JSON_OBJECT("fixedDayOff",UserDetails.FixedDayOff),
JSON_OBJECT("departmentId",UserDetails.DepartmentId),
JSON_OBJECT("isDeleted",UserDetails.IsDeleted)
))  AS userDetails
FROM (SELECT u.UserId, u.EmployeeNumber, u.FirstName, u.Surname, u.PermissionArray, u.Initials, IFNULL(u.Colour,'#ffffff') AS `Colour`, u.Telephone,
			u.UserName, u.Password, r.RoleId , r.RoleName, jobTitle.JobTypeId, jobTitle.JobTitle,
            u.FixedDayOff, u.DepartmentId,
            IF(u.IsDeleted, CAST(TRUE AS JSON), CAST(FALSE AS JSON)) AS IsDeleted
	FROM AAU.User u		
		LEFT JOIN AAU.Role r ON r.RoleId = u.RoleId
		LEFT JOIN (SELECT 
					ujt.UserId,
					GROUP_CONCAT(jt.JobTypeId) AS JobTypeId,
					GROUP_CONCAT(jt.Title) AS JobTitle
					FROM AAU.UserJobType ujt
					INNER JOIN AAU.JobType jt ON jt.JobTypeId = ujt.JobTypeId
					WHERE ujt.IsDeleted = 0
                    GROUP BY ujt.UserId
					ORDER BY UserId ASC) jobTitle
	ON jobTitle.UserId = u.UserId
    WHERE u.UserId <> -1
    AND u.IsDeleted = 0
    AND u.OrganisationId = vOrganisationId) UserDetails;
        
-- WHERE UserDetails.UserId BETWEEN prm_userIdStart AND prm_UserIdEnd;


END$$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertLeaveRequest !!

-- START TRANSACTION;
-- CALL AAU.sp_InsertLeaveRequest('Jim', 8,'2022-11-21', 4, NULL, NULL,'2022-11-22', '2022-11-25', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,NULL);
-- ROLLBACK

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertLeaveRequest( 	IN prm_UserName VARCHAR(45),
												IN prm_UserId INTEGER,
												IN prm_RequestDate DATE,
												IN prm_LeaveRequestReasonId INTEGER,
												IN prm_AdditionalInformation TEXT,
												IN prm_LeaveStartDate DATE,
												IN prm_LeaveEndDate DATE,
												IN prm_Granted TINYINT,
												IN prm_CommentReasonManagementOnly TEXT,
												IN prm_DateApprovedRejected DATETIME,                                                
												IN prm_RecordedOnNoticeBoard TINYINT,
                                                IN prm_WithinProtocol TINYINT,
                                                IN prm_FestivalId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 16/11/2022
Purpose: Insert a leave request

*/

DECLARE vLeaveRequestExists INT;
DECLARE vSuccess INT;
DECLARE vLeaveRequestId INT;
DECLARE vOrganisationId INT;

SET vLeaveRequestExists = 0;
SET vSuccess = 0;
SET vLeaveRequestId = 0;
SET vOrganisationId = 0;

	SELECT OrganisationId INTO vOrganisationId
	FROM AAU.User u
	WHERE UserName = prm_UserName LIMIT 1;

	SELECT COUNT(1) INTO vLeaveRequestExists FROM AAU.LeaveRequest WHERE 	UserId = prm_UserId AND
																			LeaveRequestReasonId = prm_LeaveRequestReasonId AND
                                                                            LeaveStartDate = prm_LeaveStartDate AND
                                                                            LeaveEndDate = prm_LeaveEndDate
                                                                            AND IsDeleted = 0;
    
    IF(vLeaveRequestExists = 0) THEN    
    
	INSERT INTO AAU.LeaveRequest (
		UserId,
		OrganisationId,
		RequestDate,
		LeaveRequestReasonId,
		AdditionalInformation,
		LeaveStartDate,
		LeaveEndDate,
		Granted,
		CommentReasonManagementOnly,
		DateApprovedRejected,
		RecordedOnNoticeBoard,
		WithinProtocol,
		FestivalId
	)
	VALUES
	(
		prm_UserId,
        vOrganisationId,
		prm_RequestDate,
		prm_LeaveRequestReasonId,
		prm_AdditionalInformation,
		prm_LeaveStartDate,
		prm_LeaveEndDate,
		prm_Granted,
		prm_CommentReasonManagementOnly,
		prm_DateApprovedRejected,
		prm_RecordedOnNoticeBoard,
        prm_WithinProtocol,
        prm_FestivalId
	);
    
    SELECT LAST_INSERT_ID() INTO vLeaveRequestId;
    
    SELECT 1 INTO vSuccess;
    
    	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
		VALUES (prm_Username,vLeaveRequestId,'Leave Request','Insert', NOW());
    
    ELSE
    
    SELECT 2 INTO vSuccess; 
    
    END IF;
    
    SELECT vSuccess AS `success`, vLeaveRequestId AS `leaveRequestId`;
    

END$$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertPatientProblem !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertPatientProblem(
IN prm_UserName VARCHAR(64),
IN prm_PatientId INT,
IN prm_ProblemId INT)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 24/02/2020
Purpose: Used to insert patient problems
*/

DECLARE vOrganisationId INT;
DECLARE vPatientProblemCount INT;
DECLARE vSuccess INT;

SET vPatientProblemCount = 0;
SET vSuccess = 0;

SELECT COUNT(1) INTO vPatientProblemCount FROM AAU.PatientProblem WHERE PatientId = prm_PatientId
													AND ProblemId = prm_ProblemId;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;                                                    
                                                    
IF vPatientProblemCount = 0 THEN

INSERT INTO AAU.PatientProblem
		(PatientId, OrganisationId, ProblemId)
	VALUES
		(prm_PatientId, vOrganisationId, prm_ProblemId);
        		        
SELECT 1 INTO vSuccess;

ELSEIF vPatientProblemCount > 0 THEN

SELECT 2 INTO vSuccess;

ELSE

SELECT 3 INTO vSuccess;

END IF;

SELECT vSuccess AS `success`;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertRotaDayAssignments !!

-- CALL AAU.sp_InsertRotaDayAssignments(1);
-- TRUNCATE TABLE AAU.RotaDayAssignment

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertRotaDayAssignments( IN prm_UserName VARCHAR(45), IN prm_RotationPeriodId INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 13/10/2022
Purpose: Generate the user assignments for each area shift and day in the rotation period.

*/

DECLARE vRotationPeriodExists INT;
DECLARE vSuccess INT;

SET vRotationPeriodExists = 0;
SET vSuccess = 0;

SELECT COUNT(1) INTO vRotationPeriodExists FROM AAU.RotaDayAssignment WHERE RotationPeriodId = prm_RotationPeriodId AND IsDeleted = 0;

IF vRotationPeriodExists = 0 THEN

UPDATE AAU.RotationPeriod SET `Locked` = 1 WHERE RotationPeriodId = prm_RotationPeriodId;

INSERT INTO AAU.RotaDayAssignment ( RotaDayDate, RotationPeriodId, RotationRoleId, UserId, RotationUserId, Sequence)
SELECT DATE_ADD(p.StartDate, INTERVAL t.Id DAY) AS `RotaDayDate`,
p.RotationPeriodId,
a.RotationRoleId,
NULLIF(NULLIF(rmi.UserId, -1), lr.LeaveRequestId IS NOT NULL) AS `UserId`,
NULLIF(rmi.UserId, -1) AS `RotationUserId`,
a.Sequence
FROM AAU.RotaMatrixItem rmi
INNER JOIN AAU.RotationPeriod p ON p.RotationPeriodGUID = rmi.RotationPeriodGUID AND p.IsDeleted = 0
INNER JOIN AAU.AreaShift a ON a.AreaShiftGUID = rmi.AreaShiftGUID AND a.IsDeleted = 0
INNER JOIN AAU.Tally t ON t.Id <= (DATEDIFF(p.EndDate, p.StartDate))
LEFT JOIN AAU.LeaveRequest lr ON lr.UserId = rmi.UserId AND DATE_ADD(p.StartDate, INTERVAL t.Id DAY) BETWEEN lr.LeaveStartDate AND lr.LeaveEndDate
WHERE p.RotationPeriodId = prm_RotationPeriodId;

SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,prm_RotationPeriodId,'RotaDayAssignment','Insert', NOW());

ELSE

SELECT 2 INTO vSuccess;

END IF;

SELECT vSuccess AS `success`;

END$$

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertRotaDayAssignment !!

-- CALL AAU.sp_InsertRotaDayAssignment("Jim",0,"2022-11-14",10,0,12,null,null,"","",null,"");

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertRotaDayAssignment( 
													IN prm_Username VARCHAR(45),
													IN prm_RotaDayDate DATE,
													IN prm_RotationPeriodId INT,
													IN prm_RotationRoleId INT,
													IN prm_UserId INT,
													IN prm_ActualStartTime TIME,
													IN prm_ActualEndTime TIME,
													IN prm_ActualBreakStartTime TIME,
													IN prm_ActualBreakEndTime TIME,
													IN prm_RotationUserId INT,
													IN prm_Notes VARCHAR(1024) CHARACTER SET UTF8MB4
)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 03/12/2022
Purpose: Add a single new rota day assignment to a particular rota day.

*/

DECLARE vRotaDayAssignmentExists INT;
DECLARE vRotaDayId INT;
DECLARE vRotationRoleId INT;
DECLARE vSuccess INT;
DECLARE vOrganisationId INT;
DECLARE vTimeNow DATETIME;

SET vRotaDayAssignmentExists = 0;
SET vSuccess = 0;
SET vRotaDayId = 0;

SELECT o.OrganisationId, CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vOrganisationId, vTimeNow
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId WHERE u.UserName = prm_Username;

SELECT COUNT(1) INTO vRotaDayAssignmentExists FROM AAU.RotaDayAssignment WHERE	RotaDayDate = prm_RotaDayDate AND
																				RotationPeriodId = prm_RotationPeriodId AND
                                                                                RotationRoleId = prm_RotationRoleId AND
                                                                                UserId = prm_UserId AND
																				IsDeleted = 0;

IF vRotaDayAssignmentExists = 0 THEN

INSERT INTO AAU.RotaDayAssignment
(
	RotaDayDate,
	RotationPeriodId,
	RotationRoleId,
	UserId,
	ActualStartTime,
	ActualEndTime,
	ActualBreakStartTime,
	ActualBreakEndTime,
	RotationUserId,
	Notes
)
VALUES
(
	prm_RotaDayDate,
	prm_RotationPeriodId,
	prm_RotationRoleId,
	prm_UserId,
	prm_ActualStartTime,
	prm_ActualEndTime,
	prm_ActualBreakStartTime,
	prm_ActualBreakEndTime,
	prm_RotationUserId,
	prm_Notes
);

SELECT LAST_INSERT_ID() INTO vRotaDayId;

SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotaDayId,'RotaDayAssignment','Insert - Single', vTimeNow);

ELSE

SELECT 2 INTO vSuccess;

END IF;

SELECT vRotaDayId AS `rotaDayId`, vSuccess AS `success`;

END$$

DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_InsertUser !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_InsertUser(IN prm_User VARCHAR(45),
									IN prm_EmployeeNumber VARCHAR(32) CHARACTER SET UTF8MB4,
									IN prm_FirstName VARCHAR(64) CHARACTER SET UTF8MB4,
									IN prm_Surname VARCHAR(64) CHARACTER SET UTF8MB4,
									IN prm_Initials VARCHAR(64) CHARACTER SET UTF8MB4,
									IN prm_Colour VARCHAR(64) CHARACTER SET UTF8MB4,
									IN prm_Telephone VARCHAR(64) CHARACTER SET UTF8MB4,				
									IN prm_UserName VARCHAR(64) CHARACTER SET UTF8MB4,
									IN prm_Password VARCHAR(255) CHARACTER SET UTF8MB4,
									IN prm_RoleId INTEGER,
									IN prm_PermissionArray JSON,
									IN prm_FixedDayOff TINYINT,
                                    IN prm_Department INT,
                                    IN prm_LocalName VARCHAR(64) CHARACTER SET UTF8MB4
									)
BEGIN                                    

/*
Created By: Jim Mackenzie
Created On: 22/08/2018
Purpose: To insert a new user

Modified By: Jim Mackenzie
Modified On: 17/02/2022
Description: Removing StreetTreat team

*/
DECLARE vOrganisationId INT;
DECLARE vUserCount INT;
DECLARE vUserId INT;
DECLARE vSuccess INT;

DECLARE StatementVariable INT;

SET vUserCount = 0;
SET vOrganisationId = 1;

SET StatementVariable = 1;

SELECT COUNT(1) INTO vUserCount FROM AAU.User WHERE FirstName = prm_FirstName
													AND Surname = prm_Surname
                                                    AND Telephone = prm_Telephone;
                                                    
SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_User LIMIT 1;
                                                    
                                                    
IF vUserCount = 0 THEN

INSERT INTO AAU.User (OrganisationId,
						EmployeeNumber,
						FirstName,
						Surname,
						Initials,
						Colour,
						Telephone,
						UserName,
						Password,
						RoleId,
						PermissionArray,
                        FixedDayOff,
                        DepartmentId,
                        LocalName
                        )
				VALUES
						(
						vOrganisationId,
                        prm_EmployeeNumber,
						prm_FirstName,
						prm_Surname,
						prm_Initials,
						prm_Colour,
						prm_Telephone,
						prm_UserName,
						prm_Password,
						prm_RoleId,
						prm_PermissionArray,
                        prm_FixedDayOff,
                        prm_Department,
                        prm_LocalName
						);


SELECT LAST_INSERT_ID() INTO vUserId;
SELECT 1 INTO vSuccess;

ELSEIF vUserCount > 0 THEN

SELECT 2 INTO vSuccess;

ELSE

SELECT 3 INTO vSuccess;

END IF;


SELECT vUserId, vSuccess;


END$$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateEmergencyCase !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateEmergencyCase(
									IN prm_EmergencyCaseId INT,
									IN prm_EmergencyNumber INT,
									IN prm_CallDateTime DATETIME,
									IN prm_DispatcherId INT,
									IN prm_EmergencyCodeId INT,
									-- IN prm_CallOutcomeId INT,
                                    -- IN prm_SameAsNumber INT,
                                    IN prm_Comments VARCHAR(650) CHARACTER SET UTF8MB4,
									IN prm_Location VARCHAR(512),
									IN prm_Latitude DECIMAL(11,8),
									IN prm_Longitude DECIMAL(11,8),
									-- IN prm_Rescuer1Id INT,
									-- IN prm_Rescuer2Id INT,
									IN prm_AmbulanceArrivalTime DATETIME,
									IN prm_RescueTime DATETIME,
									IN prm_AdmissionTime DATETIME,
                                    IN prm_UpdateTime DATETIME,
									IN prm_IsDeleted BOOLEAN,
                                    IN prm_DeletedDate DATETIME,
									IN prm_UserName VARCHAR(64),
                                    IN prm_AssignedAmbulanceId INT,
                                    IN prm_AmbulanceAssignmentTime DATETIME,
                                    IN prm_SelfAdmission BOOLEAN)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to update a case.

Modified by: Jim Mackenzie
Modified On: 22/12/2022
Modification: Removing out parameters
*/

DECLARE vOrganisationId INT;
DECLARE vUpdateTime DATETIME;
DECLARE vSuccess INT;
DECLARE vSameAsEmergencyCaseId INT;
DECLARE vSocketEndPoint VARCHAR(6);

DECLARE vEmNoExists INT;
SET vEmNoExists = 0;
SET vSuccess = 0;

SELECT COUNT(1) INTO vEmNoExists FROM AAU.EmergencyCase WHERE EmergencyCaseId <> prm_EmergencyCaseId AND EmergencyNumber = prm_EmergencyNumber;

SELECT IFNULL(MAX(UpdateTime), '1901-01-01') INTO vUpdateTime FROM AAU.EmergencyCase WHERE EmergencyCaseId = prm_EmergencyCaseId;

-- SELECT MAX(EmergencyCaseId) INTO vSameAsEmergencyCaseId FROM AAU.EmergencyCase WHERE EmergencyNumber = prm_SameAsNumber;

SELECT o.OrganisationId, SocketEndPoint INTO vOrganisationId, vSocketEndPoint
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

IF vEmNoExists = 0 AND prm_UpdateTime >= vUpdateTime THEN

	UPDATE AAU.EmergencyCase SET
						EmergencyNumber        = prm_EmergencyNumber,
						CallDateTime           = prm_CallDateTime,
						DispatcherId           = prm_DispatcherId,
						EmergencyCodeId        = prm_EmergencyCodeId,
						-- CallOutcomeId          = prm_CallOutcomeId,
                        -- SameAsEmergencyCaseId  = vSameAsEmergencyCaseId,
						Location               = prm_Location,
						Latitude               = prm_Latitude,
						Longitude              = prm_Longitude,
						-- Rescuer1Id             = prm_Rescuer1Id,
						-- Rescuer2Id             = prm_Rescuer2Id,
						AmbulanceArrivalTime   = prm_AmbulanceArrivalTime,
						RescueTime             = prm_RescueTime,
						AdmissionTime          = prm_AdmissionTime,
						IsDeleted			   = prm_IsDeleted,
                        DeletedDate			   = prm_DeletedDate,
                        UpdateTime			   = prm_UpdateTime,
                        Comments			   = prm_Comments,
                        AssignedVehicleId    = prm_AssignedAmbulanceId,
                        AmbulanceAssignmentTime = prm_AmbulanceAssignmentTime,
						selfAdmission           = prm_SelfAdmission
			WHERE EmergencyCaseId = prm_EmergencyCaseId;

    SELECT 1 INTO vSuccess;

    INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_UserName,prm_EmergencyCaseId,'EmergencyCase','Update', NOW());  
	

ELSEIF vEmNoExists >= 1 THEN

	SELECT 2 INTO vSuccess;

ELSEIF prm_UpdateTime < vUpdateTime THEN

	SELECT 3 INTO vSuccess; -- Already updated

ELSEIF prm_UpdateTime > vUpdateTime THEN
	SELECT 4 INTO vSuccess; -- Emergency record already updated another time.
    
ELSE
	SELECT 5 INTO vSuccess; -- Other error   
END IF;

SELECT prm_EmergencyCaseId AS `emergencyCaseId`, vSuccess AS `success`, vSocketEndPoint AS `socketEndPoint`;

CALL AAU.sp_GetOutstandingRescueByEmergencyCaseId(prm_EmergencyCaseId, NULL, "Rescue");

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateEmergencyRegisterOutcome !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateEmergencyRegisterOutcome(
IN prm_Username VARCHAR(128),
IN prm_EmergencyCaseId INT,
IN prm_CallOutcomeId INT,
IN prm_SameAsNumber INT,
IN prm_UpdateTime DATETIME)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 02/05/2020
Purpose: Used to update a Call Outcome Id for a case.

Modified by: Jim Mackenzie
Modified On: 22/12/2022
Modification: Removing out parameters
*/

DECLARE vOrganisationId INT;
DECLARE vUpdateTime DATETIME;
DECLARE vEmergencyCaseExists INT;
DECLARE vSameAsEmergencyCaseId INT;
DECLARE vSuccess INT;
DECLARE vSocketEndPoint VARCHAR(6);

DECLARE vEmNoExists INT;
SET vEmNoExists = 0;
SET vEmergencyCaseExists = 0;
SET vSuccess = 0;

SELECT COUNT(1), MAX(EmergencyCaseId) INTO vEmNoExists, vSameAsEmergencyCaseId FROM AAU.EmergencyCase WHERE EmergencyNumber = prm_SameAsNumber;

SELECT IFNULL(MAX(UpdateTime), '1901-01-01'), COUNT(EmergencyCaseId) INTO vUpdateTime, vEmergencyCaseExists FROM AAU.EmergencyCase WHERE EmergencyCaseId = prm_EmergencyCaseId;

SELECT o.OrganisationId, SocketEndPoint INTO vOrganisationId, vSocketEndPoint
FROM AAU.User u 
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

IF vEmNoExists <= 1 AND vEmergencyCaseExists = 1 AND prm_UpdateTime >= vUpdateTime THEN

START TRANSACTION;

	UPDATE AAU.EmergencyCase SET
						CallOutcomeId   		= prm_CallOutcomeId,
                        SameAsEmergencyCaseId	= vSameAsEmergencyCaseId
			WHERE EmergencyCaseId = prm_EmergencyCaseId;

COMMIT;

    SELECT 1 INTO vSuccess;

    INSERT INTO AAU.Logging (OrganisationId, UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (vOrganisationId, prm_UserName,prm_EmergencyCaseId,'EmergencyCase','Update Outcome', NOW());

ELSEIF vEmNoExists >= 1 THEN

	SELECT 2 INTO vSuccess;

ELSEIF prm_UpdateTime < vUpdateTime THEN

	SELECT 3 INTO vSuccess; -- Already updated
    
ELSE
	SELECT 4 INTO vSuccess; -- Other error   
END IF;
    
	CALL AAU.sp_GetOutstandingRescueByEmergencyCaseId(prm_EmergencyCaseId, null);
    
    SELECT vSuccess AS `success`, vSocketEndPoint AS `socketEndPoint`;

END$$
DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateLeaveRequest !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateLeaveRequest( 	IN prm_UserName VARCHAR(45),
												IN prm_LeaveRequestId INTEGER,
												IN prm_DepartmentId INTEGER,
												IN prm_UserId INTEGER,
												IN prm_RequestDate DATE,
												IN prm_LeaveRequestReasonId INTEGER,
												IN prm_AdditionalInformation TEXT,
												IN prm_LeaveStartDate DATE,
												IN prm_LeaveEndDate DATE,
												IN prm_Granted TINYINT,
												IN prm_CommentReasonManagementOnly TEXT,
												IN prm_DateApprovedRejected DATETIME,
												IN prm_RecordedOnNoticeBoard TINYINT,
                                                IN prm_WithinProtocol TINYINT,
                                                IN prm_FestivalId INT,
												IN prm_IsDeleted TINYINT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 16/11/2022
Purpose: Update a leave request

*/

DECLARE vLeaveRequestExists INT;
DECLARE vSuccess INT;

SET vLeaveRequestExists = 0;
SET vSuccess = 0;

	SELECT COUNT(1) INTO vLeaveRequestExists FROM AAU.LeaveRequest WHERE LeaveRequestId = prm_LeaveRequestId;
    
    IF(vLeaveRequestExists = 1) THEN
    
	UPDATE AAU.LeaveRequest SET
		LeaveRequestId				= prm_LeaveRequestId,
		UserId						= prm_UserId,
		RequestDate					= prm_RequestDate,
		LeaveRequestReasonId		= prm_LeaveRequestReasonId,
		AdditionalInformation		= prm_AdditionalInformation,
		LeaveStartDate				= prm_LeaveStartDate,
		LeaveEndDate				= prm_LeaveEndDate,
		Granted						= prm_Granted,
		CommentReasonManagementOnly = prm_CommentReasonManagementOnly,
		DateApprovedRejected		= prm_DateApprovedRejected,
		RecordedOnNoticeBoard		= prm_RecordedOnNoticeBoard,
        WithinProtocol				= prm_WithinProtocol,
        FestivalId					= prm_FestivalId,
		IsDeleted					= prm_IsDeleted
	WHERE LeaveRequestId = prm_LeaveRequestId;
    
    SELECT 1 INTO vSuccess;
    
    	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
		VALUES (prm_Username,prm_LeaveRequestId,'Leave Request','Update', NOW());
    
    ELSE
    
    SELECT 2 INTO vSuccess; 
    
    END IF;
    
    SELECT vSuccess AS `success`, prm_LeaveRequestId AS `leaveRequestId`;
    

END$$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateRotaDayAssignment !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateRotaDayAssignment( 	IN prm_UserName VARCHAR(45),
													IN prm_rotaDayId INTEGER,
                                                    IN prm_userId INTEGER,
													IN prm_actualStartTime TIME,
													IN prm_actualEndTime TIME,
													IN prm_actualBreakStartTime TIME,
													IN prm_actualBreakEndTime TIME,
													IN prm_notes VARCHAR(1024))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 16/11/2022
Purpose: Update an assignment

*/

DECLARE vRotaDayExists INT;
DECLARE vSuccess INT;

SET vRotaDayExists = 0;
SET vSuccess = 0;

	SELECT COUNT(1) INTO vRotaDayExists FROM AAU.RotaDayAssignment WHERE RotaDayId = prm_rotaDayId;
    
    IF(vRotaDayExists = 1) THEN

	UPDATE AAU.RotaDayAssignment SET
		UserId = prm_userId,
		ActualStartTime = prm_actualStartTime,
		ActualEndTime = prm_actualEndTime,
		ActualBreakStartTime = prm_actualBreakStartTime,
		ActualBreakEndTime = prm_actualBreakEndTime,
		Notes = prm_notes
	WHERE RotaDayId = prm_rotaDayId;
    
    SELECT 1 INTO vSuccess;
    
    ELSE
    
    SELECT 2 INTO vSuccess; 
    
    END IF;
    
    SELECT vSuccess AS `success`;
    

END$$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateUserById !!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpdateUserById(IN prm_UserId INT,
										IN prm_EmployeeNumber VARCHAR(32) CHARACTER SET UTF8MB4,
										IN prm_FirstName VARCHAR(64) CHARACTER SET UTF8MB4,
										IN prm_Surname VARCHAR(64) CHARACTER SET UTF8MB4,
                                        IN prm_Initials VARCHAR(64) CHARACTER SET UTF8MB4,
                                        IN prm_Colour VARCHAR(64) CHARACTER SET UTF8MB4,
										IN prm_Telephone VARCHAR(64) CHARACTER SET UTF8MB4,
                                        IN prm_UserName VARCHAR(64) CHARACTER SET UTF8MB4,
                                        IN prm_Password VARCHAR(255) CHARACTER SET UTF8MB4,
										IN prm_RoleId INTEGER,
                                        IN prm_PermissionArray JSON,
                                        IN prm_FixedDayOff JSON,
                                        IN prm_DepartmentId INT,
                                        IN prm_LocalName VARCHAR(64) CHARACTER SET UTF8MB4
										)
BEGIN                                    

/*
Created By: Jim Mackenzie
Created On: 22/08/2018
Purpose: Used to update a user by id.

Modified By: Jim Mackenzie
Modified On: 25/08/2022
Purpose: Adding in employee number. Yes, I know it's stored as a varchar, but you try telling any business that only numbers should be used for an employee number.
*/

DECLARE vUserCount INT;
DECLARE vPassword VARCHAR(255) CHARACTER SET UTF8MB4;
DECLARE vUsernameCount INT;
DECLARE vComboKeyCount INT;
DECLARE vUpdateSuccess INT;
SET vUserCount = 0;
SET vUsernameCount = 0;
SET vComboKeyCount = 0;
SET vUpdateSuccess = 0;

-- Check that the user exists
SELECT COUNT(1), Password INTO vUserCount, vPassword FROM AAU.User WHERE UserId = prm_UserId;

-- Check that the incoming username doesn't exist
SELECT COUNT(1) INTO vUsernameCount FROM AAU.User WHERE UserId <> prm_UserId AND UserName = prm_UserName;

-- Check that the incoming first name, surname and telephone don't already exist
SELECT COUNT(1) INTO vComboKeyCount FROM AAU.User WHERE UserId <> prm_UserId	AND	FirstName	= prm_FirstName
																				AND	Surname		= prm_Surname
																				AND	Telephone	= prm_Telephone;


IF vUserCount = 1 AND vUsernameCount = 0 AND vComboKeyCount = 0 THEN

	UPDATE AAU.User
		SET	EmployeeNumber	= prm_EmployeeNumber,
			FirstName		= prm_FirstName,
			Surname			= prm_Surname,
            Initials   		= prm_Initials,
            Colour     		= prm_Colour,
			Telephone		= prm_Telephone,
            UserName		= prm_UserName,
            Password		= IFNULL(prm_Password , vPassword),
			RoleId			= prm_RoleId,
            PermissionArray = prm_PermissionArray,
            FixedDayOff		= prm_FixedDayOff,
            DepartmentId 	= prm_DepartmentId,
            LocalName		= prm_LocalName
	WHERE UserId = prm_UserId;


SELECT 1 INTO vUpdateSuccess; -- User update OK.

ELSEIF vUserCount = 0 THEN

SELECT 2 INTO vUpdateSuccess; -- User Doesn't exist

ELSEIF vUserCount > 1 THEN

SELECT 3 INTO vUpdateSuccess; -- Multiple records, we have duplicates

ELSEIF vUsernameCount >= 1 THEN

SELECT 4 INTO vUpdateSuccess; -- The username already exists

ELSEIF vComboKeyCount >= 1 THEN

SELECT 5 INTO vUpdateSuccess; -- The first name + surname + telephone number already exists

ELSE

SELECT 6 INTO vUpdateSuccess; -- Return misc 

END IF;

SELECT vUpdateSuccess;



END$$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertAreaShift!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertAreaShift(
		IN prm_Username VARCHAR(45),
		IN prm_AreaShiftId INT,
        IN prm_AreaShiftGUID VARCHAR(128),
        IN prm_RotaVersionId INT,
        IN prm_Sequence INT,
        IN prm_Colour VARCHAR(20),
        IN prm_RotationRoleId INT,
        IN prm_Deleted TINYINT
)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 29/09/2022
Purpose: Procedure to add an Area Shift
*/

DECLARE vSuccess INT;
DECLARE vAreaShiftId INT;
DECLARE vAreaShiftExists INT;
DECLARE vTimeNow DATETIME;

SET vAreaShiftId = prm_AreaShiftId;

SELECT CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vTimeNow
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT COUNT(1) INTO vAreaShiftExists FROM AAU.AreaShift WHERE AreaShiftGUID = prm_AreaShiftGUID;

IF vAreaShiftExists = 0 THEN

INSERT INTO AAU.AreaShift(
	AreaShiftGUID,
	RotaVersionId,    
	Sequence,
    Colour,
    RotationRoleId
)
VALUES(
	prm_AreaShiftGUID,
	prm_RotaVersionId,
    prm_Sequence,
    prm_Colour,
    prm_RotationRoleId
);

	SELECT LAST_INSERT_ID() INTO vAreaShiftId;
    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vAreaShiftId,'AreaShift','Insert', NOW());

ELSEIF vAreaShiftExists = 1 THEN

	UPDATE AAU.AreaShift SET
		Sequence = IF(prm_Deleted = 0, prm_Sequence, -1),
        Colour = prm_Colour,
		RotationRoleId = prm_RotationRoleId,
		IsDeleted = prm_Deleted,
		DeletedDate = IF(prm_Deleted = 1, vTimeNow, NULL)
	WHERE AreaShiftId = prm_AreaShiftId;

	SELECT 1 INTO vSuccess;    

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vAreaShiftId,'AreaShift','Update', NOW());
    
ELSE

SELECT 2 INTO vSuccess;    

END IF;
    
	SELECT vAreaShiftId AS areaShiftId, vSuccess AS success;
    
END $$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertOrganisationDetail !!

DELIMITER $$

-- CALL AAU.sp_UpsertOrganisationDetail('{"Address": "123 Tree Street"}', 'Sarvoham', 2);

CREATE PROCEDURE AAU.sp_UpsertOrganisationDetail (
    IN prm_Address JSON,
	IN prm_Organisation VARCHAR(100),
    IN prm_DriverViewDeskNumber VARCHAR(20),
	IN prm_OrganisationId INT,
    IN prm_VehicleDefaults JSON,
    IN prm_RotaDefaults JSON
)
BEGIN
DECLARE vSuccess INT DEFAULT 0;

UPDATE AAU.Organisation SET Organisation = prm_Organisation WHERE OrganisationId = prm_OrganisationId;

INSERT INTO AAU.OrganisationMetaData (Address, OrganisationId, DriverViewDeskNumber, VehicleDefaults, RotaDefaults)
VALUES (prm_Address, prm_OrganisationId, prm_DriverViewDeskNumber, prm_VehicleDefaults, prm_RotaDefaults) ON DUPLICATE KEY UPDATE
			Address = prm_Address,
            DriverViewDeskNumber = prm_DriverViewDeskNumber,
            VehicleDefaults = prm_VehicleDefaults,
            RotaDefaults = prm_RotaDefaults;
	
	SELECT 1 INTO vSuccess;
	SELECT vSuccess;
    
END$$
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertRotaMatrixItem!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertRotaMatrixItem(
		IN prm_Username VARCHAR(45),
        IN prm_RotaVersionId INT,
        IN prm_AreaShiftGUID VARCHAR(128),
        IN prm_RotationPeriodGUID VARCHAR(128),        
        IN prm_UserId INT
)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 29/09/2022
Purpose: Procedure to add a Rota Matrix Item
*/

DECLARE vSuccess INT;
DECLARE vRotaMatrixItemId INT;
DECLARE vRotaItemExists INT;
DECLARE vTimeNow DATETIME;

SET vRotaItemExists = 0;
SET vRotaMatrixItemId = -1;

SELECT CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vTimeNow
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT RotaMatrixItemId, COUNT(1)  INTO vRotaMatrixItemId, vRotaItemExists FROM AAU.RotaMatrixItem
WHERE AreaShiftGUID = prm_AreaShiftGUID AND RotationPeriodGUID = prm_RotationPeriodGUID
GROUP BY RotaMatrixItemId;

IF vRotaItemExists = 0 THEN

INSERT INTO AAU.RotaMatrixItem(
	RotaVersionId,    
	RotationPeriodGUID,
	AreaShiftGUID,	
	UserId
)
VALUES(
	prm_RotaVersionId,    
	prm_RotationPeriodGUID,
	prm_AreaShiftGUID,	
	prm_UserId
);

	SELECT LAST_INSERT_ID() INTO vRotaMatrixItemId;
    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotaMatrixItemId,'RotaMatrix','Insert', NOW());

ELSEIF vRotaItemExists = 1 THEN

	UPDATE AAU.RotaMatrixItem SET
		UserId = prm_UserId
	WHERE AreaShiftGUID = prm_AreaShiftGUID AND RotationPeriodGUID = prm_RotationPeriodGUID;

	SELECT 1 INTO vSuccess;    

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotaMatrixItemId,'RotaMatrix','Update', NOW());
    
ELSE

SELECT 2 INTO vSuccess;    

END IF;
    
	SELECT vRotaMatrixItemId AS rotaMatrixItemId, vSuccess AS success;
    
END $$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertRotationArea!!

-- CALL AAU.sp_UpsertRotationArea('Jim', NULL, 'A Kennel', 3, '#fffffff', 0)

-- SELECT COUNT(1) FROM AAU.RotationArea WHERE RotationArea = 'A Kennel' AND OrganisationId = 1 AND IsDeleted = 0;


DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertRotationArea(
		IN prm_Username VARCHAR(45),
		IN prm_RotationAreaId INT,
        IN prm_RotationArea VARCHAR(32),
		IN prm_SortOrder INT,
        IN prm_Colour VARCHAR(10),
        IN prm_Deleted TINYINT
)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 27/09/2022
Purpose: Procedure to add rotation areas.
*/

DECLARE vSuccess INT;
DECLARE vRotationAreaId INT;
DECLARE vRotationAreaIdExists INT;
DECLARE vOrganisationId INT;
DECLARE vTimeNow DATETIME;

SET vRotationAreaId = prm_RotationAreaId;

SELECT u.OrganisationId, CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vOrganisationId, vTimeNow
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT COUNT(1) INTO vRotationAreaIdExists FROM AAU.RotationArea WHERE RotationArea = prm_RotationArea AND OrganisationId = vOrganisationId AND IsDeleted = 0;

IF ( vRotationAreaIdExists = 0 ) THEN

INSERT INTO AAU.RotationArea(
	OrganisationId,
	RotationArea,
    SortOrder,
    Colour,
	IsDeleted
)
VALUES(
	vOrganisationId,
	prm_RotationArea,
	prm_SortOrder,
    prm_Colour,
    prm_Deleted
);

	SELECT LAST_INSERT_ID() INTO vRotationAreaId;
    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotationAreaId,'Rotation Area','Insert', NOW());
    
ELSEIF ( vRotationAreaIdExists = 1  AND prm_RotationAreaId IS NOT NULL ) THEN

UPDATE AAU.RotationArea SET
	OrganisationId = vOrganisationId,
	RotationArea = prm_RotationArea,
    SortOrder = prm_SortOrder,
    Colour = prm_Colour,
	IsDeleted = prm_Deleted,
    DeletedDate = IF(prm_Deleted = 1, vTimeNow, null)
    WHERE RotationAreaId = prm_rotationAreaId;

    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotationAreaId,'Rotation Area','Update', NOW()); 

ELSEIF ( vRotationAreaIdExists = 1  AND prm_RotationAreaId IS NULL ) THEN

SELECT 2 INTO vSuccess;

ELSE

SELECT 3 INTO vSuccess;

END IF;
    
	SELECT vRotationAreaId AS rotationAreaId, vSuccess AS success;
    
END$$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertRotationPeriod!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertRotationPeriod(
		IN prm_Username VARCHAR(45),
		IN prm_RotationPeriodId INT,
        IN prm_RotationPeriodGUID VARCHAR(128),
        IN prm_RotaVersionId INT,
        IN prm_Name VARCHAR(128),
        IN prm_StartDate DATE,
        IN prm_EndDate DATE,
        IN prm_Locked TINYINT,   
        IN prm_Deleted TINYINT
)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 29/09/2022
Purpose: Procedure to add rotationPeriod
*/

DECLARE vSuccess INT;
DECLARE vRotationPeriodExists INT;
DECLARE vTimeNow DATETIME;
DECLARE vRotationPeriodId INT;

SET vRotationPeriodExists = 0;
SET vRotationPeriodId = prm_RotationPeriodId;

SELECT CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vTimeNow
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

-- SELECT COUNT(1) INTO vRotationPeriodExists FROM AAU.RotationPeriod WHERE RotaVersionId = prm_RotaVersionId AND StartDate <= prm_EndDate AND EndDate >= prm_StartDate ;
SELECT COUNT(1) INTO vRotationPeriodExists FROM AAU.RotationPeriod WHERE RotationPeriodGUID = prm_RotationPeriodGUID AND StartDate <= prm_EndDate AND EndDate >= prm_StartDate ;

IF vRotationPeriodExists = 0 THEN

INSERT INTO AAU.RotationPeriod(
	RotationPeriodGUID,
	RotaVersionId,
    `Name`,
	StartDate,
    EndDate
)
VALUES(
	prm_RotationPeriodGUID,
	prm_RotaVersionId,
    prm_Name,
    prm_StartDate,
    prm_EndDate
);

	SELECT LAST_INSERT_ID() INTO vRotationPeriodId;
    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotationPeriodId,'RotationPeriod','Insert', NOW());

ELSEIF vRotationPeriodExists = 1 THEN

	UPDATE AAU.RotationPeriod SET
		`Name`		= prm_Name,
		StartDate	= prm_StartDate,
		EndDate		= prm_EndDate,
        `Locked`	= prm_Locked,
		IsDeleted	= prm_Deleted,
		DeletedDate = IF(prm_Deleted = 1, vTimeNow, NULL)         
	WHERE RotationPeriodId = vRotationPeriodId;

	SELECT 1 INTO vSuccess;    

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotationPeriodId,'RotationPeriod','Update', NOW());
    
ELSE

SELECT 2 INTO vSuccess;    

END IF;
    
	SELECT vRotationPeriodId AS rotationPeriodId, vSuccess AS success;
    
END $$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertRotationRoleShiftSegment!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertRotationRoleShiftSegment(
										IN prm_Username VARCHAR(45),        
										IN prm_RotationRoleShiftSegmentId INT,
										IN prm_RotationRoleId INT,
										IN prm_StartTime TIME,
										IN prm_EndTime TIME,
										IN prm_SameDay TINYINT,
										IN prm_ShiftSegmentTypeId INT,
                                        IN prm_IsDeleted TINYINT
)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 20/12/2022
Purpose: Procedure to add rotation role shift segments.
*/

DECLARE vSuccess INT;
DECLARE vRotationRoleShiftSegmentId INT;
DECLARE vRotationRoleShiftSegmentExists INT;
DECLARE vOrganisationId INT;
DECLARE vTimeNow DATETIME;

SET vRotationRoleShiftSegmentId = prm_RotationRoleShiftSegmentId;

SELECT u.OrganisationId, CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vOrganisationId, vTimeNow
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT COUNT(1) INTO vRotationRoleShiftSegmentExists FROM AAU.RotationRoleShiftSegment WHERE RotationRoleShiftSegmentId = prm_RotationRoleShiftSegmentId AND IsDeleted = 0;

IF ( vRotationRoleShiftSegmentExists = 0 ) THEN

INSERT INTO AAU.RotationRoleShiftSegment(	
	RotationRoleId,
  OrganisationId,
	StartTime,
	EndTime,
	SameDay,
	ShiftSegmentTypeId,
	IsDeleted
)
VALUES(
	prm_RotationRoleId,
  vOrganisationId,
	prm_StartTime,
	prm_EndTime,
	prm_SameDay,
	prm_ShiftSegmentTypeId,
	prm_IsDeleted
);

	SELECT LAST_INSERT_ID() INTO vRotationRoleShiftSegmentId;
    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotationRoleShiftSegmentId,'Rotation Role Shift Segment','Insert', NOW());
    
ELSEIF ( vRotationRoleShiftSegmentExists = 1  AND prm_RotationRoleShiftSegmentId IS NOT NULL ) THEN

UPDATE AAU.RotationRoleShiftSegment SET  
 	StartTime			= prm_StartTime,
	EndTime				= prm_EndTime,
	SameDay				= prm_SameDay,
	ShiftSegmentTypeId 	= prm_ShiftSegmentTypeId,
	IsDeleted			= prm_IsDeleted,
    DeletedDate			= IF(prm_IsDeleted = 1, vTimeNow, null)
    WHERE RotationRoleShiftSegmentId = prm_RotationRoleShiftSegmentId;

    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotationRoleShiftSegmentId,'Rotation Role Shift Segment','Update', NOW());
    
ELSEIF ( vRotationRoleShiftSegmentExists = 1  AND prm_RotationRoleShiftSegmentId IS NULL ) THEN

	SELECT 2 INTO vSuccess;
    
    ELSE
    
    SELECT 3 INTO vSuccess;

END IF;
    
	SELECT vRotationRoleShiftSegmentId AS rotationRoleShiftSegmentId, vSuccess AS success;
    
END$$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertRotationRole!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertRotationRole(
		IN prm_Username VARCHAR(45),
		IN prm_RotationRoleId INT,
        IN prm_RotationAreaId INT,
        IN prm_RotationRole VARCHAR(45),
        IN prm_Colour VARCHAR(10),
		IN prm_SortOrder INT,        
        IN prm_Deleted TINYINT
)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 27/09/2022
Purpose: Procedure to add rotation Roles.
*/

DECLARE vSuccess INT;
DECLARE vRotationRoleId INT;
DECLARE vRotationRoleIdExists INT;
DECLARE vOrganisationId INT;
DECLARE vTimeNow DATETIME;

SET vRotationRoleId = prm_RotationRoleId;

SELECT u.OrganisationId, CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vOrganisationId, vTimeNow
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT COUNT(1) INTO vRotationRoleIdExists FROM AAU.RotationRole WHERE RotationRole = prm_RotationRole AND OrganisationId = vOrganisationId AND IsDeleted = 0;

IF ( vRotationRoleIdExists = 0 ) THEN

INSERT INTO AAU.RotationRole(	
	OrganisationId,
	RotationRole,
    RotationAreaId,
	Colour,
	SortOrder,
	IsDeleted
)
VALUES(
	vOrganisationId,
	prm_RotationRole,
    prm_RotationAreaId,
    prm_Colour,
	prm_SortOrder,
    prm_Deleted
);

	SELECT LAST_INSERT_ID() INTO vRotationRoleId;
    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotationRoleId,'Rotation Role','Insert', NOW());
    
ELSEIF ( vRotationRoleIdExists = 1  AND prm_RotationRoleId IS NOT NULL ) THEN

UPDATE AAU.RotationRole SET
	OrganisationId		= vOrganisationId,    
	RotationRole		= prm_RotationRole,
    RotationAreaId		= prm_RotationAreaId,
    Colour				= prm_Colour,
    SortOrder			= prm_SortOrder,    
	IsDeleted			= prm_Deleted,
    DeletedDate			= IF(prm_Deleted = 1, vTimeNow, null)
    WHERE RotationRoleId = prm_rotationRoleId;

    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotationRoleId,'Rotation Role','Update', NOW());
    
ELSEIF ( vRotationRoleIdExists = 1  AND prm_RotationRoleId IS NULL ) THEN

	SELECT 2 INTO vSuccess;
    
    ELSE
    
    SELECT 3 INTO vSuccess;

END IF;
    
	SELECT vRotationRoleId AS rotationRoleId, vSuccess AS success;
    
END$$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertRotaVersion!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertRotaVersion(
		IN prm_Username VARCHAR(45),
        IN prm_RotaId INT,
		IN prm_RotaVersionId INT,
		IN prm_RotaVersionName VARCHAR(64),
        IN prm_DefaultRotaVersion TINYINT,        
        IN prm_Deleted TINYINT
)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 27/09/2022
Purpose: Procedure to add rota version
*/

DECLARE vSuccess INT;
DECLARE vRotaVersionId INT;
DECLARE vOrganisationId INT;
DECLARE vTimeNow DATETIME;
DECLARE vRotaVersionExists TINYINT;

SET vRotaVersionId = prm_RotaVersionId;

SELECT u.OrganisationId, CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vOrganisationId, vTimeNow
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT COUNT(1) INTO vRotaVersionExists FROM AAU.RotaVersion WHERE RotaVersionId = prm_RotaVersionId;

IF(prm_DefaultRotaVersion = 1) THEN

UPDATE AAU.RotaVersion SET DefaultRotaVersion = 0 WHERE DefaultRotaVersion = 1 AND RotaId = prm_RotaId;

END IF;

IF vRotaVersionExists = 0 THEN

	INSERT INTO AAU.RotaVersion (
		OrganisationId,
		RotaId,
		RotaVersionName,
		DefaultRotaVersion
	)
	VALUES(
		vOrganisationId,
		prm_RotaId,
		prm_RotaVersionName,
		prm_DefaultRotaVersion
	);

    SELECT LAST_INSERT_ID() INTO vRotaVersionId;
    
    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotaVersionId,'RotationVersion','Insert', NOW());

ELSEIF vRotaVersionExists = 1 THEN

	UPDATE AAU.RotaVersion SET
	RotaVersionName = prm_RotaVersionName,
	DefaultRotaVersion = prm_DefaultRotaVersion,
	IsDeleted = prm_Deleted,
	DeletedDate = IF(prm_Deleted = 1, vTimeNow, NULL)
    WHERE RotaVersionId = prm_RotaVersionId;
    
	SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotaVersionId,'RotationVersion','Update', NOW());

ELSE

	SELECT 2 INTO vSuccess;

END IF ;


    
	SELECT vRotaVersionId AS rotaVersionId, vSuccess AS success;
    
END $$

DELIMITER ;
DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpsertRota!!

DELIMITER $$
CREATE PROCEDURE AAU.sp_UpsertRota(
		IN prm_Username VARCHAR(45),
		IN prm_RotaId INT,
		IN prm_RotaName VARCHAR(64),
        IN prm_DefaultRota TINYINT,
        IN prm_Deleted TINYINT
)
BEGIN
/*
Created By: Jim Mackenzie
Created On: 27/09/2022
Purpose: Procedure to add rota
*/

DECLARE vSuccess INT;
DECLARE vRotaId INT;
DECLARE vRotaExists INT;
DECLARE vOrganisationId INT;
DECLARE vTimeNow DATETIME;

SET vRotaId = prm_RotaId;

SELECT u.OrganisationId, CONVERT_TZ(NOW(),'+00:00',o.TimeZoneOffset) INTO vOrganisationId, vTimeNow
FROM AAU.User u
INNER JOIN AAU.Organisation o ON o.OrganisationId = u.OrganisationId
WHERE UserName = prm_Username LIMIT 1;

SELECT COUNT(1) INTO vRotaExists FROM AAU.Rota WHERE RotaId = prm_RotaId;

IF(prm_DefaultRota = 1) THEN

UPDATE AAU.Rota SET DefaultRota = 0 WHERE DefaultRota = 1;

END IF;

IF vRotaExists = 0 THEN

INSERT INTO AAU.Rota(
	OrganisationId,
	RotaName,
	DefaultRota
)
VALUES(
	vOrganisationId,
	prm_RotaName,
	prm_DefaultRota
);

	SELECT LAST_INSERT_ID() INTO vRotaId;
    SELECT 1 INTO vSuccess;

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotaId,'Rota','Insert', NOW());

ELSEIF vRotaExists = 1 THEN

	UPDATE AAU.Rota SET
	RotaName = prm_RotaName,
	DefaultRota = prm_DefaultRota,
	IsDeleted = prm_Deleted,
	DeletedDate = IF(prm_Deleted = 1, vTimeNow, NULL)
	WHERE RotaId = prm_rotaId;

	SELECT 1 INTO vSuccess;    

	INSERT INTO AAU.Logging (UserName, RecordId, ChangeTable, LoggedAction, DateTime)
	VALUES (prm_Username,vRotaId,'Rota','Update', NOW());
    
ELSE

SELECT 2 INTO vSuccess;    

END IF;
    
	SELECT vRotaId AS rotaId, vSuccess AS success;
    
END $$

DELIMITER ;
