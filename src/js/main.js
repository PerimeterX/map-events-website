let DATA;
let METADATA;

const set1 = {
  browserSelect: null,
  browserVersionSelect: null,
  osSelect: null,
  osVersionSelect: null,
  apiSelect: null,
  ehContainer: null,
  container: null,
};

const set2 = {
  browserSelect: null,
  browserVersionSelect: null,
  osSelect: null,
  osVersionSelect: null,
  apiSelect: null,
  ehContainer: null,
  container: null,
};

const combinations = {
  browser: {},
  os: {},
};

function getEHs (browser, browserVersion, os, osVersion, api) {
  const btn = document.getElementById('no-combination-button');

  if (
    DATA[browser] &&
    DATA[browser][browserVersion] &&
    DATA[browser][browserVersion][os] &&
    DATA[browser][browserVersion][os][osVersion]
  ) {
    btn.style.display = 'none';
    return DATA[browser][browserVersion][os][osVersion][api] || ['this API has zero event handlers'];
  }

  const msg = `map for ${browser} ${browserVersion}, ${os} ${osVersion} event handlers does not exist`;

  console.error(msg);

  btn.textContent = `${msg} - would you like to add it and contribute to the project?`;
  btn.style.display = 'block';
}

function getEHsBySelectedOptions (setnum) {
  const set = getSet (setnum);
  return getEHs (
    set.browserSelect.options[set.browserSelect.selectedIndex].value,
    set.browserVersionSelect.options[set.browserVersionSelect.selectedIndex]
      .value,
    set.osSelect.options[set.osSelect.selectedIndex].value,
    set.osVersionSelect.options[set.osVersionSelect.selectedIndex].value,
    set.apiSelect.options[set.apiSelect.selectedIndex].value
  );
}

function getSet (setnum) {
  if (typeof setnum === 'object') {
    setnum = setnum.target.id;
  }

  let set;

  if (setnum.indexOf ('1') > -1) {
    set = set1;
  }
  if (setnum.indexOf ('2') > -1) {
    set = set2;
  }

  if (!set) {
    throw 'failed to get set';
  }

  return set;
}

function getData (cb) {
  fetch ('./data.json')
    .then (function (response) {
      return response.json ();
    })
    .then (function (myJson) {
      DATA = myJson;
      if (DATA && METADATA) {
        cb (DATA, METADATA, '1');
        cb (DATA, METADATA, '2');
      }
    });

  fetch ('./metadata.json')
    .then (function (response) {
      return response.json ();
    })
    .then (function (myJson) {
      METADATA = myJson;
      if (DATA && METADATA) {
        cb (DATA, METADATA, '1');
        cb (DATA, METADATA, '2');
      }
    });
}

function filterVersionsOut (setnum, comboList, select, selectVersion) {
  const set = getSet (setnum);

  const options = selectVersion.parentElement
    .getElementsByClassName ('menu')[0]
    .getElementsByClassName ('item');

  let firstEnabledElement;

  for (let i = 0; i < options.length; i++) {
    const option = options[i];

    const version = option.textContent;

    if (!comboList[select.value].includes (version)) {
      option.style.display = 'none';
    } else {
      if (option.style.display === 'none') {
        firstEnabledElement = option;
      }
      option.style.display = '';
    }
  }

  if (firstEnabledElement) {
    firstEnabledElement.click ();
  }
}

function onSelect (event, dontMarkDiffs = false) {
  const setnum = event.target.id.replace (/\D/g, '');
  const set = getSet (setnum);

  filterVersionsOut (setnum, combinations.browser, set.browserSelect, set.browserVersionSelect);
  filterVersionsOut (setnum, combinations.os, set.osSelect, set.osVersionSelect);

  while (set.ehContainer.firstChild) {
    set.ehContainer.removeChild (set.ehContainer.firstChild);
  }

  const arr = getEHsBySelectedOptions (setnum); //.sort();
  if (!arr) {
    return;
  }

  for (let i = 0; i < arr.length; i++) {
    const eh = arr[i];
    const ehA = document.createElement ('a');

    ehA.textContent = eh;
    ehA.id = eh.split(' ').join('') + '-' + setnum;
    ehA.style.margin = '10px';
    ehA.style.color = 'black';
    ehA.style.textDecoration = 'none';
    ehA.href = `https://www.google.com/search?q=${set.apiSelect.options[set.apiSelect.selectedIndex].value}%20${eh}%20mdn`;
    ehA.target = '_blank';

    const div = document.createElement ('div');
    div.appendChild (ehA);

    set.ehContainer.appendChild (div);
  }

  !dontMarkDiffs && markDiffs ();
}

function load (data, metadata, setnum) {
  const props = {};

  function canUseProp (type, prop) {
    if (!props[type]) {
      props[type] = [];
    }

    if (props[type].includes (prop)) {
      return false;
    }

    props[type].push (prop);
    return true;
  }

  const set = getSet (setnum);

  for (const browser in data) {
    const browserImg = metadata[browser]['img'];
    const browserData = data[browser];

    if (canUseProp ('browser', browser)) {
      const browserOption = document.createElement ('option');

      browserOption.text = browser;
      browserOption.id = browser;
      browserOption.classList += 'browser';

      set.browserSelect.appendChild (browserOption);
    }

    for (const browserVersion in browserData) {
      const browserVersionData = browserData[browserVersion];

      if (!combinations.browser[browser]) {
        combinations.browser[browser] = [];
      }

      if (!combinations.browser[browser].includes (browserVersion)) {
        combinations.browser[browser].push (browserVersion);
      }

      if (canUseProp ('browserVersion', browserVersion)) {
        const browserVersionOption = document.createElement ('option');

        browserVersionOption.text = browserVersion;
        browserVersionOption.id = browserVersion;
        browserVersionOption.classList += 'version';

        set.browserVersionSelect.appendChild (browserVersionOption);
      }

      for (const os in browserVersionData) {
        const osData = browserVersionData[os];

        if (canUseProp ('os', os)) {
          const osOption = document.createElement ('option');

          osOption.text = os;
          osOption.id = os;
          osOption.classList += 'version';

          set.osSelect.appendChild (osOption);
        }

        for (const osVersion in osData) {
          const apis = osData[osVersion];

          if (!combinations.os[os]) {
            combinations.os[os] = [];
          }

          if (!combinations.os[os].includes (osVersion)) {
            combinations.os[os].push (osVersion);
          }

          if (canUseProp ('osVersion', osVersion)) {
            const osVersionOption = document.createElement ('option');

            osVersionOption.text = osVersion;
            osVersionOption.id = osVersion;
            osVersionOption.classList += 'version';

            set.osVersionSelect.appendChild (osVersionOption);
          }

          for (const api in apis) {
            if (canUseProp ('api', api)) {
              const apiOption = document.createElement ('option');

              apiOption.text = api;
              apiOption.id = api;
              apiOption.classList += 'api';
              apiOption.style.color = 'red';

              if ('window' === api) {
                apiOption.selected = 'selected';
              }

              set.apiSelect.appendChild (apiOption);
            }
          }
        }
      }
    }
  }

  initDropDowns (setnum);
  onSelect ({target: {id: setnum}}, true);

  setTimeout (setMode);
  setTimeout (setDisplay);
}

function init (setnum) {
  const set = getSet (setnum);
  set.container = document.querySelector ('#container-' + setnum);
  set.browserSelect = document.querySelector ('#browser-select-' + setnum);
  set.browserVersionSelect = document.querySelector (
    '#browser-version-select-' + setnum
  );
  set.osSelect = document.querySelector ('#os-select-' + setnum);
  set.osVersionSelect = document.querySelector ('#os-version-select-' + setnum);
  set.apiSelect = document.querySelector ('#api-' + setnum);
  set.ehContainer = document.querySelector ('#eh-container-' + setnum);

  set.ehContainer.style.width = '100%';

  set.browserSelect.onchange = set.browserVersionSelect.onchange = set.osSelect.onchange = set.osVersionSelect.onchange = set.apiSelect.onchange = onSelect;
}

function initDropDowns (setnum) {
  $ ('#browser-select-' + setnum).dropdown ();
  $ ('#browser-version-select-' + setnum).dropdown ();
  $ ('#os-select-' + setnum).dropdown ();
  $ ('#os-version-select-' + setnum).dropdown ();
  $ ('#api-' + setnum).dropdown ();

  $ ('#api-' + setnum)[0].parentElement.style.width = '83%';
}

function main () {
  init ('1');
  init ('2');
  getData (load);
}

setTimeout (main, 100);
