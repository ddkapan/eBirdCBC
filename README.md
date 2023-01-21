# eBirdCBC
Using eBird best practices to generate a best practices CBC count for a given count area. An Electron app that displays a map of the checklist and allows for them to be grouped if they are counting the same individual birds. 

# Installation Instructions

## App
Download the appropriate version of the app for your operating system on the [releases page](https://github.com/ddkapan/eBirdCBC/releases/) of this github. Then run it. I did not pay Apple or Microsoft to sign the app, so you will have to tell the operating system that you trust the app in order to open it. 

You need a version of chrome installed (chrome or chromium). 

# Usage
Input the checklist IDs delimited by a comma (`,`). Or, even better, you can input a trip report and it will get the checklists from the trip report. Click `Submit` to add them to the database. It will open a window and prompt you to sign into eBird. This allows the app to get the tracks, which only the owner of the checklist can access. Let the chrome window do its thing and it will close automatically. Soon after it closes, the checklists and tracks should appear on the map.

Click on the points to view the checklist details. Checklists that are part of the same `group` will have the high counts of the species in them taken. The idea is that you will add checklists that are counting the same areas to the same group so that they will be grouped together and the high counts will be taken, instead of double counting the individual birds. The marker number and track colors should correspond to the `dependent` ID, making it easier to see which checklists are grouped together. 

For a more precise way of grouping birds, use Species View. In Species View, you can group a specific species together with the same species on another checklist. For example, if the same individual Long-tailed Duck was seen on 3 checklists, you can group them together (by adding them to the same group number) so that you will only be counting one LTDU overall. The total count for the species is displayed at the top and in the dropdown menu. Note that the count in the currently selected species in the dropdown menu does not update, but if you open the dropdown menu, you will see the correct count (the correct count is always displayed next to `Total For [Species]`). 

When done grouping and making sure the species total displayed on the app is what you want, you can click `Get Species` to get the species in a csv with columns for the species and the count.

Click `Clear` to clear the database. Note that this cannot be undone. 

The database is stored in the `~/Documents/eBirdCBC/` folder. The best way to share your database is to share the `database.db` file and put it in the same directory on another computer. 
