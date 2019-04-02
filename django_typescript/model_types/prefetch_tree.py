import typing

from django_typescript.core import types


# =================================
# Prefetch Tree Resolver
# ---------------------------------

class PrefetchResolver(object):

    def __init__(self, trees: typing.List[types.PrefetchTree]):
        self.trees = trees
        self.root_fields: typing.List[str] = []
        self.children: typing.Dict[str, 'PrefetchResolver'] = {}

    def _resolve(self):
        for tree in self.trees:
            if isinstance(tree, str):
                self.root_fields.append(tree)
            if isinstance(tree, dict):
                for k, v in tree.items():
                    self.children[k] = PrefetchResolver(trees=[v])




