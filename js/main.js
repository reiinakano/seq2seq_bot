import * as tf from '@tensorflow/tfjs';
import 'babel-polyfill';
import word_tokenize from './tokenizer';

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
    this.generatedChat = document.getElementById("generated-chat");
    this.inputText = document.getElementById("input-text");
    this.chatButton = document.getElementById("chat-button");
    this.chatButton.onclick = () => {
      this.sendChat();
    }
    /*
    Promise.all([
        tf.loadModel('decoder-model/model.json'),
        tf.loadModel('encoder-model/model.json')
    ]).then(([decoder, encoder]) => {
        this.decoder = decoder;
        this.encoder = encoder;
        this.enableGeneration();
    })*/
    this.convert('Seven sheiks, sda\'s, forever! Man\'s beast "sss"');
  }

  /**
   * Called after model has finished loading or generating. 
   * Sets up UI elements for generating text.
   */
  enableGeneration() {
    this.chatButton.innerText = "Send";
    this.chatButton.disabled = false;
  }

  sendChat() {
    const result = tf.tidy(() => {
        const input = tf.tensor2d([0, 0, 0, 0, 0, 0,0, 0, 0, 0, 0, 0, 0, 0, 348,20, 9, 120], [1, 18])
        const states = this.encoder.predict(input);
        this.decoder.layers[1].resetStates(states);
        return this.decoder.predict(tf.zeros([1, 1, 801]));
    })

    result.print();
  }

  convert(sentence) {
    console.log(word_tokenize(sentence));
  }

}

window.addEventListener('load', () => new Main());
