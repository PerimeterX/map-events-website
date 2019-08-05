CONFIG = {
  'normal-mode': 'Normal Mode',
  'diff-mode': 'Diff Mode',
  'display-diff-only': 'Display Differences Only',
  'display-everything': 'Display Everything',
};

let modeButton, displayButton;

function getEHElement (eh, setnum) {
  return document.querySelector (`#${eh.split(' ').join('')}-${setnum}`);
}

function unmarkDiff (eh, setnum, removeSimilars = false) {
  const e = getEHElement (eh, setnum);
  if (removeSimilars) {
    e.style.display = 'none';
  } else {
    e.style.display = 'block';
    e.style.color = 'black';
  }
}

function markDiff (eh, setnum) {
  getEHElement (eh, setnum).style.color = 'green';
}

function markDiffs (removeSimilars = false) {
  const ehs1 = getEHsBySelectedOptions ('1');
  const ehs2 = getEHsBySelectedOptions ('2');

  if (ehs1) {
    for (let i = 0; i < ehs1.length; i++) {
      const eh = ehs1[i];
      if (getMode () === 'diff-mode' && ehs2 && ehs2.indexOf (eh) === -1) {
        markDiff (eh, '1');
      } else {
        unmarkDiff (eh, '1', removeSimilars);
      }
    }
  }

  if (ehs2) {
    for (let i = 0; i < ehs2.length; i++) {
      const eh = ehs2[i];
      if (getMode () === 'diff-mode' && ehs1 && ehs1.indexOf (eh) === -1) {
        markDiff (eh, '2');
      } else {
        unmarkDiff (eh, '2', removeSimilars);
      }
    }
  }
}

function getMode () {
  return modeButton.textContent !== CONFIG['normal-mode']
    ? 'diff-mode'
    : 'normal-mode';
}

function setMode () {
  if (!modeButton) {
    modeButton = document.querySelector ('#mode-button');
    modeButton.onclick = setMode;
  }

  const container2 = document.querySelector ('#container-2');

  if (getMode () !== 'normal-mode') {
    container2.style.display = 'none';
    modeButton.textContent = CONFIG['normal-mode'];
  } else {
    container2.style.display = 'block';
    modeButton.textContent = CONFIG['diff-mode'];
  }

  markDiffs ();
  setDisplay ();
}

function getDisplay () {
  return displayButton.textContent !== CONFIG['display-diff-only']
    ? 'display-everything'
    : 'display-diff-only';
}

function setDisplay () {
  if (!displayButton) {
    displayButton = document.querySelector ('#display-button');
    displayButton.onclick = setDisplay;
  }

  if (getMode () === 'diff-mode') {
    displayButton.style.display = 'block';
    if ('display-everything' === getDisplay ()) {
      displayButton.textContent = CONFIG['display-diff-only'];
      markDiffs (true);
    } else {
      displayButton.textContent = CONFIG['display-everything'];
      markDiffs ();
    }
  } else {
    displayButton.style.display = 'none';
  }
}
