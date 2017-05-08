# AdvancedSearch
### AdvancedSearch Class for ArcGIS JS API
The aim of this project is to create a custom (Advanced) Search Class for ArcGIS JS API that extends the normal Search Class' `contains` logic and combines `start with` logic with `contains` logic.
In SQL this means that first `where fieldname like 'exp%'` will be validated then (if necessary) `where fieldname like '%exp%'` will be validated and added to the results.
