# Corona-Impftermine

forked by berlin-vac-checker by Pita
https://github.com/Pita/berlin-vac-appointment-checker 

Small node.js script that checks in short periods if Doctolib has a vaccination appointment available. If so, immediately opens a browser window for you so you can book quickly. This script worked mid of May 2021. If Doctolib changes their API, it might stop working. Only tested on intel Mac OS X.

## Usage

Have Node installed. If not google Node.JS and install.
Open Terminal and change directory to this repository folder.
Type in following commands

```shell
npm install
npm run start
```

Feel free to add more places!

## Docker

```shell
docker buildx create --use
docker buildx build --platform linux/amd64,linux/arm64,linux/arm -t stefanscherer/corona-impftermine --push .
```

Run the service

```shell
docker run -d -e SLACK_TOKEN=... stefanscherer/corona-impftermine
```
