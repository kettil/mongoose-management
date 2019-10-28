# Changelog

## [master]

### Features

### Fixes

### Chore & Maintenance

### Performance

## [0.2.1] - 2019-10-28

### Features

- Expand the populate with nested schemas [[#9](https://github.com/kettil/mongoose-management/issues/9)]

## [0.2.0] - 2019-10-24

### Features

- Added feature [populate](https://mongoosejs.com/docs/populate.html) [[#1](https://github.com/kettil/mongoose-management/issues/1)]
- Added feature "Back to collection"

### Chore & Maintenance

- Code coverage of 100% in the CLI section

## [0.1.4] - 2019-10-22

### Fixes

- Default import from mongoose is not defined in model template
- Add a transformer to the toJSON function
- Not all options were displayed when creating a column.
- Empty objects and arrays of objects could not be generated

### Chore & Maintenance

- Update the mongodb and mongoose packages to the latest version.

## [0.1.3] - 2019-09-09

### Features

- Columns that are not required are marked as optional in the typing.

### Fixes

- Shows the columns note only on the main level of the column.
- For projects with custom paths, the custom path was not used when creating a new group.
- When column names are changed, the indexes column data are now updated.
- When creating an index with subcolumns, these were added incorrectly to the schema structure.

### Chore & Maintenance

- Name schema of column indexes changed (e.g. `columnName-unique_` to `columnName_`).
- Internal structure of array of one type (e.g. `[Date]`) changed, from `{ type: 'arrayType', subType: { type: 'date' } }` to `['arrayType', 'date']`.
- Add test cases.

## [0.1.2] - 2019-08-25

### Fixes

- Empty option list when creating or editing columns

## <=0.1.1

- See commit history for changes in previous versions of mongoose-management
