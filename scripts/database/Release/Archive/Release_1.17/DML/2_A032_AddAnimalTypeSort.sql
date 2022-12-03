DROP PROCEDURE IF EXISTS `?`;
DELIMITER //
CREATE PROCEDURE `?`()
BEGIN
  DECLARE CONTINUE HANDLER FOR SQLEXCEPTION BEGIN END;
 ALTER TABLE AAU.AnimalType
ADD COLUMN `Sort` INTEGER;
END //
DELIMITER ;
CALL `?`();
DROP PROCEDURE `?`;

WITH AnimalTypeCTE AS
(
SELECT aty.AnimalType, LEFT(aty.AnimalType,1) AS `FirstChar`, COUNT(1) AS `AnimalTypeCount`
FROM AAU.Patient p
INNER JOIN AAU.AnimalType aty ON aty.AnimalTypeId = p.AnimalTypeId
GROUP BY aty.AnimalType, LEFT(aty.AnimalType,1)
)

UPDATE AAU.AnimalType aty
LEFT JOIN
(
SELECT AnimalType, AnimalTypeCount, ROW_NUMBER() OVER (PARTITION BY FirstChar ORDER BY AnimalTypeCount DESC) * 10 AS RNum
FROM AnimalTypeCTE
) sort ON aty.AnimalType = sort.AnimalType
SET aty.Sort = IFNULL(sort.RNum, 100);
