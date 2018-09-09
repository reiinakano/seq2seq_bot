import * as tf from '@tensorflow/tfjs';
import 'babel-polyfill';

/**
 * Main application to start on window load
 */
class Main {
  /**
   * Constructor creates and initializes the variables needed for
   * the application
   */
  constructor() {
    // Initiate variables
    this.generatedSentence = document.getElementById("generated-sentence");
    this.inputSeed = document.getElementById("seed");
    this.generateButton = document.getElementById("generate-button");
    this.generateButton.onclick = () => {
      this.generateText();
    }
    tf.loadModel('lstm/model.json').then((model) => {
      this.model = model;
      this.enableGeneration();
    });
  }

}

window.addEventListener('load', () => new Main());
