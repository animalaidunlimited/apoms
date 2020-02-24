DELIMITER $$
CREATE PROCEDURE AAU.sp_GetCallerById ( IN prm_CallerId INT, OUT prm_Success INT)
BEGIN

/*
Created By: Jim Mackenzie
Created On: 23/02/2020
Purpose: Used to return a Caller by ID.
*/

SELECT	
	CallerId,
	Name,
	PreferredName,
	Number,
	AlternativeNumber,
	Email,
	Address,
	CreatedDate,
	IsDeleted,
	DeletedDate
FROM AAU.Caller
WHERE CallerId = prm_CallerId;

SELECT 1 INTO prm_Success;


END$$
DELIMITER ;
