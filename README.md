# eBirdCBC
Using eBird best practices to generate a best practices CBC count for a given count area. An Electron app that displays a map of the checklist and allows for them to be grouped if they are counting the same individuals. 

# Installation Instructions
## Database
This app uses a mongodb, which will run locally. I have yet to find a good way to package mongo with the app, so in the meantime it will have to be run separately. The good news is that docker makes it very easy to start a local mongodb. The easiest way to start a local mongodb is to clone the prebuilt docker image for a mongodb using `docker pull mongo` (download docker [here](https://docs.docker.com/get-docker/) if you don't already have it). Then run the image using `docker run --name mongodb -d -p 27017:27017 mongo` (or use the vscode extension which is easier to use imo). Sometimes it will not let you run the container if it thinks that it's already running. To fix this issue, you may have to stop or remove the hash of the container that it thinks is running. 

## App
Download the appropriate version of the app for your operating system on the [releases page](https://github.com/ddkapan/eBirdCBC/releases/) of this github. Then run it. 

# Usage
Input the checklist IDs delimited by a comma (`,`). Click `Submit` to add them to the database. When first opening the app and adding checklists, it will show a blank screen and "crash." To fix this, reload the app and click `clear`. Now it should function normally. 

Click on the points to view the checklist details. The `dependent` term means the group that the checklist is a part of. The idea is that you will add checklists that are counting the same areas to the same `dependent` so that they will be grouped together and the high counts will be taken, instead of double counting the individual birds. The marker colors should correspond to the `dependent` ID, making it easier to see which checklists are grouped together. 

Click `Get Species` to get a csv that has the appropriate counts for the species. Of course, some manual cleaning will have to be done (for hawks and rare birds that moved between areas), but overall, it should be an accurate representation of the birds seen. 

Click `Clear` to clear the database. Sometimes, it will break when you add more checklists, so clearing it may fix some issues you have. 

# Limitations
Only 30 markers have been created, so the app will not work with more than 30 checklists.

Sometimes it bugs out for no reason (the window will just disappear and it will throw a lot of errors). You must close the app and reopen it and clear the database after reopening the app. This happens because the database gets messed up and gives the app bad data so it freaks out. The api shuts down after getting the errors, so you have to reopen the app to relaunch the api. 
