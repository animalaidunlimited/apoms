ALTER TABLE AAU.PatientMediaItem
ADD COLUMN IsPrimary TINYINT AFTER URL;


-- Select *
-- FROM
-- (SELECT *, Row_Number()
-- Over(Partition by tagNumber
-- Order by LatestCount desc)as MaxCount FROM AAU.census c
-- )b
-- Inner Join 
-- Where b.MaxCount = 1 