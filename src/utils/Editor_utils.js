export const nextLeafNode = (node) => {
  while (node && !node.nextSibling) {
    node = node.parentNode;
  }

  node = node.nextSibling;

  while (node.firstChild) {
    node = node.firstChild;
  }
  
  return node;
};
