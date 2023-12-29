import React, { useState, useRef, useLayoutEffect } from 'react';
import { MapContainer, TileLayer, Popup, Marker, Polyline, Tooltip } from 'react-leaflet';
import './App.css';
import L, { marker } from 'leaflet';
import axios from 'axios';
import { ExportToCsv } from 'export-to-csv';
import { Dropdown } from 'react-dropdown-now';
import './dropdown.css';
import ebirdcode from './ebirdCodes.json';
import distinctcolors from 'distinct-colors';
import Collapsible from 'react-collapsible';
import './collapsible.css';
import { Group } from './Group';
var zip = require('lodash.zip');


function App() {

  const [checklists, setlist] = useState("");
  const [markers, setpoints] = useState([]);
  const [deps, setdeps] = useState([]);
  //const [icon, setIcon] = useState([])
  const [map, setMap] = useState(null);
  const [number, setNumber] = useState(0);
  const [species, setSpecies] = useState([]);
  const [speciesMode, setSpeciesMode] = useState(false);
  const [speciesForView, setSpeciesView] = useState("");
  const [speciesMarkers, setSpeciesMarkers] = useState([]);
  const [markerColors, setColors] = useState([]);
  const [speciesForViewCount, setCount] = useState(0);
  const [dependentList, setDepList] = useState([]);
  //const [speciesForViewCount, setSpeciesCount] = useState(0);
  const [speciesWithCountsStr, setSpeciesWithCounts] = useState([]);

  // making different icons for each dependency
  const icons = []
  for (let i = 0; i < 999; i++) {
    const image = `https://raw.githubusercontent.com/ddkapan/eBirdCBC/main/icon_maker/icons/icon_${i}.png`
    var icon = L.divIcon({
      className: `icon${i}`,
      html: `<img src=${image}> <style> .icon${i} { background: ${markerColors[i]}; border-radius: 100px } </style>`,
      iconSize: [40, 25],
    });
    icons.push(icon);
  }
  icons.push(
    L.icon({
      iconUrl: 'https://raw.githubusercontent.com/ddkapan/eBirdCBC/main/icon_maker/icons/red_x.png',
      iconSize: [40, 40],
    })
  )
  // console.log(icons);


  async function speciesView(specie) {
    setSpeciesView(specie);
    const points = await axios.get(`http://localhost:9000/get-points`)
      .then(async function (response) {
        console.log("GOT POINTS", response.data);

        // get the species from the database and format them into a string for the popup
        const species = [];
        for (let i = 0; i < response.data.length; i++) {
          const speciesList = [];
          for (let j = 0; j < response.data[i].responseChecklist.obs.length; j++) {
            const sixcode = response.data[i].responseChecklist.obs[j].speciesCode;
            const name = ebirdcode[sixcode];
            if (name === specie) {
              const count = response.data[i].responseChecklist.obs[j].howManyAtleast;
              const code = `${name} (${count})`;
              var comments = (response.data[i].responseChecklist.obs[j].comments);
              if (comments === undefined) {
                speciesList.push(`${code}`);
              } else {
                speciesList.push(`${code} — ${comments}`);
              }
            }

          };
          species.push(speciesList.join('\n'));
        }; // I realized this is useless because we already know the species, but whatever it adds more lines of code

        // get the lists that contain that species
        const contain = [];
        console.log(species);
        for (let i = 0; i < response.data.length; i++) {
          if (species[i] === "") {
            contain.push(false);
          } else {
            contain.push(true);
          }
        };

        const track = [];
        for (let i = 0; i < response.data.length; i++) {
          track.push(response.data[i].responseChecklist.track);
        };
        console.log("tracks", track);
        const locName = [];
        for (let i = 0; i < response.data.length; i++) {
          locName.push(response.data[i].responseChecklist.locName);
        };

        const coords = [];
        for (let i = 0; i < response.data.length; i++) {
          console.log("track", track[i].length === 0);
          if (track[i].length === 0) {
            coords.push(response.data[i].responseChecklist.coords);
          }
          if (track[i].length !== 0) {
            const median = Math.floor(track[i].length / 2);
            coords.push(track[i][median]);
          }
        };
        console.log("coords", coords);

        const countList = []; // actually the count here
        for (let i = 0; i < response.data.length; i++) {
          const counts = [];
          for (let j = 0; j < response.data[i].responseChecklist.obs.length; j++) {
            const sixcode = response.data[i].responseChecklist.obs[j].speciesCode;
            const name = ebirdcode[sixcode];
            if (name == specie) {
              const count = response.data[i].responseChecklist.obs[j].howManyAtleast;
              countList[i] = count;
            }
          };
        };

        setCount(countList);

        const dependent = [];
        for (let i = 0; i < response.data.length; i++) {
          for (let j = 0; j < response.data[i].responseChecklist.obs.length; j++) {
            const sixcode = response.data[i].responseChecklist.obs[j].speciesCode;
            const name = ebirdcode[sixcode];
            if (name == specie) {
              const dep = response.data[i].responseChecklist.obs[j].speciesDependent;
              dependent[i] = dep;
            }
          };
        };

        const date = [];
        for (let i = 0; i < response.data.length; i++) {

          date.push(response.data[i].responseChecklist.obsDt);
        };
        const duration = [];
        for (let i = 0; i < response.data.length; i++) {
          duration.push(Math.round(response.data[i].responseChecklist.durationHrs * 60) + " mins");
        };
        const ID = [];
        for (let i = 0; i < response.data.length; i++) {
          ID.push(response.data[i].responseChecklist.subId);
        };
        const notes = [];
        for (let i = 0; i < response.data.length; i++) {
          notes.push(response.data[i].responseChecklist.comments);
        };

        // get the observer from the database
        const observer = [];
        for (let i = 0; i < response.data.length; i++) {
          observer.push(response.data[i].responseChecklist.userDisplayName);
        };

        const listDependent = [];
        for (let i = 0; i < response.data.length; i++) {
          listDependent.push(response.data[i].responseChecklist.dependent);
        };

        const colorDeps = [];
        for (let i = 0; i < response.data.length; i++) {
          if (dependent[i] == undefined) {
            colorDeps[i] = String(listDependent[i]);
          } else {
            colorDeps[i] = String(dependent[i]);
          }
        };
        console.log("dependent", dependent);

        setDepList(colorDeps);

        var colors = distinctcolors({
          count: response.data.length,
        });
        for (let i = 0; i < colors.length; i++) {
          colors[i] = colors[i].hex();
        }
        console.log(colors);
        const color = [];
        for (let i = 0; i < response.data.length; i++) {
          color.push(colors[Number(colorDeps[i])]);
        };

        // countList is the list of counts for each observation
        let colorsForMarker = [];
        countList.map((count, index) => {
          colorsForMarker[count] = color[index];
        });


        setColors([]);
        return {
          coords: coords,
          dependent: dependent,
          date: date,
          duration: duration,
          ID: ID,
          notes: notes,
          species: species,
          observer: observer,
          locName: locName,
          track: track,
          color: color,
          contain: contain,
          counts: countList,
        };
      })
      .catch(function (error) {
        console.log(error);
      });
    console.log("points", points);
    const data = zip(points.dependent, points.coords, points.date, points.duration,
      points.ID, points.species, points.notes, points.observer, points.locName, points.track, points.color, points.counts);
    console.log("contain", points.contain)
    const filtered_data = data.filter((_r, i) => points.contain[i])
    console.log("filtered", filtered_data);
    setSpeciesMarkers(filtered_data);

    let dep_arr = ['Delete']; // array of dependents
    for (let i = 0; i < data.length; i++) {
      dep_arr.push(String(i))
    };
    setdeps(dep_arr);
    await listSpecies();

  }



  async function listSpecies() {
    const species = await axios.get(`http://localhost:9000/get-species`)
      .then(function (response) {
        console.log("GOT SPECIES", response.data);
        return response.data;
      })
      .catch(function (error) {
        console.log(error);
      });

    const speciesList = [];
    for (let i = 0; i < species.length; i++) {
      speciesList.push(species[i].common_name);
    }

    const counts = [];
    for (let i = 0; i < species.length; i++) {
      counts.push(species[i].count);
    }

    const result = {};
    speciesList.forEach((x, i) => result[x] = counts[i]);
    setSpecies(result);

    let speciesWithCounts = [];
    for (let i = 0; i < species.length; i++) {
      speciesWithCounts.push(`${speciesList[i]} (${species[i].count})`);
    }
    setSpeciesWithCounts(speciesWithCounts);
  }
  //console.log("species", species);

  async function getSpecies() {
    // get the species from the database
    const species = await axios.get(`http://localhost:9000/get-species`)
      .then(function (response) {
        console.log("GOT SPECIES", response.data);
        return response.data;
      })
      .catch(function (error) {
        console.log(error);
      });
    const options = {
      filename: 'generated_species_list',
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      showTitle: true,
      title: 'Species List Generated by eBirdCBC',
      useTextFile: false,
      useBom: true,
      useKeysAsHeaders: true,
    };
    const csvExporter = new ExportToCsv(options);
    csvExporter.generateCsv(species);

  }

  let clear = async () => {
    // clear the database
    await axios.post('http://localhost:9000/clear')
      .then(function (response) {
        console.log("CLEARED", response);
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  let updateDep = async (e) => {
    // update the dependent variable in the database
    await axios.post(`http://localhost:9000/dependency-update?dependent=${e}`)
      .then(function (response) {
        console.log("DEPENDENCY UPDATED", response);
      })
      .catch(function (error) {
        console.log(error);
      });
    getpts();
  };

  // when the form is submitted, add the checklists to the database
  async function handleSubmit(e) {
    e.preventDefault();
    async function findChecklist() {
      if (!checklists.includes('S')) {
        var data = await axios.get(`http://localhost:9000/report?number=${checklists}`)
          .then(function (response) {
            console.log("GOT CHECKLISTS", response.data);
            return response.data;
          }
          )
      }
      else {
        var data = checklists.replace(/\s/g, "").split(","); // remove whitespace and split by comma
      }
      return data;
    }
    // if a trip report, as the api to get the checklists

    // add the checklists to the database
    const getChecklist = async (a) => {
      await axios.put(`http://localhost:9000/add-check?checklist=${a}`)
        .then(function (response) {
          console.log("PUT CHECKLISTS", response);
        }).catch(function (error) {
          console.log(error);
        });
    };
    const updateDep = async (a) => {
      await axios.post(`http://localhost:9000/dependency-update?dependent=${a}`)
        .then(function (response) {
          console.log("DEPENDENCY UPDATED", response);
        })
        .catch(function (error) {
          console.log(error);
        });
    };
    const data = await findChecklist();

    console.log(JSON.stringify(data))
    let ignore = await getChecklist(JSON.stringify(data));
    // for (let i = 0; i < data.length; i++) {
    //     await updateDep(`${data[i]},${i}`);
    //   console.log("added", String(`${data[i]},${i}`));
    // };

    await getpts(ignore);

  }



  let getpts = async () => {
    // get the points from the database
    const points = await axios.get(`http://localhost:9000/get-points`)
      .then(async function (response) {
        console.log("GOT POINTS", response.data);

        const track = [];
        for (let i = 0; i < response.data.length; i++) {
          track.push(response.data[i].responseChecklist.track);
        };
        const locName = [];
        for (let i = 0; i < response.data.length; i++) {
          locName.push(response.data[i].responseChecklist.locName);
        };
        const coords = [];
        for (let i = 0; i < response.data.length; i++) {
          console.log("track", track[i].length === 0);
          if (track[i].length === 0) {
            coords.push(response.data[i].responseChecklist.coords);
          }
          if (track[i].length !== 0) {
            const median = Math.floor(track[i].length / 2);
            coords.push(track[i][median]);
          }
        };
        const dependent = [];
        for (let i = 0; i < response.data.length; i++) {
          dependent.push(response.data[i].responseChecklist.dependent);
        };
        const date = [];
        for (let i = 0; i < response.data.length; i++) {

          date.push(response.data[i].responseChecklist.obsDt);
        };
        const duration = [];
        for (let i = 0; i < response.data.length; i++) {
          duration.push(Math.round(response.data[i].responseChecklist.durationHrs * 60) + " mins");
        };
        const ID = [];
        for (let i = 0; i < response.data.length; i++) {
          ID.push(response.data[i].responseChecklist.subId);
        };
        const notes = [];
        for (let i = 0; i < response.data.length; i++) {
          notes.push(response.data[i].responseChecklist.comments);
        };
        // get the species from the database and format them into a string for the popup
        const species = [];
        for (let i = 0; i < response.data.length; i++) {
          const speciesList = [];
          for (let j = 0; j < response.data[i].responseChecklist.obs.length; j++) {
            const sixcode = response.data[i].responseChecklist.obs[j].speciesCode;
            const name = ebirdcode[sixcode];
            const count = response.data[i].responseChecklist.obs[j].howManyAtleast;
            const code = `${name} (${count})`;
            var comments = (response.data[i].responseChecklist.obs[j].comments);
            if (comments === undefined) {
              speciesList.push(`${code}`);
            } else {
              speciesList.push(`${code} — ${comments}`);
            }

          };
          species.push(speciesList.join('\n'));
        };
        // get the observer from the database
        const observer = [];
        for (let i = 0; i < response.data.length; i++) {
          observer.push(response.data[i].responseChecklist.userDisplayName);
        };

        var colors = distinctcolors({
          count: response.data.length,
        });
        for (let i = 0; i < colors.length; i++) {
          colors[i] = colors[i].hex();
        }
        console.log(colors);
        const color = [];
        for (let i = 0; i < response.data.length; i++) {
          color.push(colors[Number(response.data[i].responseChecklist.dependent)]);
        };
        setColors(colors);
        return {
          coords: coords,
          dependent: dependent,
          date: date,
          duration: duration,
          ID: ID,
          notes: notes,
          species: species,
          observer: observer,
          locName: locName,
          track: track,
          color: color,
        };
      })
      .catch(function (error) {
        console.log(error);
      });
    console.log(points);
    const data = zip(points.dependent, points.coords, points.date, points.duration,
      points.ID, points.species, points.notes, points.observer, points.locName, points.track, points.color);
    console.log(data);
    setpoints(data);

    let dep_arr = ['Delete']; // array of dependents
    for (let i = 0; i < data.length; i++) {
      dep_arr.push(String(i))
    };
    setdeps(dep_arr);
    await listSpecies();
  };

  async function updateSpeciesDep(change) {
    await axios.get(`http://localhost:9000/species-dep?update=${change}`)
      .then(function (response) {
        console.log(response);
      })
      .catch(function (error) {
        console.log(error);
      }
      );
    getpts();
    speciesView(speciesForView);
  }

  const extractSpeciesName = (species) => {
    const value = species.slice(0, species.lastIndexOf("(") - 1);
    return value;
  }

  const header = useRef(null);
  const windowHeight = window.innerHeight;
  const [headerHeight, setHeaderHeight] = useState(0);

  useLayoutEffect(() => {
    setHeaderHeight(header.current.offsetHeight);
  });

  const offsetHeight = windowHeight - headerHeight;
  console.log(offsetHeight);

  function nextSpecies() {
    const speciesList = Object.keys(species);
    const index = speciesList.indexOf(speciesForView);
    console.log(index);
    if (index === speciesList.length - 1) {
      speciesView(speciesList[0]);
    } else {
      speciesView(speciesList[index + 1]);
    }
  }

  function previousSpecies() {
    const speciesList = Object.keys(species);
    const index = speciesList.indexOf(speciesForView);
    console.log(index);
    if (index === 0) {
      speciesView(speciesList[speciesList.length - 1]);
    } else {
      speciesView(speciesList[index - 1]);
    }
  }

  function downloadFile() {
    axios({
      url: 'http://localhost:9000/downloadDB',
      method: 'GET',
      responseType: 'blob', // Important
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'database.db'); // or any other extension
      document.body.appendChild(link);
      link.click();
    });
  }

  function uploadFile(e) {
    const formData = new FormData();
    console.log(e.target.files[0]);
    formData.append('file', e.target.files[0]);
    axios.post('http://localhost:9000/uploadDB', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then(function (response) {
      console.log(response);
      getpts();
    })
      .catch(function (error) {
        console.log(error);
      });
  }

  return (
    <>
      <div className="flex-container">
        <div id="Header" ref={header}>
          <Collapsible trigger="Christmas Bird Count Compiler" open>
            1.) Input the checklist IDs or trip report number in the text box. Then submit. <br></br>
            3.) Sign into your account when the window open. Do not touch the chrome window while it collects the tracks. <br></br>
            3.) Navigate to the points and click on them to see the species and notes. Select the 'group' status for each point to group overlapping points together.<br></br>
            4.) Species Mode allows you to go species by species when grouping checklists. <br></br>
            5.) Click "Get Species" to get the species from the database and compile them into a CSV file that will download.<br></br>
            <form onSubmit={handleSubmit}>
              <label>
                <input
                  type="text"
                  value={checklists}
                  placeholder="Checklists IDs (comma delimited) or Trip Report"
                  onChange={(e) => setlist(e.target.value)} />
              </label>
              <input type="submit" />
            </form>
            <label className={"filelabel"} htmlFor="fileupload">Upload Database</label>
            <input type='file' id='fileupload' accept='.db' onChange={uploadFile} style={{ display: "none" }} />
            <button onClick={downloadFile}>Download Database</button>

          </Collapsible>


          <button onClick={() => {
            const confirm = window.confirm("Are you sure you want to clear the database?");
            if (confirm) {
              clear();
            }
          }}>Clear</button>



          {!speciesMode &&
            <button onClick={getpts}>Get Points</button>}
          <button onClick={getSpecies}>Get Species</button>


          Species Mode
          <input type="checkbox" checked={speciesMode} onChange={(_value) => setSpeciesMode(!speciesMode)} />

          {speciesMode &&
            // get the species from the database and format them into a string for the popup
            // remove the counts when sending to the onChange function
            <>
              <Dropdown options={speciesWithCountsStr} onChange={value => speciesView(extractSpeciesName(value.value))} />
              <button onClick={previousSpecies}>
                Previous Species
              </button>
              <button onClick={nextSpecies}>
                Next Species
              </button>
            </>
          }

          {speciesMode &&
            <p>Total for {speciesForView}: {species[speciesForView]}</p>}

        </div><div id="map-container">
          <MapContainer whenCreated={setMap} classname='Map' center={[38, -122]} zoom={10}
            scrollWheelZoom={true}>
            <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />
            {!speciesMode &&
              markers.map((marker, _index) => (
                <><Polyline positions={marker[9]} pathOptions={{ color: marker[10], weight: 8 }}>
                  <Popup minWidth="500" maxHeight="750" autoClose={false}>
                    <h2>Checklist ID: {marker[4]}</h2>
                    <h3>Location: {marker[8]}</h3>
                    <h3>Observer: {marker[7]}</h3>
                    <h3>Date: {marker[2]}</h3>
                    <h3>Duration: {marker[3]}</h3>
                    <h3>Checklist Comments: {marker[6]}</h3>
                    <h3>Group: {marker[0]}
                      <br></br>
                    </h3>
                    <Dropdown options={(deps.map((i) => JSON.parse(`{"value": "${marker[4]},${i}", "label": "${i}"}`)))}
                      onChange={value => updateDep(value.value)} placeholder={marker[0]} />
                    <h3>Species: </h3>
                    <pre>{marker[5]}</pre>
                  </Popup>
                  <Tooltip sticky opacity={1}>
                    <font size="+2">{marker[0]}</font>
                  </Tooltip>
                </Polyline>
                </>
              ))}
            {!speciesMode &&
              markers.map((marker, _index) => (
                <Marker position={marker[1]} icon={
                  marker[0] == 'Delete' ? icons[999] : icons[marker[0]] // if the group is 'Delete', use the 1000 icon in the array
                }>
                  <Popup minWidth="500" maxHeight="750" autoClose={false}>
                    <h2>Checklist ID: {marker[4]}</h2>
                    <h3>Location: {marker[8]}</h3>
                    <h3>Observer: {marker[7]}</h3>
                    <h3>Date: {marker[2]}</h3>
                    <h3>Duration: {marker[3]}</h3>
                    <h3>Checklist Comments: {marker[6]}</h3>
                    <h3>Group: {marker[0]}
                      <br></br>
                    </h3>
                    <Dropdown options={(deps.map((i) => JSON.parse(`{"value": "${marker[4]},${i}", "label": "${i}"}`)))}
                      onChange={value => updateDep(value.value)} placeholder={marker[0]} />
                    <h3>Species: </h3>
                    <pre>{marker[5]}</pre>
                  </Popup>
                  <Tooltip sticky opacity={1}>
                    <font size="+2">{marker[0]}</font>
                  </Tooltip>
                </Marker>
              ))}
            {speciesMode &&
              speciesMarkers.map((marker, _index) => (
                <Marker position={marker[1]} icon={icons[marker[11]]}>
                  <Popup minWidth="500" maxHeight="750" autoClose={false}>
                    <h2>Checklist ID: {marker[4]}</h2>
                    <h3>Location: {marker[8]}</h3>
                    <h3>Observer: {marker[7]}</h3>
                    <h3>Date: {marker[2]}</h3>
                    <h3>Duration: {marker[3]}</h3>
                    <h3>Checklist Comments: {marker[6]}</h3>
                    <h3>Group: {marker[0]}
                      <br></br>
                    </h3>
                    <Group checklist={marker[4]} species={speciesForView} onClick={updateSpeciesDep} />
                    <h3>Species: </h3>
                    <pre>{marker[5]}</pre>
                  </Popup>
                  <Tooltip sticky opacity={1}>
                    <font size="+2">{marker[11]}</font>
                  </Tooltip>
                </Marker>
              ))}
            {speciesMode &&
              speciesMarkers.map((marker, _index) => (
                <><Polyline positions={marker[9]} pathOptions={{ color: marker[10], weight: 8 }}>
                  <Popup minWidth="500" maxHeight="750" autoClose={false}>
                    <h2>Checklist ID: {marker[4]}</h2>
                    <h3>Location: {marker[8]}</h3>
                    <h3>Observer: {marker[7]}</h3>
                    <h3>Date: {marker[2]}</h3>
                    <h3>Duration: {marker[3]}</h3>
                    <h3>Checklist Comments: {marker[6]}</h3>
                    <h3>Group: {marker[0]}
                      <br></br>
                    </h3>
                    <Group checklist={marker[4]} species={speciesForView} onClick={updateSpeciesDep} />
                    <h3>Species: </h3>
                    <pre>{marker[5]}</pre>
                  </Popup>
                  <Tooltip sticky opacity={1}>
                    <font size="+2">{marker[11]}</font>
                  </Tooltip>
                </Polyline>
                </>
              ))}
          </MapContainer>
        </div>
      </div></>
  );
};

export default App;
