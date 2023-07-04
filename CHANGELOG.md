# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to Semantic Versioning](https://semver.org/spec/v2.0.0.html)

## 4.0.0

- Replace logger.drain with logger.waitForTransports, which does not block subsequent messages from being logged

## 3.1.0

- Add support for asynchronous transports via logger.drain

## 3.0.7

- Add node v20 to testing matrix
- Delete package-lock.json from version control (it was causing issues with node 14)
- Improve tests

## 3.0.6

- Introduce eslint-config-airbnb-base

## 3.0.5

- Add .npmignore

## 3.0.4

- Added missing return types to enable and disable methods for typescript

## 3.0.3

- Exposed satisfies method to typescript

## 3.0.2

- Add missing logger.disable and logger.enable methods to types

## 3.0.1

- Fix bug where messages were being treated as context items

## 3.0.0

- Port the error processor functionality to the context processor and deprecate the error processor. See https://github.com/acuminous/tripitaka/issues/8
- Support Array contexts
- Add empty processor for reporting missing messages
- Improve the human processor
- Introduce to prettier

## 2.1.7

- Added Level.lookup to typscript definitions

## 2.1.6

- Added level lookup by string

## 2.1.5

- Improve express example

## 2.1.4

- Improve typescript definitions

## 2.1.3

- Improve typescript definitions

## 2.1.2

- Improve typescript definitions

## 2.1.1

- Improve typescript definitions

## 2.1.0

- First stab at typescript definitions

## 2.0.0

- Error processor consistently prefers error properties to supplied record
- Human processor no longer prefers error.message to natural message
- Update to zUnit
- Minor tidy up

## 1.0.4

- Improve readme
- Improve examples

## 1.0.3

- Fix description

## 1.0.2

- Add examples
- Add index processor
- Fix typos

## 1.0.1

- Fix typo in readme

## 1.0.0

- First version
