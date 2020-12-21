
class DecisionTree {

  constructor(data) {
    this.initial = data.initial;
    this.choices = data.choices;

    this.init();
  }

  init() {
    const idList = [];
    
    for(var k in this.choices) {
      if(idList.indexOf(k) !== -1) throw new Error(`DecisionTree: duplicate ID "${k}" in choice set`);
      
      const choice = this.getChoice(k);
      choice.id = k;
      
      const children = this.getChildren(k);

      children.forEach(child => {
        if(child.parent) throw new Error(`DecisionTree: tried to assign parent "${k}" to child "${child}" which already has parent "${child.parent}"`);

        child.parent = k;
      });
      
    }
  }

  getInitial() {
    if (!this.initial) throw new Error('DecisionTree: no initial choice(s) specified');
    return this.getChoices(this.initial);
  }

  getChoice(id) {
    const choice = this.choices[id];
    if(!choice) return;
    if(!choice.id) choice.id = id;

    return choice;
  }

  getChoices(idList) {
    if(!idList) return [];

    return idList.map(x => this.getChoice(x));
  }

  getChildren(parentId) {
    const choice = this.choices[parentId];
    if(!choice || !choice.children) return;

    return this.getChoices(choice.children);
  }

  getParents(id) {
    const parents = [];
    let node = this.getChoice(id);
    
    while(node.parent) {
      node = this.getChoice(node.parent);
      parents.unshift(node);
    }
    
    return parents;
  }

  getParentIds(id) {
    const parents = this.getParents(id);

    return parents.map(p => p.id);
  };

  getParentName(id) {
    const parent = this.getParents(id).pop();
    if(!parent) return false;

    return parent.name;
  }

  getParentSubtitle(id) {
    const parent = this.getParents(id).pop();
    if(!parent) return false;

    return parent.subtitle;
  }

}

/** Data to pass into tree */
const data = {

  initial: [
    'insulin'
  ],

  choices: {
    
    // first level
    'insulin': {
      name: 'I need insulin',
      subtitle: 'What best describes your current situation?',
      children: [
        'insulin-script-ins', 
        'insulin-noscript-ins', 
        'insulin-script-noins', 
        'insulin-noscript-noins'
      ]
    },
    
    // path 1
    'insulin-noscript-noins': {
      name: 'I do NOT have a prescription, and I have NO insurance',
      subtitle: 'Do you live in one of the following states: AZ, CA, CT, FL, GA, IL, IN, MO, MT, NE, NY, OH, OR, PA, RI, SC, VT, VA, WA?',
      children: [
        'path-1-states-yes',
        'path-1-states-no'
      ]
    },

    'path-1-states-yes': {
      name: 'I live in one of those states',
      help: 'Check out Hello Doctor',
      children: []
    },

    'path-1-states-no': {
      name: 'I do NOT live in one of those states',
      subtitle: 'Are you eligible for health insurance or Medicaid/Medicare?',
      children: [
        'path-1-states-yes-eligible',
        'path-1-states-no-eligible'
      ]
    },

    'path-1-states-yes-eligible': {
      name: 'I am eligible for Medicare/Medicaid',
      help: 'Guided application advice',
      children: []
    },

    'path-1-states-no-eligible': {
      name: 'I am NOT eligible for Medicare/Medicaid',
      help: 'Consider going to urgent care or the ER and getting a Rx there, looking for cash-price doctors in your area, looking into local free public health options, or looking into the 340B drug pricing program',
      children: []
    },
    
    // path 2
    'insulin-noscript-ins': {
      name: 'I do NOT have a prescription, but I have commercial insurance',
      subtitle: 'Do you have a current care team?',
      children: [
        'path-2-yes-team',
        'path-2-no-team'
      ]
    },

    'path-2-yes-team': {
      name: 'I do have a current care team',
      help: 'Assist with contacting a doctor / be an advocate',
      children: []
    },

    'path-2-no-team': {
      name: 'I do NOT have a current care team',
      subtitle: 'Do you live in one of the following states: AZ, CA, CT, FL, GA, IL, IN, MO, MT, NE, NY, OH, OR, PA, RI, SC, VT, VA, WA?',
      children: [
        'path-2-no-team-yes-states',
        'path-2-no-team-no-states'
      ]
    },

    'path-2-no-team-yes-states': {
      name: 'I do live in one of those states',
      help: 'Check out Hello Doctor',
      children: []
    },

    'path-2-no-team-no-states': {
      name: 'I do NOT live in one of those states',
      help: 'You will need to get help finding a doctor in your network / region',
      children: []
    },
    
    // path 3
    'insulin-script-ins': {
      name: 'I have a prescription, and I have commercial insurance',
      subtitle: 'What best describes your current situation?',
      children: [
        'path-3-copay-high',
        'path-3-deductible-unpaid',
        'path-3-unreachable-doctor'
      ]
    },

    'path-3-copay-high': {
      name: 'My copay is high',
      subtitle: 'Do you live in one of the following states: CO, IL, ME, NM, NY, UT, VA, WA, WV?',
      children: [
        'path-3-copay-states',
        'path-3-copay-nostates'
      ]
    },

    'path-3-copay-states': {
      name: 'I live in one of those states',
      help: `Your co-pay is price-capped by legistation!`,
      children: []
    },

    'path-3-copay-nostates': {
      name: 'I do NOT live in one of those states',
      help: `Check out savings cards, Lilly COVID relief, Novolog/Sanofy $99 card without insurance, and GoodRX`,
      children: []
    },

    'path-3-deductible-unpaid': {
      name: 'My deductible is not paid',
      subtitle: 'Do you live in one of the following states: CO, IL, ME, NM, NY, UT, VA, WA, WV?',
      children: [
        'path-3-deductible-states',
        'path-3-deductible-nostates'
      ]
    },

    'path-3-deductible-states': {
      name: 'I live in one of those states',
      help: `Your co-pay is price-capped by legistation!`,
      children: []
    },

    'path-3-deductible-nostates': {
      name: 'I do NOT live in one of those states',
      help: `Check out savings cards, Lilly COVID relief, Novolog/Sanofi $99 card without insurance, and GoodRX`,
      children: []
    },

    'path-3-unreachable-doctor': {
      name: 'I can\'t reach my doctor for a Rx renewal',
      subtitle: 'Do you live in one of the following states: AZ, CA, CT, FL, GA, IL, IN, MO, MT, NE, NY, OH, OR, PA, RI, SC, VT, VA, WA?',
      children: [
        'path-3-doctor-states',
        'path-3-doctor-nostates'
      ]
    },

    'path-3-doctor-states': {
      name: 'I live in one of those states',
      help: `Check out Hello Doctor`,
      children: []
    },

    'path-3-doctor-nostates': {
      name: 'I do NOT live in one of those states',
      subtitle: 'Do you live in one of these states instead: AZ, AK, CO, CT, FL, ID, IN, IL, KT, MN, MD, NH, OH, OK, OR, PA, TN, SC, UT, WV, WI?',
      children: [
        'path-3-doctor-nostates-states',
        'path-3-doctor-nostates-nostates'
      ]
    },

    'path-3-doctor-nostates-states': {
      name: 'I live in one of these states',
      help: `Kevin's Law (emergency Rx refill) can be invoked at a pharmacy`,
      children: []
    },

    'path-3-doctor-nostates-nostates': {
      name: 'I do NOT live in one of these states',
      help: `Get an Rx from urgent care or the ER, or find another doctor in the area`,
      children: []
    },
    
    // path 4
    'insulin-script-noins': {
      name: 'I have a prescription, but I have NO insurance',
      subtitle: 'What kind of insulin do you use?',
      children: [
        'path-4-eli', 
        'path-4-novo', 
        'path-4-sanofi',
        'path-4-none'
      ]
    },

    'path-4-eli': {
      name: 'Eli Lilly (Basalgar, Humulin, Humalog)',
      help: 'Try the Eli Lilly $30 Rx card, or their PAP',
      children: []
    },

    'path-4-novo': {
      name: 'Novo Nordisk (Fiasp, Levemir, Novolin, Novolog, Tresiba)',
      help: 'Try the Novo Nordisk $99 Rx card, or their PAP',
      children: []
    },

    'path-4-sanofi': {
      name: 'Sanofi (Apidra, Admelog, Lantus, Toujeo)',
      help: 'Try the Sanofi $99 Rx card, or their PAP',
      children: []
    },

    'path-4-none': {
      name: 'I\'ve tried these options, but they don\'t work for me',
      help: 'You could try getting generic insulin, leveraging the 340B drug pricing program, or using a Canadian pharmacy online',
      children: []
    }
    
  }
};

/** Init tree, events */
$(() => {
  const tree = new DecisionTree(data);
  const $list = $('#choices');
  const $title = $('#title');
  const $subtitle = $('#subtitle');
  const $help = $('#help');
  const $back = $('#back');

  $back.hide();
  
  let currentId = null;
  
  const renderList = (items) => {
    if(!items || !items[0]) return;
    
    const title = tree.getParentName(items[0].id) || 'What is your current situation?';
    $title.text(title);
    
    const subtitle = tree.getParentSubtitle(items[0].id) || '';
    $subtitle.text(subtitle);
    
    $list.empty();

    items.forEach(item => {
      $list.append(`
      <li>
        <a href="#" data-choice="${item.id}" data-help="${item.help || ''}">${item.name}</a>
      </li>
      `);
    });
  };

  const renderHelp = (help = '') => {
    $help.text(help);
  };
  
  const renderInitial = () => {
    const initData = tree.getInitial();
    currentId = null;
    renderList(initData);
  };
  
  $(document).on('click', '#choices a', (e) => {
    e.preventDefault();
    
    const choiceId = $(e.target).data('choice');
    const help = $(e.target).data('help');
    const kids = tree.getChildren(choiceId);

    $back.show();

    if(kids && kids.length > 0) {
      currentId = choiceId;
      renderList(kids);
      renderHelp('');

    } else if(help) {
      renderHelp(help);
    }
  });
  
  $back.on('click', (e) => {
    e.preventDefault();
    renderHelp('');

    if(!currentId) return false;
    
    const parents = tree.getParents(currentId);
    
    if(parents.length > 0) {
      const prevNode = parents.pop();
      currentId = prevNode.id;
      renderList(tree.getChildren(prevNode.id));

    } else {
      renderInitial();
      $back.hide();
    }
    
  });

  renderInitial();

});

