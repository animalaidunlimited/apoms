DELIMITER !!

DROP PROCEDURE IF EXISTS AAU.sp_UpdateVehicleShiftStaff!!

DELIMITER $$

-- CALL AAU.sp_UpdateVehicleShiftStaff('Jim', '2021-07-17');

CREATE PROCEDURE AAU.sp_UpdateVehicleShiftStaff(IN prm_VehicleShiftId INT, IN prm_UserList VARCHAR(1000) ) 
BEGIN

/*
Created By: Jim Mackenzie
Created On: 2021-07-17
Purpose: Procedure to insert users for a shift. This procedures also soft deletes any existing users on the shift.
*/

DECLARE vUpdated INT;
DECLARE vInserted INT;
DECLARE vSuccess INT;

SET vUpdated = -1;
SET vInserted = -1;
SET vSuccess = 0;

WITH IncomingUserCTE AS
(
SELECT prm_VehicleShiftId, UserId
FROM
  JSON_TABLE(
    prm_UserList,
    "$[*]" COLUMNS(
      UserId VARCHAR(100) PATH "$.userId"
    )
  ) shiftUser
)

  -- Set all of the missing users to deleted
UPDATE AAU.VehicleShiftUser vsu
LEFT JOIN IncomingUserCTE iu ON vsu.vehicleShiftId = prm_VehicleShiftId AND iu.UserId = vsu.UserId
SET IsDeleted = 1, DeletedDate = NOW()
WHERE iu.UserId IS NULL
AND vsu.vehicleShiftId = prm_VehicleShiftId;

  SELECT ROW_COUNT() INTO vUpdated;
  
-- Now only insert the records that don't already exist
INSERT INTO AAU.VehicleShiftUser (VehicleShiftId, UserId) 
SELECT prm_VehicleShiftId, UserId
FROM
  JSON_TABLE(
    prm_UserList,
    "$[*]" COLUMNS(
      UserId VARCHAR(100) PATH "$.userId"
    )
  ) shiftUser
WHERE shiftUser.UserId NOT IN (SELECT UserId FROM AAU.VehicleShiftUser WHERE VehicleShiftId = prm_VehicleShiftId AND IFNULL(IsDeleted,0) = 0);
  
  SELECT ROW_COUNT() INTO vInserted;
  
  IF vInserted >= 0 OR vUpdated >= 0 THEN
	SET vSuccess = 1;
  END IF;
  
  
SELECT prm_VehicleShiftId AS vehicleShiftId, vSuccess AS 'success';
		

END $$

