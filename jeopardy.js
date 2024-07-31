// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];
let $btn = $("#startBtn");
let $board = $("#board");
let $spinner = $("#spinner");

//returns array of category IDs 
async function getCategoryIds() {
  let response = await axios.get(
    "https://rithm-jeopardy.herokuapp.com/api/categories",
    { params: { count: 100 } }
  );
  let idArr = response.data.map((val) => val.id);
  return idArr;
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */
async function getCategory(catId) {
  let response = await axios.get(
    "https://rithm-jeopardy.herokuapp.com/api/category",
    { params: { id: catId } }
  );
  let clueArr = response.data.clues.map((val) => ({
    question: val.question,
    answer: val.answer,
    showing: null,
  }));
  return { title: response.data.title, clues: clueArr };
}
//creates html table
function createTable() {
    //id for each td is  "col-{COLUMN NUM}-row-{ROW NUM}""
    $board.html(
        '<table><tr> <td id="col-1-row-1"></td><td id="col-2-row-1"></td><td id="col-3-row-1"></td><td id="col-4-row-1"></td><td id="col-5-row-1"></td><td id="col-6-row-1"></td> </tr><tr><td id="col-1-row-2"></td><td id="col-2-row-2"></td><td id="col-3-row-2"></td><td id="col-4-row-2"></td><td id="col-5-row-2"></td><td id="col-6-row-2"></td></tr><tr><td id="col-1-row-3"></td><td id="col-2-row-3"></td><td id="col-3-row-3"></td><td id="col-4-row-3"></td><td id="col-5-row-3"></td><td id="col-6-row-3"></td></tr><tr><td id="col-1-row-4"></td><td id="col-2-row-4"></td><td id="col-3-row-4"></td><td id="col-4-row-4"></td><td id="col-5-row-4"></td><td id="col-6-row-4"></td></tr><tr><td id="col-1-row-5"></td><td id="col-2-row-5"></td><td id="col-3-row-5"></td><td id="col-4-row-5"></td><td id="col-5-row-5"></td><td id="col-6-row-5"></td></tr><tr><td id="col-1-row-6"></td><td id="col-2-row-6"></td><td id="col-3-row-6"></td><td id="col-4-row-6"></td><td id="col-5-row-6"></td><td id="col-6-row-6"></td></tr></table>'
      );
}
// populates html table with data
async function fillTable() {
    //hiding table while it populates
    $board.addClass('hidden'); 
    createTable();
  let catIdArr = await getCategoryIds();
  //randomizing categories
  catIdArr = _.shuffle(catIdArr);
  //displaying category titles in first row and ? for other cells where y+2 is row num and x+1 is col num
  for (let x = 0; x <= 5; x++) {
    categories[x] = await getCategory(catIdArr[x]);
    $(`#col-${x + 1}-row-1`).text(categories[x].title);
    for (let y = 0; y <= 4; y++) {
      $(`#col-${x + 1}-row-${y + 2}`).text("?");
      //adding click event listeners to each td
      $(`#col-${x + 1}-row-${y + 2}`).on('click', (evt) => handleClick(evt));
    }
  }
  //showing table
  $board.removeClass('hidden');
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */
function handleClick(evt) {
  //getting catNum and clueNum from element id(column num and row num)
  let catNum = evt.target.id.toString()[4];
  let clueNum = evt.target.id.toString()[10];
  switch (categories[catNum - 1].clues[clueNum - 2].showing) {
    case null:
      $(`#${evt.target.id}`).text(
        categories[catNum - 1].clues[clueNum - 2].question
      );
      categories[catNum - 1].clues[clueNum - 2].showing = "question";
      break;
    case "question":
      $(`#${evt.target.id}`).text(
        categories[catNum - 1].clues[clueNum - 2].answer
      );
      break;
    case "answer":
      break;
  }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */
function showLoadingView() {
  $btn.addClass("disabled");
  $btn.text("loading...");
  $spinner.removeClass('hidden');
}

/** Remove the loading spinner and update the button used to fetch data. */
function hideLoadingView() {
  $btn.removeClass("disabled");
  $btn.text("Restart");
  $spinner.addClass('hidden');
}

//setting up game
async function setupAndStart() {
    showLoadingView();
    await fillTable();
    hideLoadingView();
} 
//On click of start / restart button, set up game
$btn.on('click', setupAndStart);

