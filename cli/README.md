[![nps friendly](https://img.shields.io/badge/nps-friendly-blue.svg?style=flat-square)](https://github.com/kentcdodds/nps)

# bloomen wallet cli


# Getting started

1. Go to project folder and create a configuration file .env following  template .env.example:
 ```sh
 cp .env.example .env && vi .env
 ```

2. Install dependencies (If you prefer to use docker jump to point 4):
 ```sh
 npm install
 ```

3. Launch development server, and open `localhost:4200` in your browser:
 ```sh
 npm start
 ```

4. Easy with docker
 ```sh
 docker run  -it -v $(pwd)/.env:/usr/src/bloomen-wallet-cli/.env  -v $(pwd)/data:/usr/src/bloomen-wallet-cli/data bloomenio/bloomen-wallet-cli:1.0.1
 ```
   

# Project structure

```
data/                        Local storage to maintain application state.
src/                         project source code
```

# Main tasks

Task automation is based on [NPM scripts](https://docs.npmjs.com/misc/scripts).

Task                            | Description
--------------------------------|--------------------------------------------------------------------------------------
`npm start`                     | Start command line tool
