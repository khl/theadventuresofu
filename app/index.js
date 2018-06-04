import * as world_drawing from "./world_drawing";

let playerPosition = {
  x: 0,
  y: 0,
};

let mapVariables = {
  min_x: -1,
  max_x: 1,
  min_y: -1,
  max_y: 1
};

let inventory = {
  wood: 0,
  planks: 0,
  coin: 5,
  hatchet: null,
  pickaxe: null
};

let currentTerrain = '&blk14;';

let roadMap = [[true]];
let roadQuadrants = [[{x: 0, y:0}]];

function look(distance){

  if(playerPosition.x >= mapVariables.max_x || playerPosition.y >= mapVariables.max_y) {
    for (let i = playerPosition.y - distance; i <= playerPosition.y + distance; i++) {
      for (let j = playerPosition.x - distance; j <= playerPosition.x + distance; j++) {

        //The following to skip top/bottom left/right corners around character
        if (i === playerPosition.y - distance && j === playerPosition.x - distance) {
          continue;
        }

        if (i === playerPosition.y - distance && j === playerPosition.x + distance) {
          continue;
        }

        if (i === playerPosition.y + distance && j === playerPosition.x - distance) {
          continue;
        }

        if (i === playerPosition.y + distance && j === playerPosition.x + distance) {
          continue;
        }

        if (i < mapVariables.min_y || mapVariables.max_y < i) {
          addTableRow(i);
        }

        if (j < mapVariables.min_x || mapVariables.max_x < j) {
          addTableColumn(j);
        }

        let mapCell = document.getElementById('mapCell' + j + ',' + i);

        if (mapCell.innerHTML === '&nbsp;') {
          generateTerrain(mapCell, j, i);
        }
      }
    }
  } else {
    for (let i = playerPosition.y + distance; i >= playerPosition.y - distance; i--) {
      for (let j = playerPosition.x + distance; j >= playerPosition.x - distance; j--) {

        //The following to skip top/bottom left/right corners around character
        if (i === playerPosition.y - distance && j === playerPosition.x - distance) {
          continue;
        }

        if (i === playerPosition.y - distance && j === playerPosition.x + distance) {
          continue;
        }

        if (i === playerPosition.y + distance && j === playerPosition.x - distance) {
          continue;
        }

        if (i === playerPosition.y + distance && j === playerPosition.x + distance) {
          continue;
        }

        if (i < mapVariables.min_y || mapVariables.max_y < i) {
          addTableRow(i);
        }

        if (j < mapVariables.min_x || mapVariables.max_x < j) {
          addTableColumn(j);
        }

        let mapCell = document.getElementById('mapCell' + j + ',' + i);

        if (mapCell.innerHTML === '&nbsp;') {
          generateTerrain(mapCell, j, i);
        }
      }
    }
  }
}

function addTableRow(row_number) {
  let mapTable = document.getElementById("map");
  let tableRow = '<tr id="mapRow'+row_number+'">';

  for (let i = mapVariables.min_x; i <= mapVariables.max_x; i++){
    tableRow += '<td class="mapCell" id="mapCell'+i+','+row_number+'">&nbsp;</td>';
    generateRoad(i,row_number);
  }

  tableRow += '</tr>';

  if (row_number < mapVariables.min_y){
    mapVariables.min_y = row_number;
    mapTable.insertAdjacentHTML('beforeend',tableRow);
  } else if (row_number > mapVariables.max_y) {
    mapVariables.max_y = row_number;
    mapTable.insertAdjacentHTML('afterbegin',tableRow);
  }
}

function addTableColumn(column_number) {
  for (let i = mapVariables.min_y; i <= mapVariables.max_y; i++) {
    let tableCell = '<td class="mapCell" id="mapCell' +column_number+',' + i + '">&nbsp;</td>';
    generateRoad(column_number,i);

    let mapRow = document.getElementById("mapRow" + i);
    if (column_number <= mapVariables.min_x) {
      mapVariables.min_x = column_number;
      mapRow.insertAdjacentHTML('afterbegin', tableCell);
    } else if (column_number >= mapVariables.max_x){
      mapVariables.max_x = column_number;
      mapRow.insertAdjacentHTML('beforeend', tableCell);
    }
  }
}

function generateTerrain(mapCell, x, y) {
  let terrainValues = getSurroundingTerrainValue(mapCell, x, y);
  let randomNumber = Math.random();

  if(roadMap[x]!==undefined && roadMap[x][y]===true){
    world_drawing.createRoad(mapCell);
  } 
  else if(terrainValues.road_point && Math.random() < 0.2){
    if(randomNumber<0.33)
      world_drawing.createInn(mapCell);
    else if (randomNumber<0.66)
      world_drawing.createCarpenter(mapCell);
    else
      world_drawing.createGeneralStore(mapCell);
  }
  else if (numberOfSurroundingRoads(mapCell,x,y)>1 && Math.random() < 0.02) {
  }
  else {
    if (randomNumber < 0.96*terrainValues.percentage_grassland+0.02){
      world_drawing.createGrassland(mapCell);
    }
    else {
      world_drawing.createForest(mapCell);
    }
  }
}

function getSurroundingTerrainValue(mapCell, x, y) {
  let terrainValues = {
    grassland: 0,
    forest: 0,
    total: 0,
    percentage_grassland: 0,
    percentage_forest: 0,
    road_point: false
  };

  for (let i = y-2; i <= y+2; i++){
    for (let j = x-2; j <= x+2; j++) {
      let scanningCell = document.getElementById('mapCell' + j +','+ i);
      if(scanningCell!== null) {
        if (scanningCell.innerHTML === '░') {
          terrainValues.grassland++;
          terrainValues.total++;
        } else if (scanningCell.innerHTML === '▒') {
          terrainValues.forest++;
          terrainValues.total++;
        }
      }

      let roadQuadrant = roadQuadrants[Math.floor((j+20)/40)];
      if (roadQuadrant){
        roadQuadrant = roadQuadrant[Math.floor((i+20)/40)];
      }

      if(!terrainValues.road_point &&
        roadQuadrant &&
        roadQuadrant.x === j &&
        roadQuadrant.y === i){
        terrainValues.road_point = true;
      }
    }
  }

  terrainValues.percentage_grassland = terrainValues.grassland/terrainValues.total;
  terrainValues.percentage_forest = terrainValues.forest/terrainValues.total;

  return terrainValues;
}

function numberOfSurroundingRoads(mapCell, x, y) {
  let roadCount = 0;
  for(let i = x-1; i <= x+1; i+=2) {
    if(roadMap[i]!==undefined&&roadMap[i][y]===true){
      roadCount++;
    }
  }

  for(let i = y-1; i <= y+1; i+=2) {
    if(roadMap[x]!==undefined&&roadMap[x][i]===true){
      roadCount++;
    }
  }
  return roadCount;
}

function generateRoad(x, y){
  let quadrant = {
    x: 0,
    y: 0
  };

  quadrant.x = Math.floor((x+20)/40);
  quadrant.y = Math.floor((y+20)/40);

  for (let i = quadrant.x-1; i <= quadrant.x+1; i++) {
    for (let j = quadrant.y - 1; j <= quadrant.y + 1; j++) {
      if(!roadQuadrants[i]){
        roadQuadrants[i] = [];
      }
      if (!roadQuadrants[i][j]){
        roadQuadrants[i][j] = generateRoadPoint(i, j);
        generateRoadConnections(i, j);
      }
    }
  }
}

function generateRoadPoint(quadrant_x, quadrant_y){
  let new_road_point = {
    x: getRandomInt(quadrant_x*40-20, quadrant_x*40+20),
    y: getRandomInt(quadrant_y*40-20, quadrant_y*40+20),
  };
  console.log("new road point, x: "+new_road_point.x+" y:"+new_road_point.y);

  return new_road_point;
}

function generateRoadConnections(quadrant_x, quadrant_y){

  //horizontal connections
  for(let i = quadrant_x-1; i <= quadrant_x+1; i+=2){
    if(roadQuadrants[i] && roadQuadrants[i][quadrant_y]){
      let rise = (roadQuadrants[i][quadrant_y].y - roadQuadrants[quadrant_x][quadrant_y].y);
      let run = (roadQuadrants[i][quadrant_y].x - roadQuadrants[quadrant_x][quadrant_y].x);
      let slope = rise/run;
      let y = roadQuadrants[quadrant_x][quadrant_y].y;
      let x = roadQuadrants[quadrant_x][quadrant_y].x;

      if(run >= 0) {
        while(x <= run + roadQuadrants[quadrant_x][quadrant_y].x) {
          if (!roadMap[x]) {
            roadMap[x] = [];
          }
          roadMap[x][Math.round(y)] = true;
          y+=slope;
          x++;
        }
      } else {
        while(x >= run + roadQuadrants[quadrant_x][quadrant_y].x) {
          if (!roadMap[x]) {
            roadMap[x] = [];
          }
          roadMap[x][Math.round(y)] = true;
          y-=slope;
          x--;
        }
      }
    }
  }

  //vertical connections
  for(let i = quadrant_y-1; i <= quadrant_y+1; i+=2){
    if(roadQuadrants[quadrant_x] && roadQuadrants[quadrant_x][i]){
      let rise = (roadQuadrants[quadrant_x][i].y - roadQuadrants[quadrant_x][quadrant_y].y);
      let run = (roadQuadrants[quadrant_x][i].x - roadQuadrants[quadrant_x][quadrant_y].x);
      let inverse_slope = run/rise;
      let y = roadQuadrants[quadrant_x][quadrant_y].y;
      let x = roadQuadrants[quadrant_x][quadrant_y].x;

      if(rise >= 0) {
        while(y <= rise + roadQuadrants[quadrant_x][quadrant_y].y) {
          let rounded_x = Math.round(x);
          if (!roadMap[rounded_x]) {
            roadMap[rounded_x] = [];
          }
          roadMap[rounded_x][y] = true;
          x+=inverse_slope;
          y++;
        }
      } else {
        while(y >= rise + roadQuadrants[quadrant_x][quadrant_y].y) {
          let rounded_x = Math.round(x);
          if (!roadMap[rounded_x]) {
            roadMap[rounded_x] = [];
          }
          roadMap[rounded_x][y] = true;
          x-=inverse_slope;
          y--;
        }
      }
    }
  }
}

function resetTerrain(mapCell){
  switch (currentTerrain){
    case '▓':
      world_drawing.createRoad(mapCell);
      break;
    case '▒':
      world_drawing.createForest(mapCell);
      break;
    case '░':
      world_drawing.createGrassland(mapCell);
      break;
    case 'I':
      world_drawing.createInn(mapCell);
      break;
    case 'C':
      world_drawing.createCarpenter(mapCell);
      break;
    case 'G':
      world_drawing.createGeneralStore(mapCell);
      break;
  }
}

function move(direction){
  let div = document.getElementById('output');
  div.innerHTML += '<p>You proceed '+direction+'.</p>';

  let mapCell = document.getElementById('mapCell' + playerPosition.x + ','+playerPosition.y);

  resetTerrain(mapCell);

  let speed = 1;
  if(currentTerrain === '▓'){
    speed+=1;
  }

  switch (direction) {
    case 'north':
      playerPosition.y+=speed;
      break;
    case 'south':
      playerPosition.y-=speed;
      break;
    case 'east':
      playerPosition.x+=speed;
      break;
    case 'west':
      playerPosition.x-=speed;
      break;
  }

  update_coordinates();
  look(2);

  drawCharacter();

  update_location();

  window.scroll(mapCell.offsetLeft-window.innerWidth/2,mapCell.offsetTop-window.innerHeight/2); //center window
}

function drawCharacter(){
  let mapCell = document.getElementById('mapCell' + playerPosition.x + ','+playerPosition.y);
  currentTerrain = mapCell.innerHTML;
  mapCell.innerHTML = '&Uuml;';
  mapCell.classList = ['mapCell'];
}

function update_location(){
  let div = document.getElementById('location');
  let output = document.getElementById('output');

  switch (currentTerrain){
    case '▓':
      div.innerHTML = '<p>Road</p>';
      break;
    case '▒':
      div.innerHTML = '<p>Forest</p>';
      if(inventory.hatchet) {
        div.innerHTML+= '<p><button id="chopWoodButton">Chop Wood</button></p>';
        document.getElementById('chopWoodButton').addEventListener("click", function () {
          inventory.wood++;
          currentTerrain = '░';
          update_location();
          update_inventory();
        });
      }
      break;
    case '░':
      div.innerHTML = '<p>Grassland</p>'
      break;
    case 'I':
      output.innerHTML += '<p>You reach an inn, game saved.</p>';
      div.innerHTML = '<p>Inn</p>';
      saveGame();
      break;
    case 'C':
      output.innerHTML += '<p>You reach an carpenter.</p>';
      div.innerHTML = '<p>Carpenter</p>';
      if(inventory.wood > 1){
        div.innerHTML+='<p><button id="createPlankButton">Create Plank</button></p>';
        let createPlankButton = document.getElementById('createPlankButton');
        createPlankButton.addEventListener("click",function () {
          inventory.wood -= 2;
          inventory.planks++;
          update_location();
          update_inventory();
        });
      }
      break;
    case 'G':
      output.innerHTML += '<p>You reach a general store.</p>';
      div.innerHTML = '<p>General Store</p>';
      if(inventory.coin >= 5){

        // if(!inventory.shovel) {
        //   div.innerHTML += '<p><button id="buyBasicShovelButton">Buy Shovel</button></p>';
        //   document.getElementById('buyBasicShovelButton').addEventListener("click", function () {
        //     inventory.coin -= 5;
        //     inventory.shovel = 'basic';
        //     update_location();
        //     update_inventory();
        //   });
        // }

        if(!inventory.hatchet) {
          div.innerHTML += '<p><button id="buyStarterHatchetButton">Buy Hatchet</button></p>';
          document.getElementById('buyStarterHatchetButton').addEventListener("click", function () {
            inventory.coin -= 5;
            inventory.hatchet = 'Starter';
            update_location();
            update_inventory();
          });
        }
      }
      break;
  }
}

function buyItem(item){

}

function update_coordinates() {
  let coordinateDiv = document.getElementById('coordinates');
  coordinateDiv.innerHTML = '<p>('+playerPosition.x+', '+playerPosition.y+')</p>';
}

function update_inventory() {
  let inventoryDiv = document.getElementById('inventory');
  inventoryDiv.innerHTML = '<p>Inventory</p>';

  if(inventory.hatchet){
    inventoryDiv.innerHTML+='<p>'+inventory.hatchet+' Hatchet</p>';
  }

  if(inventory.shovel){
    inventoryDiv.innerHTML+='<p>'+inventory.shovel+' Shovel</p>';
  }

  if(inventory.coin>0){
    inventoryDiv.innerHTML+='<p>Coin x'+inventory.coin+'</p>';
  }

  if(inventory.wood>0){
    inventoryDiv.innerHTML+='<p>Wood x'+inventory.wood+'</p>';
  }

  if(inventory.planks>0){
    inventoryDiv.innerHTML+='<p>Plank x'+inventory.planks+'</p>';
  }


}

document.addEventListener("DOMContentLoaded", function(event) {
  console.log("document loaded");

  if(!loadGame()){
    newGame();
  }


  update_inventory();
  update_coordinates();

  look(2);
  drawCharacter();

  let northButton = document.getElementById('northButton');
  northButton.addEventListener("click",function () {
    move('north');
  });

  let southButton = document.getElementById('southButton');
  southButton.addEventListener("click",function () {
    move('south');
  });

  let eastButton = document.getElementById('eastButton');
  eastButton.addEventListener("click",function () {
    move('east');
  });

  let westButton = document.getElementById('westButton');
  westButton.addEventListener("click",function () {
    move('west');
  });

  let newGameButton = document.getElementById('newGameButton');
  newGameButton.addEventListener("click",function () {
    newGame();
  });

  document.addEventListener('keyup', function(event){
    event.preventDefault();

    switch (event.code){
      case 'ArrowUp':
        move('north');
        break;
      case 'ArrowDown':
        move('south');
        break;
      case 'ArrowRight':
        move('east');
        break;
      case 'ArrowLeft':
        move('west');
        break;
    }
  });

  document.addEventListener('keydown', function(event){
    event.preventDefault();
  });
});

function newGame(){
  playerPosition = {
    x: 0,
    y: 0,
  };

  mapVariables = {
    min_x: -1,
    max_x: 1,
    min_y: -1,
    max_y: 1
  };

  inventory = {
    wood: 0,
    planks: 0,
    coin: 5,
    hatchet: undefined,
    shovel: undefined
  };

  currentTerrain = '&blk14;';

  roadMap = [[true]];
  roadQuadrants = [[{x: 0, y:0}]];

  document.getElementById('mapWrapper').innerHTML = '<table id="map">\n' +
    '          <tr id="mapRow1">\n' +
    '            <td class="mapCell road" id="mapCell-1,1">▓</td>\n' +
    '            <td class="mapCell road" id="mapCell0,1">▓</td>\n' +
    '            <td class="mapCell road" id="mapCell1,1">▓</td>\n' +
    '          </tr>\n' +
    '          <tr id="mapRow0">\n' +
    '            <td class="mapCell road" id="mapCell-1,0">▓</td>\n' +
    '            <td class="mapCell road" id="mapCell0,0">▓</td>\n' +
    '            <td class="mapCell road" id="mapCell1,0">▓</td>\n' +
    '          </tr>\n' +
    '          <tr id="mapRow-1">\n' +
    '            <td class="mapCell road" id="mapCell-1,-1">▓</td>\n' +
    '            <td class="mapCell road" id="mapCell0,-1">▓</td>\n' +
    '            <td class="mapCell road" id="mapCell1,-1">▓</td>\n' +
    '          </tr>\n' +
    '        </table>';

  update_inventory();
  update_coordinates();

  look(2);
  drawCharacter();
}

function loadGame() {
  console.log("Loading game...");

  try {
    const loadedData = JSON.parse(localStorage.getItem("save"));
    console.log("Loading complete...");

    if (typeof loadedData !== "undefined"){
      if (typeof loadedData.playerPosition !== "undefined"){
        playerPosition = loadedData.playerPosition;
      }

      if (typeof loadedData.map !== "undefined"){
        document.getElementById('mapWrapper').innerHTML = loadedData.map;
      }

      if (typeof loadedData.roadMapObjectArray !== "undefined"){
        for(let road of loadedData.roadMapObjectArray){
          if(roadMap[road.x] === undefined){
            roadMap[road.x] = [];
          }
          roadMap[road.x][road.y] = true;
        }
      }

      if (typeof loadedData.roadQuadrantObjectArray !== "undefined"){
        for(let quadrant of loadedData.roadQuadrantObjectArray){
          if(roadQuadrants[quadrant.quadrantX] === undefined){
            roadQuadrants[quadrant.quadrantX] = [];
          }
          roadQuadrants[quadrant.quadrantX][quadrant.quadrantY] = {x: quadrant.x, y: quadrant.y}
        }
      }

      if (typeof loadedData.mapVariables !== "undefined"){
        mapVariables = loadedData.mapVariables;
      }

      if (typeof loadedData.inventory !== "undefined"){
        inventory = loadedData.inventory;
      }
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error (error);
    return false;
  }
}

//called on visiting inn
function saveGame(){
  console.log("Attempting save...");

  let mapCell = document.getElementById('mapCell' + playerPosition.x + ','+playerPosition.y);

  resetTerrain(mapCell);

  let roadQuadrantObjectArray = [];
  for(let x in roadQuadrants){
    for (let y in roadQuadrants[x]){
      roadQuadrants[x][y].quadrantX = x;
      roadQuadrants[x][y].quadrantY = y;
      roadQuadrantObjectArray.push(roadQuadrants[x][y]);
    }
  }

  let roadMapObjectArray = [];
  for(let x in roadMap){
    for (let y in roadMap[x]){
      if(roadMap[x][y]) {
        roadMapObjectArray.push({x: x, y: y});
      }
    }
  }

  let mapWrapper = document.getElementById('mapWrapper');

  let save = {
    map:  mapWrapper.innerHTML,
    playerPosition: playerPosition,
    mapVariables: mapVariables,
    roadMapObjectArray: roadMapObjectArray,
    roadQuadrantObjectArray: roadQuadrantObjectArray,
    inventory: inventory
  };

  try {
    localStorage.setItem("save", JSON.stringify(save));
    console.log("Save complete!");
  } catch (err) {
    console.error(err);
  }

  drawCharacter();
}

export function cheatFunction() {
  inventory.wood += 10000;
  inventory.planks += 10000;
  inventory.coin += 10000;
  update_inventory();
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}