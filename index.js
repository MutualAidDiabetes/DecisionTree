

var DecisionTree = function(data) {
  
  this.initial = data.initial;
  this.choices = data.choices;
  
  /* Return an array of choice objects for the root of the tree */
  this.getInitial = function() {
    
    if (!this.initial) throw 'DecisionTree: no initial choice(s) specified';
    return this.getChoices(this.initial);
    
  };
  
  /* Get full choice data by specific id */
  this.getChoice = function(id) {

    if (!(id in this.choices)) return false;
    if (!('id' in this.choices[id])) this.choices[id].id = id;
    return this.choices[id];
    
  };
  
  /* As above, but passing an array of choice IDs */
  this.getChoices = function(idList) {
    if(!idList) return [];
    var list = [];
    for(var i = 0, ln = idList.length; i < ln; i++) {
      var childChoice = this.getChoice(idList[i]);
      list.push(childChoice);
    }
    return list;
    
  };
  
  /* Get an array of choice data for a parent id */
  this.getChildren = function(parentId) {
    
    if (!(parentId in this.choices)) return false;
    if (!('children' in this.choices[parentId])) return false;
    
    var childIds = this.choices[parentId].children;
    return this.getChoices(childIds);
    
  };
  
  /* Get an array of choice data for the parent(s) of an id */
  this.getParents = function(id) {
    
    var parents = [];
    var node = this.getChoice(id);
    
    while(node.parent) {
      node = this.getChoice(node.parent);
      parents.unshift(node);
    }
    
    return parents;
    
  };
  
  /* Get just an array of ids for the parents of a specific id */
  this.getParentIds = function(id) {
    var parents = this.getParents(id);
    var parentIds = [];
    for(var i = 0, ln = parents.length; i < ln; i++) {
      parentIds.push(parents[i].id);
    }
    return parentIds;
  };
  
  /* Get the 'name' prop for the parent of an id */
  this.getParentName = function(id) {
    var parent = this.getParents(id).pop();
    if(!parent) {
      return false;
    } else {
      return parent.name;
    }
  };
  
  /* Get the 'name' prop for the parent of an id */
  this.getParentSubtitle = function(id) {
    var parent = this.getParents(id).pop();
    if(!parent) {
      return false;
    } else {
      return parent.subtitle;
    }
  };
  
  /* Init - insert ids into choice objects, check dups, associate parents, etc */
  this.init = function() {
    
    var idList = [];
    for(var k in this.choices) {
      if(idList.indexOf(k) !== -1) throw 'DecisionTree: duplicate ID "' + k + '" in choice set';
      
      var choice = this.getChoice(k);
      choice.id = k;
      
      var children = this.getChildren(k);
      for(var i = 0; i < children.length; i++) {
        
        var child = children[i];
        if(child.parent) throw 'DecisionTree: tried to assign parent "' + k + '" to child "' + choice.children[i] + '" which already has parent "' + child.parent + '"';
        child.parent = k;
       
      }
      
    }
        
  };
  
  this.init();
  
};


/*** TEST DATA ***/

var data = {

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
      subtitle: 'I live in one of the following states: CO, IL, ME, NM, NY, UT, VA, WA, WV',
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

/** TEST CODE **/

$(function() {
  
  var tree = new DecisionTree(data);
  var $list = $('#choices');
  var $title = $('#title');
  var $subtitle = $('#subtitle');
  var $help = $('#help');
  
  var current_id = null;
  
  var renderList = function(items) {

    if(!items || !items[0]) return;
    
    var title = tree.getParentName(items[0].id);
    if(title) {
      $title.text(title);
    } else {
      $title.text('What is your current situation?');
    }
    
    var subtitle = tree.getParentSubtitle(items[0].id);
    if(subtitle) {
      $subtitle.text(subtitle);
    } else {
      $subtitle.text('');
    }
    
    $list.empty();

    items.forEach(item => {
      $list.append(`
      <li>
        <a href="#" data-choice="${item.id}" data-help="${item.help || ''}">${item.name}</a>
      </li>
      `);
    });
  };

  var renderHelp = function(help) {
    if(help) {
      $help.text(help);
    } else {
      $help.text('');
    }
  }
  
  var _doInitial = function() {
      var initData = tree.getInitial();
      current_id = null;
      renderList(initData);
  };
  
  $(document).on('click', '#choices a', function(e) {
    e.preventDefault();
    var choiceId = $(this).data('choice');
    var help = $(this).data('help');
    
    var kids = tree.getChildren(choiceId);

    if(kids && kids.length > 0) {
      current_id = choiceId;
      renderList(kids);
      renderHelp('');
    } else if(help) {
      renderHelp(help);
    }
  });
  
  $('#back').on('click', function(e) {
    e.preventDefault();
    renderHelp('');

    if(!current_id) return false;
    
    var parents = tree.getParents(current_id);
    
    if(parents.length > 0) {
      var prev_node = parents.pop();
      current_id = prev_node.id;
      renderList(tree.getChildren(prev_node.id));
    } else {
      _doInitial();
    }
    
  });

  _doInitial();

  
});

