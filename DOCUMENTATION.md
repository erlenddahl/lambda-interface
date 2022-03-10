# The online demonstrator

![](docs/header.png)

The online demonstrator is meant to be a simple map-based tool for testing the path loss calculations. Base stations can be placed on the map, and the tool can be used to calculate path loss between a selected base station and a certain point on the map, or between selected base stations and the road network.

In general, hold your mouse over something in the tool to get a mouseover explanation. The rest of this document explains everything in further detail.

For long-running calculations with high performance requirements, it is recommended to download the model executable and run it on your own calculation computer, as the current server and queue system may make calculations take a long time. See the 'Offline calculations' section further down.

Warning: The online demonstrator has primarly been tested in Mozilla Firefox and Google Chrome. It will probably work in most modern browsers, but it should not be surprising if there are issues in older browsers such as Internet Explorer.

## What is a "base station" in this tool?
In the current implementation of the tool, a "base station" is actually more like an "antenna" -- it is a single signal source. If you need to simulate a base station with multiple antennas, you must zoom in as much as you can and place the antennas very close to each other, or use offline calculations where you can defined multiple "base stations" on the same coordinate.

## Placing new base stations on the map
To place a new station on the map, click on the map where you want to place it, and pick "Create new station at this location" in the context menu that appears. The station will then appear as a gray circle, which will be colorized when it has been saved. Edit the base station parameters as required, and click "Save station" to finalize it.

![](docs/create-station.gif)

## Base station visualization
Base stations are visualized as a circle with a surrounding signal strength indicator depending on their combined power and gain.

The center circle is colored depending on the station's state:
 - Red: normal
 - Gray: new/unsaved
 - Green: selected for editing
 - Blue: selected for calculations

The surrounding signal strength indicator will visualize the power+gain for each degree of a circle. The coloring of the signal strength indicator always moves from red to green, with no relevance for the signal strength.

The figure below shows a visualization for a station with a power of 50, and a gain of 18 to 28 around the 0 degree mark (stright East). This station will have a larger RSRP on the right hand side than on the left hand side.

![](docs/station-visualization.png)

Note that too large signal strengths will be capped at 128 pixels, resulting in the entire indicator being shrunk to fit this size. The visualization can therefore not be used to provide a detailed signal strength comparison, it is meant as a convenient way of quickly visually separating different stations from each other.

## Editing existing base stations
To edit an existing base station, pick "Info/Edit" in menu in the top left corner, then click the station you want to edit. When you are done, remember to click "Save changes", or "Cancel" if you want to undo your current edits.

## Removing base stations
To remove a base station, pick "Info/Edit" in menu in the top left corner, click the station you want to edit, then click "Delete station" below the editor. This cannot be undone.

## Importing/exporting data
To import base stations to the tool, you can use the "List" item in the menu in the upper left corner, and click "Import CSV". This allows you to import a simple CSV format with the parameters used in this tool.

To export base stations as CSV, click "Export CSV" at the bottom of the station list. This exports data in the same CSV format as above.

## Picking map layers
In addition to your base stations and calculation results, you can also toggle layers showing infrastructure (from infrastructure.org) or the road network used in the road network calculations using the layer picker in the upper right corner. Click a layer to turn it on or off. For all layers, you can hold your mouse over an element on the map to get further information.

## Running path loss calculations from a base station to a point
To run a path loss calculation from a base station to a point on the map, you need to select a base station first. Pick "Info/Edit" in menu in the top left corner, then click the station you want to calculate from. When a station is selected (green center circle), you can click anywhere on the map and select "Calculate path loss from (station name)".

![](docs/single-point-calculation.gif)

For performance reasons, a maximum of 1000 points are visualized in the plot. If the distance is greater than 1000 meters, a regular number of points are skipped between each visualized point, so that the number of points does not exceed 1000. In these cases, the distance between each visualized point will therefore be more than 1 meter. For more detail, the complete results can be exported as CSV.

Note that results are reported as RSRP, but if this is an ITS G5 station, it corresponds to a simplified RSSI (the same calculation as for RSRP, but without the resource block term). See the 'RSRP vs RSSI in the results' for more about this.

## Running road network calculations
## Showing results from road network calculations

## RSRP vs RSSI in the results
## Station parameters
## Performance
## Offline calculations

# The command line application
## Calculation modes
## Path loss models
### Mobile network
### ITS G5
### Implementing new models
## Elevation data
