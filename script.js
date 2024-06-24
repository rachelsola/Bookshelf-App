const reads = [];
const RENDER_EVENT = 'render_read';

const SAVED_EVENT = 'saved-read';
const STORAGE_KEY = 'READ_APPS';

function generateId(){
  return +new Date();
}

function generateReadObject(id, inputBookTitle, inputBookAuthor, inputBookYear, isComplete){
  return{
    id,
    inputBookTitle,
    inputBookAuthor,
    inputBookYear,
    isComplete
  }
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(reads);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() /* boolean */ {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function addRead(){
  const titleRead = document.getElementById('inputBookTitle').value;
  const writterRead = document.getElementById('inputBookAuthor').value;
  const yearRead = parseInt(document.getElementById('inputBookYear').value); // Mengonversi ke tipe Number

  const generateID = generateId();
  const readObject = generateReadObject(generateID, titleRead, writterRead, yearRead, false);
  reads.push(readObject);

  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
}


function makeRead(readObject) {
  const textTitle = document.createElement('h2');
  textTitle.innerText = readObject.inputBookTitle;

  const textWritter = document.createElement('p');
  textWritter.innerHTML = readObject.inputBookAuthor;

  const textYear = document.createElement('p');
  textYear.innerHTML = readObject.inputBookYear;

  const textContainer = document.createElement('div');
  textContainer.classList.add('inner');
  textContainer.append(textTitle, textWritter, textYear);

  const container = document.createElement('div');
  container.classList.add('item', 'shadow');
  container.append(textContainer);
  container.setAttribute('id', `read-${readObject.id}`);

  // Tombol trash
  const trashButton = document.createElement('button');
  trashButton.classList.add('trash-button');
  trashButton.addEventListener('click', function() {
    removeTask(readObject.id);
  });
  container.appendChild(trashButton);

  if (readObject.isComplete) {
    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');
    undoButton.addEventListener('click', function() {
      undoTaskFromCompleted(readObject.id);
    });
    container.appendChild(undoButton);
  } else {
    const checkButton = document.createElement('button');
    checkButton.classList.add('check-button');
    checkButton.addEventListener('click', function() {
      addTaskToCompleted(readObject.id);
    });
    container.appendChild(checkButton);
  }

  return container;
}

function removeTask(readId) {
  const readIndex = findReadIndex(readId);
  if (readIndex !== -1) {
    reads.splice(readIndex, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }
}

function addTaskToCompleted (readId){
  const readTarget = findRead (readId);

  if (readTarget == null) return;

  readTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function findRead (readId){
  for (const readItem of reads){
    if (readItem.id === readId){
      return readItem;
    }
  }
  return null;
}

function removeTaskFromCompleted(readId){
  const readTarget = findReadIndex(readId);

  if (readTarget === -1)return; 

  reads.splice(readTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
}

function undoTaskFromCompleted(readId){
  const readTarget = findRead(readId);

  if (readTarget == null) return;

  readTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
}

function findReadIndex (readId){
  for (const index in reads){
    if (reads[index].id === readId){
      return index;
    }
  }
  return -1;
}

function addTaskToCompleted(readId){
  const readTarget = findRead (readId);

  if (readTarget == null) return;

  readTarget.isComplete = true;
  // Memperbarui tampilan buku yang telah selesai dibaca
  renderCompletedBook(readTarget);
  document.dispatchEvent(new Event(RENDER_EVENT));

  saveData();
}

function renderCompletedBook(readObject) {
  const completedREADList = document.getElementById('completed-reads');
  const readElement = makeRead(readObject);
  completedREADList.appendChild(readElement);
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
 
  if (data !== null) {
    for (const read of data) {
      reads.push(read);
    }
  }
 
  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener('DOMContentLoaded', function () {
  const searchForm = document.getElementById('searchBook');
  const searchInput = document.getElementById('searchBookTitle');
  const uncompletedREADList = document.getElementById('reads');
  const completedREADList = document.getElementById('completed-reads');

  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const searchTerm = searchInput.value.trim().toLowerCase();
    searchBooks(searchTerm);
  });

  function searchBooks(term) {
    const uncompletedBooks = uncompletedREADList.querySelectorAll('.item');
    const completedBooks = completedREADList.querySelectorAll('.item');

    uncompletedBooks.forEach(function (book) {
      const title = book.querySelector('h2').innerText.trim().toLowerCase();
      if (title.includes(term)) {
        book.style.display = 'block';
      } else {
        book.style.display = 'none';
      }
    });

    completedBooks.forEach(function (book) {
      const title = book.querySelector('h2').innerText.trim().toLowerCase();
      if (title.includes(term)) {
        book.style.display = 'block';
      } else {
        book.style.display = 'none';
      }
    });
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('inputBook');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addRead();
  });
  
  // Menambahkan event listener untuk checkbox inputBookIsComplete
  const isCompleteCheckbox = document.getElementById('inputBookIsComplete');
  isCompleteCheckbox.addEventListener('change', function(event) {
    const isChecked = event.target.checked;
    if (isChecked) {
      // Jika checkbox dicentang, ambil ID buku terakhir yang ditambahkan
      const lastAddedBook = reads[reads.length - 1];
      if (lastAddedBook) {
        // Jika ada buku yang ditambahkan sebelumnya, tambahkan ke completed-reads
        addTaskToCompleted(lastAddedBook.id);
      } else {
        console.error('No book added yet!');
      }
    }
  });
});

document.addEventListener(RENDER_EVENT, function() {
  const uncompletedREADList = document.getElementById('reads');
  uncompletedREADList.innerHTML = '';

  const completedREADList = document.getElementById('completed-reads');
  completedREADList.innerHTML = '';

  for (const readItem of reads){
    const readElement = makeRead(readItem);
    if(!readItem.isComplete) {
      uncompletedREADList.append(readElement);
    } else {
      completedREADList.append(readElement);
    }
  }
});

document.addEventListener('DOMContentLoaded', function () {
  const searchForm = document.getElementById('searchBook');
  const searchInput = document.getElementById('searchBookTitle');
  const uncompletedREADList = document.getElementById('reads');
  const completedREADList = document.getElementById('completed-reads');

  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    const searchTerm = searchInput.value.trim().toLowerCase();
    searchBooks(searchTerm);
  });

  function searchBooks(term) {
    const uncompletedBooks = uncompletedREADList.querySelectorAll('.item');
    const completedBooks = completedREADList.querySelectorAll('.item');

    uncompletedBooks.forEach(function (book) {
      const title = book.querySelector('h2').innerText.trim().toLowerCase();
      if (title.includes(term)) {
        book.style.display = 'block';
      } else {
        book.style.display = 'none';
      }
    });

    completedBooks.forEach(function (book) {
      const title = book.querySelector('h2').innerText.trim().toLowerCase();
      if (title.includes(term)) {
        book.style.display = 'block';
      } else {
        book.style.display = 'none';
      }
    });
  }

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});