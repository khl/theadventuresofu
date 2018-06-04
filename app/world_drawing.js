export function createForest(mapCell){
  mapCell.innerHTML = '&blk12;';
  mapCell.classList.add("forest");
}

export function createRoad(mapCell) {
  mapCell.innerHTML = '▓';
  mapCell.classList.add("road");
}

export function createGrassland(mapCell){
  mapCell.innerHTML = '&blk14;';
  mapCell.classList.add("grassland");
}

export function createInn(mapCell){
  mapCell.innerHTML = 'I';
  mapCell.classList.add("inn");
}

export function createCarpenter(mapCell){
  mapCell.innerHTML = 'C';
  mapCell.classList.add("carpenter");
}

export function createGeneralStore(mapCell){
  mapCell.innerHTML = 'G';
  mapCell.classList.add("generalStore");
}