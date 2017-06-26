// Filename: zagtree.js  
// Timestamp: 2016.12.26-21:42:00 (last modified)
// Author(s): Bumblehead (www.bumblehead.com)  
//
// method returns array of 'tree' objects whose 'nodes' are defined with 
// column info useful for rendering in non-overlapping way like this:
//
// +-----------------------+
// | 30,150                |
// |                       |
// |                       |
// +-----------------------+
//
// +-----------+
// | 540,600   |
// |           +-----------+
// +-----------+ 560,620   |
// +-----------+           |
// | 610,670   +-----------+
// |           |
// +-----------+
//

const zagtree = module.exports = (o => {
  
  o.node = {
    period : null,
    start  : 0,
    end    : 0,
    col    : 0
  },

  o.tree = {
    hnode : null,
    lnode : null,

    start : 0,
    end   : 0,

    maxstart : 0,
    maxend   : 0,

    colArr : []
  };

  // period must include 'start' and 'end'
  o.newnode = period =>
    Object.assign({}, o.node, period);
  
  o.newtree = opts =>
    Object.assign({}, o.tree, {
      colArr   : [],
      nodeArr  : [],
      maxstart : (opts && opts.maxstart) || 0,
      maxend   : (opts && opts.maxend) || Infinity
    });    

  o.isnodevalid = n => Boolean(
    typeof n === 'object' && n
      && typeof n.start === 'number' 
      && typeof n.end === 'number'
      && n.start < n.end);

  o.istreenodevalid = (tree, node) =>
    o.isnodevalid(node) && o.isnodeinside(tree, node);

  o.isnodesame = (n1, n2) => 
    n1.start === n2.start && n1.end === n2.end;

  o.isnodeoverlap = (n1, noverlap) => 
    n1.start <= noverlap.end && n1.end >= noverlap.start;

  o.isnodeinside = (n1, ninside) =>
    n1.start <= ninside.start && n1.end >= ninside.end;

  o.isnodebeyond = (n1, nbeyond) =>
    n1.end < nbeyond.start;

  o.isnodestartafter = (n1, nafter) =>
    n1.start < nafter.start ? -1 : 1;

  // if tree has no nodes, 
  //   node is viable as first node in tree
  // if tree has nodes, 
  //   given node must overlap clearance of tree's nodes
  //   (assumes viable existing nodes, added in decreasing order)  
  o.istreenodeviable = (tree, node) =>
    Boolean(!tree.lnode || tree.end > node.start);

  o.addtreenode = (tree, node) => {
    tree.nodeArr.push(node);
    tree.lnode = node;
    tree.colArr[node.col] = node;

    if (tree.hnode) {
      if (tree.hnode.col === node.col) {
        tree.hnode = o.gettreecnode(tree);
      } else if (tree.hnode.end > node.end) {
        tree.hnode = node;
      }
    } else {
      tree.hnode = node;
    }

    if (node.end > tree.end) {
      tree.end = node.end;
    }
    
    return tree;
  };

  o.addfirstnode = (tree, node) => {
    node.col = 0;
    
    return o.addtreenode(tree, node);
  };

  // should redefine hnode
  o.addchildnode = (tree, pnode, node) => {
    node.col = pnode.col;
    
    return o.addtreenode(tree, node);
  };

  o.addrightnode = (tree, node) => {
    node.col = tree.colArr.length;
    
    return o.addtreenode(tree, node);
  };

  o.gettreecnode = (tree) => {
    let colArr = tree.colArr,
        index = colArr.length - 1,
        hnode = colArr[index];
    
    for (index; index--;) {
      if (hnode.end > colArr[index].end) {
        hnode = colArr[index];
      }
    }

    return hnode;
  };

  // travel 'qnode' column to last column,
  //   return first node for which 'node' is beyond
  o.getfirstclearancenoderight = (tree, qnode, node) => {
    let colArr = tree.colArr, 
        end = colArr.length, 
        col = qnode.col;

    for (col; col < end; col++) {
      if (o.isnodebeyond(colArr[col], node)) {
        return colArr[col];
      }
    }
  };

  // travel 'qnode' column to first column,
  //   return first node for which 'node' is beyond
  o.getfirstclearancenodeleft = (tree, qnode, node) => {
    let colArr = tree.colArr, 
        col = qnode.col;

    for (col; col >= 0; col--) {
      if (o.isnodebeyond(colArr[col], node)) {
        return colArr[col];
      }
    }
  };

  // return a cnode for which 'node' is beyond,
  // cnode could a suitable parent for 'node'
  o.getfirstclearancenode = (tree, node) => {
    let hnode = tree.hnode,
        lnode = tree.lnode,
        cnode;

    if (o.isnodebeyond(hnode, node)) {
      if (lnode.col >= hnode.col) {
        // hnode on left side, it will return a cnode
        cnode = o.getfirstclearancenodeleft(tree, lnode, node);
      } else {
        cnode = o.getfirstclearancenoderight(tree, lnode, node);
      }
    }

    return cnode;
  };
  
  // 
  //  +---------+                        +---------+
  //  |         +---------+              |         +---------+
  //  |         |         |              |         |         |
  //  |         |         +----------+   |         |         +----------+
  //  +---------+         | hnode    |   +---------+         | hnode    |
  //  +---------+         |          |   +---------+         |          |
  //  | pnode   |         +----------+   | pnode   |         +----------+
  //  |         +---------+              |         +---------+----------+
  //  |         |                        |         |         | node     |
  //  |         |                        |         |         |          |
  //  |         |                        |         |         +----------+
  //  +---------+                        +---------+
  //
  // - node names are pnode (parent), lnode (last), hnode (highest)
  // - nodes are parented to or married at right of existing node
  // - a node is defined at tree.lnode when added, lnode is last node
  // - a node is defined in tree.colArr[colNumber] when added
  // - tree.colArr[colNumber] is 'lowest' node in tree for colNumber
  // - a node is defined as hnode (highest) when added if higher than
  //   existing hnode
  //
  // psuedo-algorithm
  // - if (node start/top beyond lnode end/bottom)
  //     - child node to lnode
  // - else (node start/top overlaps lnode)
  //   - if a ?pnode is found on hnode-side end column to pnode
  //     - child node to ?pnode
  //   - else if ?pnode is found on other-side end column to pnode
  //     - child node to ?pnode
  //   - else marry node lowest node in right-most column
  o.addnode = (tree, node) => {
    let pnode; 

    if (tree.hnode) {
      if (o.isnodebeyond(tree.lnode, node)) {
        if (tree.lnode.col < tree.hnode.col) {
          tree = o.addchildnode(tree, tree.lnode, node);
        } else {
          tree = o.addchildnode(tree, tree.hnode, node);
        }
      } else { // overlaps lnode
        pnode = o.getfirstclearancenode(tree, node);
        if (pnode) {
          tree = o.addchildnode(tree, pnode, node);
        } else {
          tree = o.addrightnode(tree, node);
        }
      }
    } else {
      tree = o.addfirstnode(tree, node);
    }

    return [tree, node];
  };

  o.addperiod = (tree, p) => {
    if (!o.isnodevalid(p)) {
      throw new Error('invalid period');
    }

    return o.addnode(tree, o.newnode(p));
  };

  // ex.,
  // zagtree.gettreearrfromperiodarr([{
  //   start: 30, 
  //   end: 150
  // }, {
  //   start: 540, 
  //   end: 600
  // }, {
  //   start: 560, 
  //   end: 620
  // }, {
  //   start: 610, 
  //   end: 670
  // }], {
  //   maxstart : 0,
  //   maxend : 720
  // });
  //
  o.gettreearrfromperiodarr = (pArr, treeOpts) => {
    let treeArr = [],
        decrArr;

    if (!Array.isArray(pArr)) {
      throw new Error('invalid period array');
    }

    decrArr = pArr.sort(o.isnodestartafter);
    treeArr = (function next (treeArr, decrArr, tree, x, l) {

      tree = o.newtree(treeOpts);
      if (decrArr){
        for (x = 0, l = decrArr.length; x < l; x++) {
          if (o.istreenodeviable(tree, decrArr[x])) {
            [tree] = o.addperiod(tree, decrArr[x]);
          } else {
            treeArr = next(treeArr, decrArr.slice(x));
            break;
          }
        }          
      }
      
      treeArr.push(tree);
      return treeArr;

    }(treeArr, decrArr));

    return treeArr;
  };

  return o;

})({});
