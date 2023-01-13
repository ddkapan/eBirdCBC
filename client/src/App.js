import React, { useState } from 'react';
import { MapContainer, TileLayer, Popup, Marker, Polyline } from 'react-leaflet';
import './App.css';
import L, { marker } from 'leaflet';
import axios from 'axios';
import { ExportToCsv } from 'export-to-csv';
import { Dropdown } from 'react-dropdown-now';
import './dropdown.css';
import ebirdcode from './ebirdCodes.json';
import distinctcolors from 'distinct-colors';
//import Marker from 'react-leaflet-enhanced-marker';
//const track = require('./tracks.json');
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
  console.log(icons);

  // for (let numbers in speciesForViewCount) {
  //   const image = `https://raw.githubusercontent.com/ddkapan/eBirdCBC/main/icon_maker/icons/icon_${numbers}.png`
  //   var icon = L.divIcon({
  //     className: `icon${numbers}`,
  //     html: `<img src=${image}> <style> .icon${numbers} { background: ${markerColors[numbers]}; border-radius: 100px } </style>`,
  //     iconSize: [40, 25],
  //   });
  //   icons.push(icon);
  // }


  // const track = "-122.94442559603876,38.118689842557785,-122.94443781732657,38.118694761246594,-122.94451292444381,38.11872438999384,-122.94457519316322,38.118764896093616,-122.94461636812466,38.11880381019261,-122.9446514387803,38.11884229759293,-122.94468672643106,38.11887967162067,-122.94472554168593,38.11891357605818,-122.94476906155828,38.118943906499666,-122.94482377957473,38.11897562596268,-122.94488275158218,38.11899709720089,-122.94494110121697,38.119009630890595,-122.94499876673927,38.119003741973394,-122.94505034900416,38.118976962403856,-122.94509636692642,38.11895465010632,-122.94514770875227,38.11891800420161,-122.94519045298578,38.11889125291808,-122.9452369511825,38.1188501549257,-122.94527306088017,38.11881410032078,-122.9453230111032,38.11878035152907,-122.94535051010804,38.118749070698435,-122.94539104128586,38.118701915734206,-122.94542417906722,38.11865263647799,-122.94544578940206,38.11860914256808,-122.94546838387079,38.11856382429553,-122.94551779039789,38.11854798918268,-122.94558926942766,38.11856075921959,-122.94564660015384,38.11857818244163,-122.94569964742551,38.11860201807094,-122.9457520588925,38.11862838578676,-122.94581191517058,38.11863132894263,-122.9458536088667,38.11865149510109,-122.9459172374719,38.118681533862656,-122.94596920168867,38.11870746335923,-122.94602537057072,38.11873528091637,-122.94607902450383,38.118762064494355,-122.94613857103347,38.118791694326106,-122.94619632975336,38.11880890122542,-122.94626539566985,38.11882891318081,-122.94632172324644,38.11883401242448,-122.94636774177913,38.11880304978496,-122.94641917093148,38.118790964199135,-122.94647689377388,38.1187686063512,-122.94651947566524,38.11873599655405,-122.94656298210593,38.118713505483356,-122.94661924734089,38.118682432403794,-122.9466754673496,38.11865533239648,-122.94672993538926,38.11864430186223,-122.94678423570963,38.11863514153819,-122.94685836666068,38.11863121773749,-122.94692738551012,38.11863190703135,-122.9469801435221,38.11862980182669,-122.9470501081782,38.11861714814153,-122.9470987832336,38.11862227988023,-122.94716839552287,38.11864416660812,-122.94721775431583,38.11865259381692,-122.94728093345759,38.11866463422077,-122.94733913074892,38.11869836195093,-122.94739152608133,38.11872866164526,-122.9474250311391,38.11873827658078,-122.94749202571317,38.118753282502425,-122.94757754946474,38.118751150147446,-122.94764180984069,38.11874105348363,-122.9476974106005,38.11874644889491,-122.94774965157357,38.1187751541852,-122.94779977580359,38.11880071802138,-122.94785530262982,38.11882850217774,-122.94791271673532,38.11883644556587,-122.94797982771183,38.11884626885787,-122.94804244330196,38.11886991838674,-122.94808749624008,38.1188772214811,-122.94815338795064,38.11888109227121,-122.94822775961943,38.118881155634924,-122.9482869585976,38.11888724750104,-122.94835156826834,38.11889625881645,-122.94841255444591,38.118905260150555,-122.9484661462353,38.118924784503164,-122.94853123053646,38.118937125641054,-122.9485795232453,38.1189564895858,-122.94863826703588,38.11897406871642,-122.9486932577788,38.11898426590657,-122.9487364560604,38.119007021056454,-122.94879667005341,38.11901875699805,-122.94885796425872,38.11903521946001,-122.94891322517817,38.11905699998156,-122.94897273732924,38.11908085518709,-122.94902578222789,38.11910452366949,-122.94908644768721,38.11912479099243,-122.94913830017948,38.11912919484423,-122.94920000984305,38.11914338327764,-122.94926446847164,38.119154900516165,-122.94930872877866,38.119161432771456,-122.94937412227276,38.11916313616296,-122.94943872440534,38.11917310728753,-122.94950278779001,38.11919044232765,-122.94956751438404,38.119208766302926,-122.94962750333075,38.1192181374446,-122.94968138992802,38.11922460697986,-122.94974576662824,38.11922853260588,-122.94981370030511,38.11923177379769,-122.94987182485079,38.119231948719744,-122.94993503009303,38.11923588190381,-122.94997872192008,38.11926628160405,-122.95002843064266,38.11924238046188,-122.9500793685982,38.11924107120435,-122.95014870531261,38.11924202673163,-122.95021036312879,38.11923483631861,-122.95026281713433,38.119248737903696,-122.9503273695809,38.11924179707299,-122.95036686747837,38.11923523041764,-122.95044132209922,38.11923324701997,-122.9505144478129,38.11924898945966,-122.9505641650331,38.119250737845725,-122.95064314322708,38.11925689421404,-122.95070653385955,38.119251628278874,-122.95076172495486,38.119251144060954,-122.95083088780885,38.119245633604514,-122.95087171242227,38.11924059715954,-122.95093190133292,38.119213619575724,-122.95099487481312,38.11918452354926,-122.95105094759101,38.11917059059749".split(',')
  // const points = [];
  // for(let i = 0; i < track.length; i+=2) {
  //   points.push([track[i+1], track[i]]); // lat, long
  // }
  // console.log(points);

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


  return (
    <><div classname="Header">
      <h3>Christmas Bird Count Compiler</h3>
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

      <button onClick={clear}>Clear</button>


      {!speciesMode &&
        <button onClick={getpts}>Get Points</button>}
      <button onClick={getSpecies}>Get Species</button>


      Species Mode
      <input type="checkbox" checked={speciesMode} onChange={(_value) => setSpeciesMode(!speciesMode)} />

      {speciesMode &&
        <Dropdown options={Object.keys(species)} onChange={value => speciesView(value.value)} />}

      {speciesMode &&
        <p>Total for {speciesForView}: {species[speciesForView]}</p>}

    </div><div>
        <MapContainer whenCreated={setMap} classname='Map' center={[38, -122]} zoom={10} scrollWheelZoom={true}>
          <TileLayer url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" />
          {!speciesMode &&
            markers.map((marker, _index) => (
              <><Polyline positions={marker[9]} pathOptions={{ color: marker[10], weight: 8 }}>
                <Popup minWidth="500" maxHeight="500" autoClose={false}>
                  <h2>Checklist ID: {marker[4]}</h2>
                  <h3>Location: {marker[8]}</h3>
                  <h3>Observer: {marker[7]}</h3>
                  <h3>Date: {marker[2]}</h3>
                  <h3>Duration: {marker[3]}</h3>
                  <h3>Checklist Comments: {marker[6]}</h3>
                  <h3>Group: {marker[0]}
                    <br></br>
                    {/*deps.map((i) => (
    <button value={String(`${marker[4]},${i}`)} // marker[4] is the checklist ID, i is the dependent
      onClick={e => updateDep(e.target.value)}>Dependent {i}</button>
  ))*/}
                  </h3>
                  <Dropdown options={(deps.map((i) => JSON.parse(`{"value": "${marker[4]},${i}", "label": "${i}"}`)))}
                    onChange={value => updateDep(value.value)} placeholder={marker[0]} />
                  <h3>Species: </h3>
                  <pre>{marker[5]}</pre>
                </Popup>
              </Polyline>
              </>
            ))}
          {!speciesMode &&
            markers.map((marker, _index) => (
              <Marker position={marker[1]} icon={
                marker[0] == 'Delete' ? icons[999] : icons[marker[0]] // if the group is 'Delete', use the 1000 icon in the array
                }>
                <Popup minWidth="500" maxHeight="500" autoClose={false}>
                  <h2>Checklist ID: {marker[4]}</h2>
                  <h3>Location: {marker[8]}</h3>
                  <h3>Observer: {marker[7]}</h3>
                  <h3>Date: {marker[2]}</h3>
                  <h3>Duration: {marker[3]}</h3>
                  <h3>Checklist Comments: {marker[6]}</h3>
                  <h3>Group: {marker[0]}
                    <br></br>
                    {/*deps.map((i) => (
                <button value={String(`${marker[4]},${i}`)} // marker[4] is the checklist ID, i is the dependent
                  onClick={e => updateDep(e.target.value)}>Dependent {i}</button>
              ))*/}
                  </h3>
                  <Dropdown options={(deps.map((i) => JSON.parse(`{"value": "${marker[4]},${i}", "label": "${i}"}`)))}
                    onChange={value => updateDep(value.value)} placeholder={marker[0]} />
                  <h3>Species: </h3>
                  <pre>{marker[5]}</pre>
                </Popup>
              </Marker>
            ))}
          {speciesMode &&
            speciesMarkers.map((marker, _index) => (
              <Marker position={marker[1]} icon={icons[marker[11]]}>
                <Popup minWidth="500" maxHeight="500" autoClose={false}>
                  <h2>Checklist ID: {marker[4]}</h2>
                  <h3>Location: {marker[8]}</h3>
                  <h3>Observer: {marker[7]}</h3>
                  <h3>Date: {marker[2]}</h3>
                  <h3>Duration: {marker[3]}</h3>
                  <h3>Checklist Comments: {marker[6]}</h3>
                  <h3>Group: {marker[0]}
                    <br></br>
                    {/*deps.map((i) => (
                <button value={String(`${marker[4]},${i}`)} // marker[4] is the checklist ID, i is the dependent
                  onClick={e => updateDep(e.target.value)}>Dependent {i}</button>
              ))*/}
                  </h3>
                  <Dropdown options={(deps.map((i) => JSON.parse(`{"value": "${marker[4]},${i},${speciesForView}", "label": "${i}"}`)))}
                    onChange={value => updateSpeciesDep(value.value)} placeholder={marker[0]} />
                  <h3>Species: </h3>
                  <pre>{marker[5]}</pre>
                </Popup>
              </Marker>
            ))}
          {speciesMode &&
            speciesMarkers.map((marker, _index) => (
              <><Polyline positions={marker[9]} pathOptions={{ color: marker[10], weight: 8 }}>
                <Popup minWidth="500" maxHeight="500" autoClose={false}>
                  <h2>Checklist ID: {marker[4]}</h2>
                  <h3>Location: {marker[8]}</h3>
                  <h3>Observer: {marker[7]}</h3>
                  <h3>Date: {marker[2]}</h3>
                  <h3>Duration: {marker[3]}</h3>
                  <h3>Checklist Comments: {marker[6]}</h3>
                  <h3>Group: {marker[0]}
                    <br></br>
                    {/*deps.map((i) => (
    <button value={String(`${marker[4]},${i}`)} // marker[4] is the checklist ID, i is the dependent
      onClick={e => updateDep(e.target.value)}>Dependent {i}</button>
  ))*/}
                  </h3>
                  <Dropdown options={(deps.map((i) => JSON.parse(`{"value": "${marker[4]},${i},${speciesForView}", "label": "${i}"}`)))}
                    onChange={value => updateSpeciesDep(value.value)} placeholder={marker[0]} />
                  <h3>Species: </h3>
                  <pre>{marker[5]}</pre>
                </Popup>
              </Polyline>
              </>
            ))}
        </MapContainer>
      </div></>
  );
};

export default App;
