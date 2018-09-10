import * as tf from '@tensorflow/tfjs';
import 'babel-polyfill';
import wordTokenize from './tokenizer';
import inputWord2idx from './mappings/input-word2idx';
import wordContext from './mappings/word-context';
import targetWord2idx from './mappings/target-word2idx';
import targetIdx2word from './mappings/target-idx2word';

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
    
    Promise.all([
        tf.loadModel('decoder-model/model.json'),
        tf.loadModel('encoder-model/model.json')
    ]).then(([decoder, encoder]) => {
        this.decoder = decoder;
        this.encoder = encoder;
        this.enableGeneration();
    })
    this.convertSentenceToTensor("give me a joKe");
  }

  /**
   * Called after model has finished loading or generating. 
   * Sets up UI elements for generating text.
   */
  enableGeneration() {
    this.chatButton.innerText = "Send";
    this.chatButton.disabled = false;
  }

  async sendChat() {
    let inputText = this.inputText.value;

    const states = tf.tidy(() => {
        const input = this.convertSentenceToTensor(inputText);
        return this.encoder.predict(input);
    })

    this.decoder.layers[1].resetStates(states);

    let responseTokens = [];
    let terminate = false;
    let nextTokenID = targetWord2idx['<SOS>'];
    let numPredicted = 0;
    while (!terminate) {
        const outputTokenTensor = tf.tidy(() => {
            const input = this.generateDecoderInputFromTokenID(nextTokenID);
            const prediction = this.decoder.predict(input);
            return prediction.squeeze().argMax();
        });

        const outputToken = await outputTokenTensor.data();
        outputTokenTensor.dispose();
        const word = targetIdx2word[outputToken[0]]
        numPredicted++;
        nextTokenID = outputToken[0];
        console.log(outputToken, word);

        if (word !== '<EOS>' && word !== '<SOS>') {
            responseTokens.push(word);
        }

        if (word === '<EOS>' || numPredicted >= wordContext.decoder_max_seq_length) {
            terminate = true;
        }
    }

    const result = tf.tidy(() => {
        const input = this.convertSentenceToTensor(inputText);
        const states = this.encoder.predict(input);
        this.decoder.layers[1].resetStates(states);
        return this.decoder.predict(tf.zeros([1, 1, 801]));
    })

    result.print();
  }

  generateDecoderInputFromTokenID(tokenID) {
      const buffer = tf.buffer([1, 1, wordContext.num_decoder_tokens]);
      buffer.set(1, 0, 0, tokenID);
      return buffer.toTensor();
  }

  convertSentenceToTensor(sentence) {
    let input_wids = [];
    wordTokenize(sentence).map(x => {
        x = x.toLowerCase();
        let idx = "1";
        if (x in inputWord2idx) {
            idx = inputWord2idx[x];
        }
        input_wids.push(Number(idx));
    })
    if (input_wids.length < wordContext.encoder_max_seq_length) {
        input_wids = 
            Array.concat(
                new Array(wordContext.encoder_max_seq_length-input_wids.length+1).join('0').split('').map(Number), 
                input_wids
            );
    } else {
        input_wids = input_wids.slice(0, 18);
    }
    console.log(input_wids);
    return tf.tensor2d(input_wids, [1, 18]);
  }

}

window.addEventListener('load', () => new Main());
