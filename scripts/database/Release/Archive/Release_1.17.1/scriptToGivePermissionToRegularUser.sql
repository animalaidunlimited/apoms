SET SQL_SAFE_UPDATES = 0;

UPDATE AAU.User SET PermissionArray = '[2, 4, 6, 8, 10, 12]' WHERE Username IN (
	SELECT DISTINCT Username FROM AAU.Logging 
);
