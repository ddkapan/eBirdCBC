# eBirdCBC
Using eBird best practices to generate a best practices CBC count for a given count area. A React web app that displays a map of the checklist and allows for them to be grouped if they are counting the same individuals. 

## Instructions to run server and client
Download node from [here](https://nodejs.org/en/download/). Then clone this repo. Then cd to the dir for this repo. 

### Database
This app uses a mongodb, which will run locally (unless you want to try and use Atlas, but local is easier). The easiest way to start a local mongodb is to clone the prebuilt docker image for a mongodb using `docker pull mongo`. Then run the image using `docker run mongo:latest` (or use the vscode extension which is easier to use imo). 

### Api
This app uses an expressjs as a backend. Navigate to `api/` using `cd api`. Then run `npm install` to install the dependencies. 

This app requires an eBird API key. You can get one [here](https://ebird.org/api/keygen). Then, while in the `api/` directory, run the following command, replacing `key` (without quotes) with your key: `export EBIRDKEY='key'`.

Then run `node app.js` to start the api. 

### Client
In a new terminal, navigate to `client/` using `cd client`. Then `npm install` to install dependencies. Then, run `npm start src/App.js` to start the web server using React. It should open in the brower. 

## Usage
Input the checklist IDs delimited by a comma (`,`). Click `Submit` to add them to the database. 

Click `Get Points` to have the points appear on the map. 

Click on the points to view the checklist details. The `dependent` term means the group that the checklist is a part of. The idea is that you will add checklists that are counting the same areas to the same `dependent` so that they will be grouped together and the high counts will be taken, instead of double counting the individual birds. The marker colors should correspond to the `dependent` ID, making it easier to see which checklists are grouped together. 

Click `Get Species` to get a csv that has the appropriate counts for the species. Of course, some manual cleaning will have to be done (for hawks and rare birds that moved between areas), but overall, it should be an accurate representation of the birds seen. 

## Limitations
Only 25 markers have been created, so the app will not work with more than 25 checklists. You can manually create more markers using the python script in the `icon_maker` directory and add them to the `client/public/icons` directory, but I found that more than 25 points makes the colors too similar. 

