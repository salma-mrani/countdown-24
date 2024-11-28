import {
  SequenceRunner,
  loadSequenceMetadata,
} from "./sequenceRunner.js";

import { initMenu, initTransitionUI } from "./sequenceRunnerUI.js";


const sequenceResponse = await fetch("./sequence.json")
const sequence = await sequenceResponse.json()
const sequenceData = await loadSequenceMetadata(sequence)


//console.log(sequenceData);
const runner = new SequenceRunner(sequenceData);

initMenu(runner)
initTransitionUI(runner)

runner.restart()