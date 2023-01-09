# eBirdCBC
Using eBird best practices to generate a best practices CBC count for a given count area. An Electron app that displays a map of the checklist and allows for them to be grouped if they are counting the same individuals. 

# Installation Instructions

## App
Download the appropriate version of the app for your operating system on the [releases page](https://github.com/ddkapan/eBirdCBC/releases/) of this github. Then run it. Windows is not supported because, umm, windows bad. 

You need chromium installed for it to get the trip reports. On debian-based systems, you can install it with `sudo apt install chromium`. 

# Usage
Input the checklist IDs delimited by a comma (`,`). Or you can input a trip report and it will get the checklists from the trip report. Click `Submit` to add them to the database. It will open a window and prompt you to sign into eBird. This allows the app to get the tracks, which only the owner of the checklist can access. Once you've signed in, don't touch the window while it collects the tracks. 

When it closes the window, wait a few seconds and then click `Get Points` to get the points from the database. You are now in normal view. 

Click on the points to view the checklist details. The `dependent` term means the group that the checklist is a part of. The idea is that you will add checklists that are counting the same areas to the same `dependent` so that they will be grouped together and the high counts will be taken, instead of double counting the individual birds. The marker number and track colors should correspond to the `dependent` ID, making it easier to see which checklists are grouped together. 

For a more precise way of grouping birds, use Species View. In Species View, you can group a specific species together with the same species on another checklist. For example, if the same individual Long-tailed Duck was seen on 3 checklists, you can group them together so that you will only be counting one LTDU overall. The total count for the species is displayed at the top. 

When done grouping and making sure the species total displayed on the app is what you want, you can click `Get Species` to get the species in a csv. 

Click `Get Species` to get a csv that has the appropriate counts for the species. Of course, some manual cleaning will have to be done (for hawks and rare birds that moved between areas), but overall, it should be an accurate representation of the birds seen. 

Click `Clear` to clear the database. Sometimes, it will break when you add more checklists, so clearing it may fix some issues you have. Note that this cannot be undone. 

# Limitations

Sometimes it bugs out for no reason. You must close the app and reopen it. If this doesn't work, you probably need to clear the database. This happens because the database gets messed up and gives the app bad data so it freaks out. The api shuts down after getting the errors, so you have to reopen the app to relaunch the api. 
