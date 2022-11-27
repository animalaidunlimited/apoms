DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_GetLeaveRequests !!

-- CALL AAU.sp_GetLeaveRequests('Jim');

DELIMITER $$
CREATE PROCEDURE AAU.sp_GetLeaveRequests( IN prm_Username VARCHAR(45))
BEGIN

/*
Created By: Jim Mackenzie
Created On: 20/11/2022
Purpose: Retrieve a list of leave requests

*/

DECLARE vOrganisationId INT;

SELECT OrganisationId INTO vOrganisationId FROM AAU.User WHERE UserName = prm_Username LIMIT 1;

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
						JSON_OBJECT("numberOfDays", DATEDIFF(lrl.LeaveEndDate, lrl.LeaveStartDate) + 1)
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
									lrl.Granted = 1 AND
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
AND lr.LeaveStartDate >= CURRENT_DATE();

END$$












