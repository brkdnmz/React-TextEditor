export const goToNextLeafNode = (node) => {
  while (node && !node.nextSibling) {
    node = node.parentNode;
  }

  node = node.nextSibling;

  while (node.firstChild) {
    node = node.firstChild;
  }

  return node;
};

export const goToPrevLeafNode = (node, root) => {
  while (node && !node.previousSibling && node !== root) {
    node = node.parentNode;
  }

  if (node === root) return null;

  node = node.previousSibling;

  while (node.lastChild) {
    node = node.lastChild;
  }

  return node;
};

export const textLength = (node) => {
  return node.textContent.length;
};

export const isEmpty = (node) => {
  return textLength(node) === 0;
};

export const createEmptyLine = () => {
  const line = document.createElement("div");
  line.innerHTML = "<br>";
  return line;
};

export const isText = (node) => {
  return node.nodeType === Node.TEXT_NODE;
};

export const isBetween = (x, a, b) => {
  return a <= x && x <= b;
};
