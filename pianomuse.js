var VF = null;
var question = [];
var score = null;
var system = null;
var pianoRoll = null;
var stack = []; // holds the list of asked questions and their rank
var midiMap = {};
var keysDown = []; // all the keys that the user is currently holding down on the keyboard
var artist = null;
var tab = null;
var renderer = null;
var samples = {};
var vexNotes = [];
var debug = {};
var db = {};
var allChords = [];
let comboPtr = 1;
let mute = false;
let muteButton = {};
let messageBox = {};
let playQuestion = false; // if true the play the sound of the piano notes that make up the question
let procId=null;
let questionPlayDelaySlider={};
let questionPlayDelayLabel={};
let questionPlayDelayDiv={};
let questionPlayDelay=0;

function startUp() {
    pianoRoll = document.getElementById("pianoRoll");
    muteButton = document.getElementById("muteButton");
    messageBox = document.getElementById("message");
    questionPlayDelayDiv= document.getElementById("questionPlayDelayDiv");
    questionPlayDelayLabel = document.getElementById('questionPlayDelayLabel');
    questionPlayDelaySlider = document.getElementById("questionPlayDelay");
    questionPlayDelaySlider.oninput = function() {
        if(this.value>0){
            questionPlayDelayLabel.innerHTML = "after "+(this.value/1000)+" seconds";
            questionPlayDelay=this.value;
        }else{
            questionPlayDelayLabel.innerHTML="";
        }
    }
    debug = document.getElementById("debug");
    VF = Vex.Flow;
    renderer = new VF.Renderer(pianoRoll, VF.Renderer.Backends.SVG);
    //renderer.ctx.setFillStyle("green"); //this works!

    initDatabase();
    loadQuestionHistory()

    // A list of all piano keys that will be practiced in order of appearance
    vexNotes = [
        /*
        36:{clef: "bass", keys: ["C/2"], duration: "h",cc:36,w:true },
        37:{clef: "bass", keys: ["C#/2"], duration: "h",cc:37 },
        38:{clef: "bass", keys: ["D/2"], duration: "h",cc:38 },
        39:{clef: "bass", keys: ["D#/2"], duration: "h",cc:39 },
        40:{clef: "bass", keys: ["E/2"], duration: "h",cc:40 },
        */

        {clef: "treble", keys: ["C/4"], duration: "h", cc: 60, w: true}, //middle-C
        {clef: "treble", keys: ["D/4"], duration: "h", cc: 62, w: true},
        {clef: "treble", keys: ["E/4"], duration: "h", cc: 64, w: true},
        {clef: "treble", keys: ["F/4"], duration: "h", cc: 65, w: true},
        {clef: "treble", keys: ["G/4"], duration: "h", cc: 67, w: true},
        {clef: "treble", keys: ["A/4"], duration: "h", cc: 69, w: true},
        {clef: "treble", keys: ["B/4"], duration: "h", cc: 71, w: true},

        {clef: "treble", keys: ["C#/4"], duration: "h", cc: 61, w: false},
        {clef: "treble", keys: ["D#/4"], duration: "h", cc: 63, w: false},
        {clef: "treble", keys: ["F#/4"], duration: "h", cc: 66, w: false},
        {clef: "treble", keys: ["G#/4"], duration: "h", cc: 68, w: false},
        {clef: "treble", keys: ["A#/4"], duration: "h", cc: 70, w: false},

        {clef: "treble", keys: ["D@/4"], duration: "h", cc: 61, w: false},
        {clef: "treble", keys: ["E@/4"], duration: "h", cc: 63, w: false},
        {clef: "treble", keys: ["G@/4"], duration: "h", cc: 66, w: false},
        {clef: "treble", keys: ["A@/4"], duration: "h", cc: 68, w: false},
        {clef: "treble", keys: ["B@/4"], duration: "h", cc: 70, w: false},

        {clef: "bass", keys: ["C/3"], duration: "h", cc: 48, w: true},
        {clef: "bass", keys: ["D/3"], duration: "h", cc: 50, w: true},
        {clef: "bass", keys: ["E/3"], duration: "h", cc: 52, w: true},
        {clef: "bass", keys: ["F/3"], duration: "h", cc: 53, w: true},
        {clef: "bass", keys: ["G/3"], duration: "h", cc: 55, w: true},
        {clef: "bass", keys: ["A/3"], duration: "h", cc: 57, w: true},
        {clef: "bass", keys: ["B/3"], duration: "h", cc: 59, w: true},

        {clef: "bass", keys: ["C#/3"], duration: "h", cc: 49, w: false},
        {clef: "bass", keys: ["D#/3"], duration: "h", cc: 51, w: false},
        {clef: "bass", keys: ["F#/3"], duration: "h", cc: 54, w: false},
        {clef: "bass", keys: ["G#/3"], duration: "h", cc: 56, w: false},
        {clef: "bass", keys: ["A#/3"], duration: "h", cc: 58, w: false},

        {clef: "bass", keys: ["D@/3"], duration: "h", cc: 49, w: false},
        {clef: "bass", keys: ["E@/3"], duration: "h", cc: 51, w: false},
        {clef: "bass", keys: ["G@/3"], duration: "h", cc: 54, w: false},
        {clef: "bass", keys: ["A@/3"], duration: "h", cc: 56, w: false},
        {clef: "bass", keys: ["B@/3"], duration: "h", cc: 58, w: false},

        /*
        {clef: "bass", keys: ["B/2"], duration: "h", cc: 47, w: true},
        {clef: "bass", keys: ["B@/2"], duration: "h", cc: 46, w: false},
        {clef: "bass", keys: ["A#/2"], duration: "h", cc: 46, w: false},
        {clef: "bass", keys: ["A/2"], duration: "h", cc: 45, w: true},
        {clef: "bass", keys: ["A@/2"], duration: "h", cc: 44, w: false},
        {clef: "bass", keys: ["G#/2"], duration: "h", cc: 44, w: false},
        {clef: "bass", keys: ["G/2"], duration: "h", cc: 43, w: true},
        {clef: "bass", keys: ["G@/2"], duration: "h", cc: 42, w: false},
        {clef: "bass", keys: ["F#/2"], duration: "h", cc: 42, w: false},
        {clef: "bass", keys: ["F/2"], duration: "h", cc: 41, w: true},
        {clef: "treble", keys: ["C/5"], duration: "h", cc: 72, w: true},
        */

    ];

    // https://www.piano-keyboard-guide.com/keyboard-chords.html
    allChords = [
        // Major chords
        // C major – C E G
        ["C", "E", "G"],
        // C# major – C# E# G#
        ["C#", "F", "G#"],
        // D major – D F# A
        ["D", "F#", "G#"],
        // Eb major – Eb G Bb
        ["E@", "G", "b@"],
        // E major – E G# B
        ["E", "G#", "B"],
        // F major – F A C
        ["F", "A", "C"],
        // F# major – F# A# C#
        ["F#", "A#", "C#"],
        // G major – G B D
        ["G", "B", "D"],
        // Ab major – Ab C Eb
        ["A@", "C", "E@"],
        // A major – A C# E
        ["A", "C#", "E"],
        // Bb major – Bb D F
        ["B@", "D", "F"],
        // B major – B D# F#
        ["B", "D#", "F#"],

        // Minor chords
        // C minor – C Eb G
        ["C", "E@", "G"],
        // C# minor – C# E G#
        ["C#", "E", "G#"],
        // D minor – D F A
        ["D", "F", "A"],
        // Eb minor – Eb Gb Bb
        ["E@", "G@", "B@"],
        // E minor – E G B
        ["E", "G", "B"],
        // F minor – F Ab C
        ["F", "A@", "C"],
        // F# minor – F# A C#
        ["F#", "A", "C#"],
        // G minor – G Bb D
        ["G", "B@", "D"],
        // Ab minor – Ab Cb(B) Eb
        ["A@", "B", "E@"],
        // A minor – A C E
        ["A", "C", "E"],
        // Bb minor – Bb Db F
        ["B@", "D@", "F"],
        // B minor – B D F#
        ["B", "D", "F#"],
        // Diminished chords
        // C diminished – C Eb Gb
        ["C", "E@", "G@"],
        // C# diminished – C# E G
        ["C#", "E", "G"],
        // D diminished – D F Ab
        ["D", "F", "A@"],
        // Eb diminished – Eb Gb Bbb(A)
        ["E@", "G@", "A"],
        // E diminished – E G Bb
        ["E", "G", "B@"],
        // F diminished – F Ab Cb(B)
        ["F", "A@", "B"],
        // F# diminished – F# A C
        ["F#", "A", "C"],
        // G diminished – G Bb Db
        ["G", "B@", "D@"],
        // Ab diminished – Ab Cb Ebb(D)
        ["A@", "B", "D"],
        // A diminished – A C Eb
        ["A", "C", "E@"],
        // Bb diminished – Bb Db Fb(E)
        ["B@", "D@", "E"],
        // B diminished – B D F
        ["B", "D", "F"],

        // Major 7th chords
        // C major seventh – C E G B
        ["C", "E", "G", "B"],
        // C# major seventh – C# E#(F) G# B#(C)
        ["C#", "F", "G#", "C"],
        // D major seventh – D F# A C#
        ["D", "F#", "A", "C#"],
        // Eb major seventh – Eb G Bb D
        ["E@", "G", "B@", "D"],
        // E major seventh – E G# B D#
        ["E", "G#", "B", "D#"],
        // F major seventh – F A C E
        ["F", "A", "C", "E"],
        // F# major seventh – F# A# C# E#(F)
        ["F#", "A#", "C#", "F"],
        // G major seventh – G B D F#
        ["G", "B", "D", "F#"],
        // Ab major seventh – Ab C Eb G
        ["A@", "C", "E@", "G"],
        // A major seventh – A C# E G#
        ["A", "C#", "E", "G#"],
        // Bb major seventh – Bb D F A
        ["B@", "D", "F", "A"],
        // B major seventh – B D# F# A#
        ["B", "D#", "F#", "A#"],
        // Dominant 7th chords
        // C dominant seventh – C E G Bb
        ["C", "E", "G", "B@"],
        // C# dominant seventh – C# E#(F) G# B
        ["C#", "F", "G#", "B"],
        // D dominant seventh – D F# A C
        ["D", "F#", "A", "C"],
        // Eb dominant seventh – Eb G Bb Db
        ["E@", "G", "B@", "D@"],
        // E dominant seventh – E G# B D
        ["E", "G#", "B", "D"],
        // F dominant seventh – F A C Eb
        ["F", "A", "C", "E@"],
        // F# dominant seventh – F# A# C# E
        ["F#", "A#", "C#", "E"],
        // G dominant seventh – G B D F
        ["G", "B", "D", "F"],
        // Ab dominant seventh – Ab C Eb Gb
        ["A@", "C", "E@", "G@"],
        // A dominant seventh – A C# E G
        ["A", "C#", "E", "G"],
        // Bb dominant seventh – Bb D F Ab
        ["B@", "D", "F", "A@"],
        // B dominant seventh – B D# F# A
        ["B", "D#", "F#", "A"],

        //Minor 7th Keyboard Chords
        // C minor seventh – C Eb G Bb
        ["C", "E@", "G", "B@"],
        // C# minor seventh – C# E G# B
        ["C#", "E", "G#", "B"],
        // D minor seventh – D F A C
        ["D", "F", "A", "C"],
        // Eb minor seventh – Eb Gb Bb Db
        ["E@", "G@", "B@", "D@"],
        // E minor seventh – E G B D
        ["E", "G", "B", "D"],
        // F minor seventh – F Ab C Eb
        ["F", "A@", "C", "E@"],
        // F# minor seventh – F# A C# E
        ["F#", "A", "C#", "E"],
        // G minor seventh – G Bb D F
        ["G", "B@", "D", "F"],
        // Ab minor seventh – Ab Cb(B) Eb Gb
        ["A@", "B", "E@", "G@"],
        // A minor seventh – A C E G
        ["A", "C", "E", "G"],
        // Bb minor seventh – Bb Db F Ab
        ["B@", "D@", "F", "A@"],
        // B minor seventh – B D F# A
        ["B", "D", "F#", "A"],

        // Minor 7th flat five chords
        // C minor seventh flat five – C Eb Gb Bb
        ["C", "E@", "G@", "B@"],
        // C# minor seventh flat five – C# E G B
        ["C#", "E", "G", "B"],
        // D minor seventh flat five – D F Ab C
        ["D", "F", "A@", "C"],
        // Eb minor seventh flat five – Eb Gb Bbb(A) Db
        ["E@", "G@", "A", "D@"],
        // E minor seventh flat five – E G Bb D
        ["E", "G", "B@", "D"],
        // F minor seventh flat five – F Ab Cb(B) Eb
        ["F", "A@", "B", "E@"],
        // F# minor seventh flat five – F# A C E
        ["F#", "A", "C", "E"],
        // G minor seventh flat five – G Bb Db F
        ["G", "B@", "D@", "F"],
        // Ab minor seventh flat five – Ab Cb Ebb(D) Gb
        ["A@", "B", "D", "G@"],
        // A minor seventh flat five – A C Eb G
        ["A", "C", "E@", "G"],
        // Bb minor seventh flat five – Bb Db Fb(E) Ab
        ["B@", "D@", "E", "A@"],
        // B minor seventh flat five – B D F A
        ["B", "D", "F", "A"]
    ];

    // load notes
    for (let i in vexNotes) {
        midiMap[vexNotes[i].cc] = vexNotes[i];

        //TODO: handle the case when the sample cannot be found
        samples[vexNotes[i].cc] = new Audio("./samples/Piano" + vexNotes[i].cc + ".wav");
    }

    // draw a blank sheet
    drawNotes([]);
}

function about(){
    if(messageBox.innerHTML.length>2){
        messageBox.innerHTML="";
        return;
    }
    messageBox.innerHTML="Piano Muse uses a Leitner method to show you notes that you have the most difficulty memorizing.<br>"+
        "Just click 'start' and press the key on your Midi keyboard that matches the notes displayed on the staff.<br>"+
        "Piano Muse will store your progress (on your computer) and will pick up where you left off.<br>"+
        "Note: only two octaves on your keyboard are used for practice. If the Muse is not responding to your keyboard then try a different octave.<br>"+
        "Contact me for questions: saidwords@gmail.com";
}

function begin() {
    // get a question and draw it on the stave
    question = getQuestion();
    drawNotes(question.c);
    playQuestionNotes(questionPlayDelay);
}

function setPlayQuestion(e) {
    playQuestion = e.checked;
    if(playQuestion){
        questionPlayDelayDiv.style="";
        if(questionPlayDelay==0){
            questionPlayDelaySlider.value=1000;
            questionPlayDelay=1000;
            questionPlayDelaySlider.oninput();
        }
    }else{
        questionPlayDelayDiv.style="display:none";
    }
}

/*
TODO: test the midi range of the users keyboard
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
 * @param note
 */
function playSample(note) {
    if (mute) return false;
    if (stopSample(note)) {
        try {
            samples[note].play();
        } catch (err) {
            alert("There seems to be a problem with playing the audio. So I'm gonna mute it.")
            mute = true;
            mutePiano();
            return false;
        }
        return true;
    }
    return false;
}


function playQuestionNotes(delay) {
    if (!playQuestion) return;
    if(procId!==null){
        return;
    }
    // TODO: only play if there are no keys down and some time has passed
    procId = setTimeout(function(){
        procId=null;
        if(keysDown.length>0)return;
        for (let n = 0; n < question.c.length; n++) {
            playSample(question.c[n].cc);
        }

    },delay);

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
Returns a question in the form of
    {
        c:[]  Chord - an array of vexNote definitions
        r: int Rank - a value indicating how well the question has been memorized
    }
*/
function getQuestion() {
    // pull the next question from the top of the stack.
    // if stack is empty then generate a question
    let q = {};

    if (stack.length == 0) {
        chord = generateChord(1);
        q = {c: chord, r: 0};

    } else {
        q = stack.splice(0, 1);
        return q[0];
    }
    return q;
}

/*
notes - an array of midi values that represent notes
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

    var formatNotes = function (chord) {
        let s = "notes :h ";

        for (let i in chord) {
            s += chord[i].keys[0] + " ";

            if (keysDown.length > 0) {
                let correct = false;
                for (let k in keysDown) {
                    if (chord[i].cc - keysDown[k] == 0) {
                        correct = true;
                    }
                }

                // annotate note with name of note C#/4 etc...
                if (correct) {
                    let letter = chord[i].keys[0].slice(0, chord[i].keys[0].indexOf("/")).replace("@", "b");
                    s += " $.italic." + letter + (letter.length == 1 ? ' ' : '') + "$ ";
                } else {
                    s += "$  $";
                }
            } else {
                s += "$  $";
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

    // options reference here: https://github.com/0xfe/vextab/blob/master/src/vextab.coffee
    const artist = new vextab.Artist(10, 10, 750, {scale: 1.25});
    const tab = new vextab.VexTab(artist);

    tab.parse(data);
    artist.render(renderer);
}

/*
Returns the n'th chord out of the set of all possible chords
@param size int - the number of notes in the chord
*/
function generateChord(nth) {
    let combo = [];
    let chord = [];

    while (!isChord(combo) && nth < Number.MAX_SAFE_INTEGER - 1) {
        combo = [];
        chord = [];
        for (let i = 0; i < vexNotes.length; i++) {
            if ((nth & 2 ** i) > 0) {
                combo.push(vexNotes[i].keys[0]);
                chord.push(vexNotes[i]);
            }
        }

        nth++;
    }

    comboPtr = nth;
    return chord;
}

// if all of the notes are part or whole of any chord then return true
function isChord(notes) {
    let c = 0;
    if (notes.length == 0 || notes.length > 4) return false;

    for (let a = 0; a < allChords.length; a++) {
        if (notes.length <= allChords[a].length) { // only check chords that are at least as long as our notes
            c = 0;
            for (let i = 0; i < notes.length; i++) {
                let note = notes[i].slice(0, notes[i].indexOf("/"));
                for (let n = 0; n < allChords[a].length; n++) {
                    if (note == allChords[a][n]) {
                        c++; // count how many of our notes match this chord
                    }
                }
            }
            if (c == notes.length) { // all of our notes must exist in the chord
                return true;
            }
        }
    }
    return false;
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
        case 144:
            if (velocity > 0) {
                noteOn(note, velocity);
            } else {
                noteOff(note);
            }
            break;
        case 128:
            noteOff(note);
            break;
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
    if (keysDown.length != question.c.length) { // dont check unless ALL notes are pressed
        return;
    } else {
        keysDown.sort();
        question.c.sort();

        for (let i = 0; i < keysDown.length; i++) {
            isCorrect = false;
            for (let k = 0; k < question.c.length; k++) {
                if (keysDown[i] == question.c[k].cc) {
                    isCorrect = true;
                    break;
                }
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
        playQuestionNotes(questionPlayDelay);
    }
}

function recordAnswer(isCorrect) {

    // if correct then move the question farther to the bottom of the stack
    if (isCorrect) {
        question.r = Math.floor((question.r + 1) * 1.618); // calculate a new rank

        /*
        if the new rank of the question causes the question to
        be put at the bottom of the stack, then do so and
        generate a new question
        */
        if (question.r > stack.length) {
            stack.push(question);

            // generate a new question to put at front of stack
            chord = generateChord(comboPtr);
            question = {c: chord, r: 0};
        } else {
            stack.splice(question.r, 0, question);
            question = getQuestion();
        }

    } else {
        // reset the questions rank.
        // but dont put back in the stack til they answer it correctly
        question.r = 0;
    }

    updateQuestionHistory();
}


function initDatabase() {

    db = openDatabase('piano', '1.0', 'piano', 1000000);

    db.transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS questions ( nth INTEGER, json TEXT);', [],
            function (transaction, result) {
                ;//console.log('create table: ');console.log(result);
            }, function (tx, err) {
                console.log(err);
            });
    });

    // ensure that one record is present in the databse;
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM questions', [], function (tx, result) {
            if (result.rows.length == 0) {
                tx.executeSql('INSERT INTO questions(nth,json) VALUES(?,?)', [1, "[]"],
                    function (tx, result) {
                        console.log("inserted initial record");
                    }
                );
            }
        });
    });

    //TODO: dedupe database just in case
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
                comboPtr = 1;
                stack=[];
            }
        );
    });
}

function updateQuestionHistory() {
    db.transaction(function (tx) {
        tx.executeSql('UPDATE questions SET nth = ?,json = ?',
            [comboPtr, JSON.stringify(stack)]);
    }, function (tx, result) {
        ;//console.log("updateQuestionHistoryResult");
        ;//console.log(tx);
    }, function (err, foo) {
        ;//console.log("update question history error?");
        ;//console.log(err);
    });
}


function loadQuestionHistory() {
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM questions', [], loadStack);
    });
}

function loadStack(transaction, result) {
    stack = [];

    if (result.rows.length > 0) {
        try {
            stack = JSON.parse(result.rows[0].json);
            comboPtr = result.rows[0].nth;
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

