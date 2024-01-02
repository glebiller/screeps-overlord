import { ErrorMapper } from "utils/ErrorMapper";
import Tasks from 'creep-tasks';

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
  }

  interface CreepMemory {
    role: string;
    room: string;
    working: boolean;
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
function aroundOf(current: RoomPosition) {
  return [
    new RoomPosition(current.x - 1, current.y + 1, current.roomName),
    new RoomPosition(current.x, current.y + 1, current.roomName),
    new RoomPosition(current.x + 1, current.y + 1, current.roomName),
    new RoomPosition(current.x - 1, current.y, current.roomName),
    //new RoomPosition(current.x, current.y, current.roomName),
    new RoomPosition(current.x + 1, current.y, current.roomName),
    new RoomPosition(current.x - 1, current.y - 1, current.roomName),
    new RoomPosition(current.x, current.y - 1, current.roomName),
    new RoomPosition(current.x + 1, current.y - 1, current.roomName),
  ]
}

const TERRAIN_MASK_PLAIN = 0;

function PlainTerrainPredicate(room: Room) {
  let terrain = new Room.Terrain(room.name);
  return function (pos: RoomPosition) {
    return terrain.get(pos.x, pos.y) === TERRAIN_MASK_PLAIN;
  }
}

// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  console.log("New game tick");

  // TODO only do this if no other actions // Store in memory
  for (let spawnName in Game.spawns) {
    let spawn = Game.spawns[spawnName];
    let room = spawn.room;
    let sources = room.find(FIND_SOURCES);
    sources.forEach(source => {
      let emptySpots = _.filter(aroundOf(source.pos), PlainTerrainPredicate(room));
      // Can have more harvester
      let currentHarvesterCount = source.targetedBy && source.targetedBy.length || 0;
      console.log(currentHarvesterCount);
      if (currentHarvesterCount < emptySpots.length) {
        // TODO should handle bigger creep if possible
        //spawn.spawnCreep([WORK, CARRY, MOVE], "harvester-" + source.id + "-" + currentHarvesterCount);
        // TODO remember spawn creep names & wait for it to spawn to assign task
      }
    });

    for (let creepsName in Game.creeps) {
      let creep = Game.creeps[creepsName];

      if (creep.isIdle) {
        // TODO use spawnCreep initial memory to assign a job
        creep.task = Tasks.harvest(creep.room.find(FIND_SOURCES)[0]);
      }

      creep.run();
    }
  }
});
