#!/bin/bash
set -eu

WORKING_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}"  )" && pwd  )"

# shellcheck source=/dev/null
source "${WORKING_DIR}/step-0-color.sh"

#sudo apt install phantomjs
#./node_modules/protractor/bin/webdriver-manager update --versions.chrome 2.37
#npm install -g bower@1.8.4 grunt@1.0.3 grunt-cli@1.2.0 nsp@2.6.1 webdriver-manager@12.1.0
#npm run update-webdriver
#webdriver-manager update --chrome --versions.chrome=2.37

#TODO
#npm install grunt-phantomas@0.14.0

rm -f package-lock.json || true
./clean.sh

#mvn clean install -Dserver=jetty9x
./mvnw install -Dserver=jetty9x -Prun-integration-test

echo -e "./mvnw clean install org.codehaus.cargo:cargo-maven2-plugin:run -Dserver=jetty9x -Prun-integration-test"

#./docker-build.sh
#docker build --target builder .
#docker build --target builder -t aandrieu/test:latest .
#docker build --target runner .

npm list  > list.log
#npm shrinkwrap

#sudo npm install -g npm-license
npm-license || true

docker-compose -f docker-compose.yml -p TEST ps

exit 0
