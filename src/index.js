import "./styles.css";
import * as game from "./zone-vue-2USGQ-export.json";

console.log(game);

let gameStartTime = game.dateStarted;
let gameEndTime = game.dateCompleted;
let history = [];
let totalSceneTime = 0;
let totalScenes = 0;
let sequences = [];
let sequenceLookup = [];
game.sequences.forEach((sequence, i) => {
  sequences[i] = {
    duration: sequence.endTime - sequence.startTime,
    time: sequence.startTime
  };

  sequenceLookup[sequence.key] = {
    duration: sequence.endTime - sequence.startTime,
    time: sequence.startTime
  };

  if (sequence.sceneHistory !== undefined) {
    sequence.sceneHistory.forEach((scene) => {
      totalSceneTime += scene.endTime - scene.startTime;
      totalScenes++;
      history.push({
        type: `SCENE`,
        duration: scene.endTime - scene.startTime,
        time: scene.startTime,
        content: scene.scene.prompt,
        key: sequence.key,
        location: sequence.content.name
      });
    });
  }
});

Object.entries(game.players).forEach(([playerId, player]) => {
  if (player.deathTime === undefined) {
    // survivor
    history.push({
      type: `WISH`,
      time: sequenceLookup.endgame_wish.time,
      playerName: player.name,
      archetype: player.character.archetype,
      wish: game.wish
    });
  } else {
    history.push({
      type: `DEATH`,
      time: player.deathTime,
      playerName: player.name,
      archetype: player.character.archetype
    });
  }
});

history.push({
  type: "LABEL",
  time: gameStartTime,
  label: "The game starts"
});
history.push({
  type: "LABEL",
  time: sequenceLookup.rules_character_intro.time,
  label: "Character creation"
});
history.push({
  type: "LABEL",
  time: sequenceLookup.campfire.time,
  label: "🔥 The Campfire. A short respite"
});
history.push({
  type: "LABEL",
  time: gameEndTime,
  label: "The game ends"
});

history = history.sort((a, b) => a.time - b.time);

function timeToMins(timestampMillis, decimalPlaces) {
  return (timestampMillis / 60 / 1000).toFixed(decimalPlaces);
}

function renderSceneEvent(scene) {
  return `<p>
  <span class='timestamp'>
    ${timeToMins(scene.time - gameStartTime, 0)} min
  </span>
  <span class='timestamp timestamp-muted'>
    ${timeToMins(scene.duration, 1)} min
  </span>
  ${scene.location}: ${scene.content}
  </p>`;
}

function renderDeathEvent(event) {
  return `<p>
    <span class='timestamp'>
      ${timeToMins(event.time - gameStartTime, 0)} min
    </span>     
    ☠️ The ${event.archetype} dies    
  </p>`;
}

function renderWishEvent(event) {
  return `<p>
    <span class='timestamp'>
      ${timeToMins(event.time - gameStartTime, 0)} min
    </span>     
    The Center: The ${event.archetype} made their final wish: <strong>${
    game.wish
  }</strong>
  </p>`;
}

let historyString = "";
history.forEach((event) => {
  if (event.type === "LABEL") {
    historyString += `<p><span class='timestamp'>
    ${timeToMins(event.time - gameStartTime, 0)} min
    </span>${event.label}</p>`;
  }
  if (event.type === "SCENE") {
    historyString += renderSceneEvent(event);
  }
  if (event.type === "DEATH") {
    historyString += renderDeathEvent(event);
  }
  if (event.type === "WISH") {
    historyString += renderWishEvent(event);
  }
});

document.getElementById("app").innerHTML = `
<h1>Mission Report</h1>
<div>
  <h2>
    Summary of ${Object.keys(game.players).length} player game ${game.gameId}
  </h2>
  ${historyString}
  <p><strong>
    ${totalScenes} scenes
    (${timeToMins(totalSceneTime / totalScenes, 1)} mins avg)
  </strong></p>
</div>
`;
