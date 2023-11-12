/**
 *  Find first ancestor matching filter, including node.
 *  Similar to `node.find()` (https://github.com/d3/d3-hierarchy#node_find) but checks ancestors instead of descendants
 */
export function findAncestor(node, filter) {
    while (node) {
        if (filter(node)) {
            return node;
        }
        node = node.parent;
    }
    return null;
}
