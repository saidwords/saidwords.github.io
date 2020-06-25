var VF = null;
var question = {};
var score = null;
var system = null;
var pianoRoll = null;
var stack = []; // holds the list of asked questions and their rank
var midiMap = {};
var keysDown = []; // all the keys that the user is currently holding down on
					// the keyboard
var artist = null;
var tab = null;
var renderer = null;
var samples = {};
let allChords = [];
var vexNotes = [];
var debug = {};
var db = {};
let globalNth = 1;
let mute = false;
let muteButton = {};
let messageBox = {};
let playQuestion = false; // if true the play the sound of the piano notes
							// that make up the question
let procId = null;
let questionPlayDelaySlider = {};
let questionPlayDelayLabel = {};
let questionPlayDelayDiv = {};
let questionPlayDelay = 0;

let questionPlayNoteDelaySlider = {};
let questionPlayNoteDelayLabel = {};
let questionPlayNoteDelayDiv = {};
let questionPlayNoteDelay = 0;

let selectedClef = 0; // 0 = treble 1= bass, 2=both
let alternatingClef=0;
let showQuestionLetters = false;
let filterOut=[5];
let midiChannels={};
let midiCommands=[];
let midiChannel=1;

// TODO: Allow the user to select for practice the treble, bass or both at the
// same time
function startUp() {
    pianoRoll = document.getElementById("pianoRoll");
    muteButton = document.getElementById("muteButton");
    messageBox = document.getElementById("message");
   
    // question play delay
    questionPlayDelayDiv = document.getElementById("questionPlayDelayDiv");
    questionPlayDelayLabel = document.getElementById('questionPlayDelayLabel');
    questionPlayDelaySlider = document.getElementById("questionPlayDelay");
    
    questionPlayDelaySlider.oninput = function () {
        if (this.value > 0) {
            questionPlayDelayLabel.innerHTML = "after " + (this.value / 1000) + " seconds";
            questionPlayDelay = this.value;
            if(this.value<0.1){
            	questionPlayNoteDelay=0;
            }
        } 
    }
    
 // question play note delay
    questionPlayNoteDelayDiv = document.getElementById("questionPlayNoteDelayDiv");
    questionPlayNoteDelayLabel = document.getElementById('questionPlayNoteDelayLabel');
    questionPlayNoteDelaySlider = document.getElementById("questionPlayNoteDelay");
    
    questionPlayNoteDelaySlider.oninput = function () {
        if (this.value > 0) {
            questionPlayNoteDelayLabel.innerHTML = "with " + (this.value / 1000) + " seconds between notes";
            questionPlayNoteDelay = this.value;
            if(this.value<0.1){
            	questionPlayNoteDelay=0;
            }
        }
    }
    
    debug = document.getElementById("debug");
    VF = Vex.Flow;
    renderer = new VF.Renderer(pianoRoll, VF.Renderer.Backends.SVG);
    // renderer.ctx.setFillStyle("green"); //this works!

    initDatabase();
    loadQuestionHistory()
    
    let command=128;
    for(let i=0;i<2;i++){
    	midiCommands[i]=[0];
    	for(let channel=1;channel<17;channel++){
    		midiChannels[command]=channel;
    		midiCommands[i][channel]=command;
    		command++;
    	}
    }
    
    // https://www.piano-keyboard-guide.com/keyboard-chords.html
    allChords = [
    	['C'],['D'],['E'],['F'],['G'],['A'],['B'],
    	['C#'],['D#'],['D@'],['E@'],['F#'],['G#'],
    	['A#'],['A@'],['B@'],['G@'],
    	["C", "E", "G"],
    	["A", "C", "F"],
    	["B", "D", "G"],
    	["A", "C", "E"],
    	["B", "D", "F"],
    	["A", "D", "F"],
    	["B", "E", "G"],
    	["B", "E", "G#"],
    	["B@", "D", "F"],
    	["A", "C#", "E"],
    	["A@", "C", "F"],
    	["B", "D", "F#"],
    	["C", "E@", "G"],
    	["C#", "E", "G"], 
    	["B@", "D", "G"],
    	["A", "C", "F#"],
    	["A@", "D", "F"],
    	["B@", "D@", "G"],
        ["A@", "B", "D"],
        ["A", "C", "E@"],
    	["B@", "E", "G"],
        ["A@", "B", "F"],
        ["C#", "F", "G#"],
        ["E@", "G", "B@"],
        ["D", "F#", "G#"],
        ["A@", "C", "E@"],
        ["A#", "C#", "F#"],
        ["B@", "E@", "G@"],
        ["B", "D#", "F#"],
        ["A@", "B", "E@"],
        ["C#", "E", "G#"],
        ["B@", "D@", "F"],
        ["A", "C#", "F#"],
        ["C", "E@", "G@"],
        ["A", "E@", "G@"],
        ["B@", "D@", "E"],
        ["B", "C", "E", "G"],
        ["C", "C#", "F", "G#"],
        ["A", "C#", "D", "F#"],
        ["B@", "D", "E@", "G"],
        ["B", "D#", "E", "G#"],
        ["A", "C", "E", "F"],
        ["A#", "C#", "F", "F#"],
        ["B", "D", "F#", "G"],
        ["A@", "C", "E@", "G"],
        ["A", "C#", "E", "G#"],
        ["A", "B@", "D", "F"],
        ["A#", "B", "D#", "F#"],
        ["B@", "C", "E", "G"],
        ["B", "C#", "F", "G#"],
        ["A", "C", "D", "F#"],
        ["B@", "D@", "E@", "G"],
        ["B", "D", "E", "G#"],
        ["A", "C", "E@", "F"],
        ["A#", "C#", "E", "F#"],
        ["B", "D", "F", "G"],
        ["A@", "C", "E@", "G@"],
        ["A", "C#", "E", "G"],
        ["A@", "B@", "D", "F"],
        ["A", "B", "D#", "F#"],
        ["B@", "C", "E@", "G"],
        ["B", "C#", "E", "G#"],
        ["A", "C", "D", "F"],
        ["B@", "D@", "E@", "G@"],
        ["B", "D", "E", "G"],
        ["A@", "C", "E@", "F"],
        ["A", "C#", "E", "F#"],
        ["B@", "D", "F", "G"],
        ["A@", "B", "E@", "G@"],
        ["A", "C", "E", "G"],
        ["A@", "B@", "D@", "F"],
        ["A", "B", "D", "F#"],
        ["B@", "C", "E@", "G@"],
        ["B", "C#", "E", "G"],
        ["A@", "C", "D", "F"],
        ["A", "D@", "E@", "G@"],
        ["B@", "D", "E", "G"],
        ["A@", "B", "E@", "F"],
        ["A", "C", "E", "F#"],
        ["B@", "D@", "F", "G"],
        ["A@", "B", "D", "G@"],
        ["A", "C", "E@", "G"],
        ["A@", "B@", "D@", "E"],
        ["A", "B", "D", "F"]];


    // A list of all piano keys that will be practiced in order of appearance
    vexNotes = [
        {clef: "treble", keys: ["C/4"], duration: "h", cc: 60, w: true}, // middle-C
        {clef: "bass", keys: ["C/3"], duration: "h", cc: 48, w: true},
        {clef: "treble", keys: ["D/4"], duration: "h", cc: 62, w: true},
        {clef: "bass", keys: ["D/3"], duration: "h", cc: 50, w: true},
        {clef: "treble", keys: ["E/4"], duration: "h", cc: 64, w: true},
        {clef: "bass", keys: ["E/3"], duration: "h", cc: 52, w: true},
        {clef: "treble", keys: ["F/4"], duration: "h", cc: 65, w: true},
        {clef: "bass", keys: ["F/3"], duration: "h", cc: 53, w: true},
        {clef: "treble", keys: ["G/4"], duration: "h", cc: 67, w: true},
        {clef: "bass", keys: ["G/3"], duration: "h", cc: 55, w: true},
        {clef: "treble", keys: ["A/4"], duration: "h", cc: 69, w: true},
        {clef: "bass", keys: ["A/3"], duration: "h", cc: 57, w: true},
        {clef: "treble", keys: ["B/4"], duration: "h", cc: 71, w: true},
        {clef: "bass", keys: ["B/3"], duration: "h", cc: 59, w: true},

        {clef: "treble", keys: ["C#/4"], duration: "h", cc: 61, w: false},
        {clef: "bass", keys: ["C#/3"], duration: "h", cc: 49, w: false},
        {clef: "treble", keys: ["D#/4"], duration: "h", cc: 63, w: false},
        {clef: "bass", keys: ["D#/3"], duration: "h", cc: 51, w: false},
        {clef: "treble", keys: ["F#/4"], duration: "h", cc: 66, w: false},
        {clef: "bass", keys: ["F#/3"], duration: "h", cc: 54, w: false},
        {clef: "treble", keys: ["G#/4"], duration: "h", cc: 68, w: false},
        {clef: "bass", keys: ["G#/3"], duration: "h", cc: 56, w: false},
        {clef: "treble", keys: ["A#/4"], duration: "h", cc: 70, w: false},
        {clef: "bass", keys: ["A#/3"], duration: "h", cc: 58, w: false},

        {clef: "treble", keys: ["D@/4"], duration: "h", cc: 61, w: false},
        {clef: "bass", keys: ["D@/3"], duration: "h", cc: 49, w: false},
        {clef: "treble", keys: ["E@/4"], duration: "h", cc: 63, w: false},
        {clef: "bass", keys: ["E@/3"], duration: "h", cc: 51, w: false},
        {clef: "treble", keys: ["G@/4"], duration: "h", cc: 66, w: false},
        {clef: "bass", keys: ["G@/3"], duration: "h", cc: 54, w: false},
        {clef: "treble", keys: ["A@/4"], duration: "h", cc: 68, w: false},
        {clef: "bass", keys: ["A@/3"], duration: "h", cc: 56, w: false},
        {clef: "treble", keys: ["B@/4"], duration: "h", cc: 70, w: false},
        {clef: "bass", keys: ["B@/3"], duration: "h", cc: 58, w: false},

    ];
    
    // load notes
    for (let i in vexNotes) {
        midiMap[vexNotes[i].cc] = vexNotes[i];

        // TODO: handle the case when the sample cannot be found
        samples[vexNotes[i].cc] = new Audio("./samples/Piano" + vexNotes[i].cc + ".wav");
    }

    // draw a blank sheet
    drawNotes([]);
}

function testSomething(){
}


function about() {
    if (messageBox.innerHTML.length > 2) {
        messageBox.innerHTML = "";
        return;
    }
    messageBox.innerHTML = "Piano Muse uses a Leitner method to show you notes that you have the most difficulty memorizing.<br>" +
        "Just click 'start' and press the key on your Midi keyboard that matches the notes displayed on the staff.<br>" +
        "Piano Muse will store your progress (on your computer) and will pick up where you left off.<br>" +
        "Note: only two octaves on your keyboard are used for practice. If the Muse is not responding to your keyboard then try a different octave.<br>" +
        "Contact me for questions: saidwords@gmail.com";
}

function begin() {
    // get a question and draw it on the stave
    if (typeof question.c == "undefined") {
        question = getQuestion();
    }
    drawNotes(question.c);
    playQuestionNotes(questionPlayDelay,questionPlayNoteDelay);
   
	messageBox.innerHTML="";
	
}

function setPlayQuestion(e) {
    playQuestion = e.checked;
    if (playQuestion) {
        questionPlayDelayDiv.style = "";
        if (questionPlayDelay == 0) {
            questionPlayDelaySlider.value = 1000;
            questionPlayDelay = 1000;
            questionPlayDelaySlider.oninput();
        }
        
        questionPlayNoteDelayDiv.style = "";
        if (questionPlayNoteDelay == 0) {
            questionPlayNoteDelaySlider.value = 500;
            questionPlayNoteDelay = 500;
            questionPlayNoteDelaySlider.oninput();
        }
        
    } else {
        questionPlayDelayDiv.style = "display:none";
        questionPlayNoteDelayDiv.style = "display:none";
    }
}

function showQLetters(e) {
    showQuestionLetters = e.checked;
    begin();
}

function selectClef(e) {
	question={};
    if (e.value == "bass") {
        selectedClef = 1;
    } else if (e.value == "treble") {
        selectedClef = 0;
    } else if (e.value == "both") {
        selectedClef = 2;
    }
    loadQuestionHistory();
   
    setTimeout(begin, 500);
}


/*
 * TODO: test the midi range of the users keyboard
 */
function calibrate() {
    if (calibrating) {
        calibrateButton.innerText = "Done Calibrating";
    } else {
        calibrateButton.innerText = "Calibrate";
    }
}

function recordCalibration(lowest, highest) {
    ;// TODO
}

function mutePiano() {
    mute = !mute;
    if (mute) {
        muteButton.innerText = "UnMute";
    } else {
        muteButton.innerText = "Mute";
    }
}

/**
 * TODO figure out how to avoid that clicking sound when note is retriggered
 * 
 * @param note
 */
function playSample(note) {
    if (mute) return false;
    if (note > 71 || note < 48) {
        return false;
    }
    if (stopSample(note)) {
        try {
        	samples[note].play();
        } catch (err) {
            alert("There seems to be a problem with playing the audio. So I'm gonna mute it.")
            mutePiano();
            return false;
        }
        return true;
    }
    return false;
}


function playQuestionNotes(delay,intermission) {
	
    if (!playQuestion) return;
    if (procId !== null) {
        return;
    }
    // only play if there are no keys down and some time has passed
    if(parseInt(intermission) > 101){
    	let i = parseInt(intermission);
    	for (let n = 0; n < question.c.length; n++) {
    		procId = setTimeout(() => {
    			procId=null;
    			if (keysDown.length > 0) return;
    			playSample(question.c[n].cc);
			}, parseInt(delay)+i);
    		i+=parseInt(intermission);
    	}
    }else{
    	
    	 procId = setTimeout(function () {
    		 procId=null;
    	        if (keysDown.length > 0) return;
    	        for (let n = 0; n < question.c.length; n++) {
    	        	playSample(question.c[n].cc);
    	        }

    	    }, parseInt(delay));
    }

}

function stopSample(note) {
    try {
        samples[note].currentTime = 0;
    } catch (err) {
        alert("There seems to be a problem with playing the audio. So I'm gonna mute it.")
        mute = true;
        mutePiano();
        return false;
    }
    return true;
}

/*
 * Returns a question in the form of { c:[] Chord - an array of vexNote
 * definitions r: int Rank - a value indicating how well the question has been
 * memorized }
 */
function getQuestion() {
    // pull the next question from the top of the stack.
    // if stack is empty then generate a question
    let q = {};
    if (stack.length == 0) {
        q = {c: generateChord(0), r: 0, a: 0, b: 0};

    } else {
        q = stack.splice(0, 1);
        q=q[0];
        // rotate the notes in the chord to keep things interesting
        if(q.c.length>1){
        	let c=q.c.splice(0,1);
        	q.c.push(c[0]);
        }
    }
    q.a++; // increment the number of times this question has been asked
    
    return q;
}

/*
 * notes - an array of midi values that represent notes
 */
function drawNotes(notes) {
    var basschord = [];
    var treblechord = [];

    for (var note in notes) {
        if (notes[note].clef == 'bass') {
            basschord.push(notes[note]);
        } else {
            treblechord.push(notes[note]);
        }
    }

    let formatNotes = function (chord) {
        let s = "notes :h ";

        for (let i in chord) {
            s += chord[i].keys[0] + " ";

            let letter = chord[i].keys[0].slice(0, chord[i].keys[0].indexOf("/")).replace("@", "b");
            if (keysDown.length > 0) {
                let correct = false;

                for (let k in keysDown) {
                    if (chord[i].cc - keysDown[k] == 0) {
                        correct = true;
                    }
                }

                // annotate note with name of note C#/4 etc...
                if (correct) {
                    s += " $.medium." + letter + (letter.length == 1 ? ' ' : '') + "$ ";
                } else {
                    if (showQuestionLetters) {
                        s += " $" + letter + (letter.length == 1 ? ' ' : '') + "$ ";
                    } else {
                        s += "$  $";
                    }
                }
            } else {
                if (showQuestionLetters) {
                    s += " $" + letter + (letter.length == 1 ? ' ' : '') + "$ ";
                } else {
                    s += "$  $";
                }

            }

        }

        return s;
    };

    // vextab reference: https://www.vexflow.com/vextab/tutorial.html
    var data = `
			tabstave notation=true tablature=false clef=treble
			` + formatNotes(treblechord) + `

			tabstave notation=true tablature=false clef=bass
			` + formatNotes(basschord);

    // options reference here:
	// https://github.com/0xfe/vextab/blob/master/src/vextab.coffee
    const artist = new vextab.Artist(10, 10, 750, {scale: 1.25});
    const tab = new vextab.VexTab(artist);

    tab.parse(data);
    artist.render(renderer);
}

function generateChord(nth){
	let chord=allChords[nth];
	let vexChord=[];
	let clef=selectedClef;
	
	if(selectedClef==2){
		clef=alternatingClef;
	}
	
	
	// convert the chord to vexnotes
	for(let n = 0;n<chord.length;n++){
		// for note in chord find the equivalent vexnote
		for(let v = 0;v<vexNotes.length;v++){
			let note=vexNotes[v].keys[0].slice(0, vexNotes[v].keys[0].indexOf("/"));
			if(note==chord[n]){
				if(clef==0){ // treble
					if(vexNotes[v].clef=='treble'){
						vexChord.push(vexNotes[v]);
					}
				}else if(clef==1){ // bass
					if(vexNotes[v].clef=='bass'){
						vexChord.push(vexNotes[v]);
					}
				}
			}
		}
		if(selectedClef==2){
			clef=!clef;
			alternatingClef=clef;
		}
	}
	
	return vexChord;
}

function getMIDIMessage(midiMessage) {
    handleKeyPress(midiMessage);
}

navigator.requestMIDIAccess()
    .then(onMIDISuccess, onMIDIFailure);


function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}

function onMIDISuccess(midiAccess) {
    for (var input of midiAccess.inputs.values()) {
        input.onmidimessage = getMIDIMessage;
    }
}

function handleKeyPress(midiMessage) {
    let command = midiMessage.data[0];
    let note = midiMessage.data[1];
    let velocity = midiMessage.data[2];

    switch (command) {
        case midiCommands[1][midiChannel]:
            if (velocity > 0) {
                noteOn(note, velocity);
            } else {
                noteOff(note);
            }
            break;
        case midiCommands[0][midiChannel]:
            noteOff(note);
            break;
        default: // maybe we are on the wrong midichannel. lets try to
					// determine the correct channel
        	if(typeof midiChannels[command] == 'undefined'){
        		;// the command is not a noteOn/Off message so ignore it
        	}else{
        		// change the channel!
        		midiChannel =  midiChannels[command];
        		console.log('changed midi channel to '+midiChannel);
        	}
    }
}

function noteOn(note, velocity) {
    let isPressed = false;
    let isCorrect = true;
    let questionNotes = [];
    
   // add the pressed key to the list of pressed keys
    for (var i = 0; i < keysDown.length; i++) {
        if (keysDown[i] == note) {
            isPressed = true;
            break;
        }
    }
    if (isPressed == false) {
        keysDown.push(note);
        playSample(note);
    }

    if (question.length == 0) {
        alert("please press 'start'");
        return false;
    }
    for (var q = 0; q < question.c.length; q++) {
        questionNotes.push(question.c[q]);
    }
    drawNotes(questionNotes);

    // determine if the pressed keys matches the question.
    if (keysDown.length != question.c.length) { // dont check unless ALL notes
												// are pressed
        return;
    } else {
    	
    	isCorrect=true;
        for (let i = 0; i < keysDown.length; i++) {
            if (keysDown[i] != question.c[i].cc) {
                isCorrect = false;
                break;
            }
            if (!isCorrect) break;
        }
        recordAnswer(isCorrect);
    }
}

function noteOff(note) {

    for (var i = 0; i < keysDown.length; i++) {
        if (keysDown[i] == note) {
            keysDown.splice(i, 1);
        }
    }

    if (keysDown.length == 0) {
        drawNotes(question.c);
        playQuestionNotes(questionPlayDelay,questionPlayNoteDelay);
    }
}

function recordAnswer(isCorrect) {

    // if correct then move the question farther to the bottom of the stack
    if (isCorrect) {
       
        // calculate a new rank
    	question.r += (question.a/(question.b+1));       
        
        /*
		 * if the new rank of the question causes the question to be put at the
		 * bottom of the stack, then do so and generate a new question
		 */
        if (question.r > stack.length &&(globalNth<allChords.length) ) {
            stack.push(question);

            // generate a new question to put at front of stack
            question = {c: [], r: 1, a: 1, b: 0};
            question.c = generateChord(globalNth);
            
        	globalNth++;    

        } else {
            stack.splice(Math.floor(question.r), 0, question);
            question = getQuestion();
        }

    } else {
    	question.b+=1.2; // how many times the question was answered wrong
        // reset the questions rank.
        // but dont put back in the stack til they answer it correctly
        question.r = 1;
    }

   
    updateQuestionHistory();
}


function initDatabase() {

    db = openDatabase('piano', '1.0', 'piano', 1000000);

    db.transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS questions ( nth INTEGER, clef INTEGER, json TEXT);', [],
            function (transaction, result) {
                ;// console.log('create table: ');console.log(result);
            }, function (tx, err) {
                console.log(err);
            });
    });

    // ensure that one record for each clef is present in the databse;
    db.transaction(function (tx) {
    	for(let clef=0;clef<3;clef++){
    	tx.executeSql('SELECT * FROM questions where clef=?', [selectedClef], function (tx, result) {
            if (result.rows.length == 0) {
                tx.executeSql('INSERT INTO questions(nth,clef,json) VALUES(?,?,?)', [1, clef, "[]"],
                    function (tx, result) {
                        console.log("inserted initial record");
                    }
                );
            }
        });
    	}
    });

    // TODO: dedupe database just in case
}

function dropTable() {
    db.transaction(function (tx) {
        tx.executeSql('DROP TABLE questions');
    });
}

var errCallback = function (err, foo) {
    console.log("database error ");
    console.log(err);
    console.log(foo);
}

function deleteQuestionHistory() {
    db.transaction(function (tx) {
        tx.executeSql('DELETE FROM questions', [],
            function (transaction, result) {
                globalNth = 1;
                stack = [];
            }
        );
    });
}

function updateQuestionHistory() {
    db.transaction(function (tx) {
        tx.executeSql('UPDATE questions SET nth = ?,json = ? where clef=?',
            [globalNth, JSON.stringify(stack), selectedClef]);
    }, function (tx, result) {
        ;// console.log("updateQuestionHistoryResult");
        ;// console.log(tx);
    }, function (err, foo) {
        ;// console.log("update question history error?");
        ;// console.log(err);
    });
}


function loadQuestionHistory() {
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM questions where clef=?', [selectedClef], loadStack);
    });
}

function loadStack(transaction, result) {
    stack = [];

    if (result.rows.length > 0) {
        try {
            stack = JSON.parse(result.rows[0].json);
            globalNth = result.rows[0].nth;
            selectedClef = result.rows[0].clef;
        } catch (error) {
            console.log("Unable to load question history from database");
            console.log(error);
            stack = [];
        }
    }
    console.log("loaded " + stack.length + " questions from database");
    if (result.rows.length > 1) {
        ;// TODO: there are too many records, delete the smallest one
    }
}
